var qrcode = new QRCode("qrcode", {
    text: "",
    width: 128,
    height: 128,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});

chrome.storage.local.get('did', function (res) {
    qrcode.clear();
		qrcode.makeCode(res.did);
});

document.getElementById("create-did").addEventListener("click", () => {
	fetch('http://localhost:5000/graphql?query=%7BgenDID%7Bdid%2Cdid_keys%7D%7D').then(r => r.text()).then(result => {
    console.log(result);
    
    result_json = JSON.parse(result);
    
    var did = result_json.data.genDID.did;
    var did_keys = result_json.data.genDID.did_keys;
    
    document.getElementById('did').value = did;
    
    chrome.storage.local.set({
            did: did,
			json_keys: did_keys,
		}, function() {
			console.log("Keys saved!");
			loadJsonKeys();
		});
		
		qrcode.clear();
		qrcode.makeCode(did);
    })
});

document.getElementById("upload-keys").addEventListener("click", () => {
	var fileChooser = document.createElement("input");
fileChooser.type = 'file';

fileChooser.addEventListener('change', function (evt) {
  var f = evt.target.files[0];
  if(f) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      var json = JSON.parse(contents);
      document.getElementById('did').value = json.DID;
      /* Handle your document contents here */
      // document.location.href = url_array; // My extension's logic
      //console.log(contents)
      chrome.storage.local.set({
            did: json.DID,
			json_keys: contents,
		}, function() {
			console.log("Keys saved!");
			loadJsonKeys();
		});
		
		qrcode.clear();
		qrcode.makeCode(json.DID);
      
    }
    reader.readAsText(f);
  }
});

document.body.appendChild(fileChooser);
fileChooser.click();
});

function loadJsonKeys() {
chrome.storage.local.get('json_keys', function (res) {
        var json_keys = res.json_keys;
        var json = JSON.parse(json_keys);
        var keyhex = "";
        if(json.KEYS === undefined) {
            console.log("GENERATED KEYS");
            var keys = json;
            console.log(keys);
			document.getElementById('keyhex').value = keys.authKeyPair.privateKeys.hex;
			document.getElementById('keyhex2').value = keys.aggreementKeyPair.privateKeys.hex;
            chrome.storage.local.set({
                keyhex: keys.authKeyPair.privateKeys.hex,
				keyhex2: keys.aggreementKeyPair.privateKeys.hex,
                authKeyPair_hex: keys.authKeyPair.privateKeys.hex,
			    authKeyPair_jwk_d: keys.authKeyPair.privateKeys.jwk.d,
			    authKeyPair_jwk_x: keys.authKeyPair.privateKeys.jwk.x,
			    authKeyPair_jwk_y: keys.authKeyPair.privateKeys.jwk.y,
			    aggreementKeyPair_hex: keys.aggreementKeyPair.privateKeys.hex,
			    aggreementKeyPair_jwk_d: keys.aggreementKeyPair.privateKeys.jwk.d,
			    aggreementKeyPair_jwk_x: keys.aggreementKeyPair.privateKeys.jwk.x
		        }, function() {
			        console.log("Keys saved!");
		    });
        }
        else {
            console.log("UPLOADED KEYS");
			document.getElementById('keyhex').value = json.KEYS.authKeyPair.privateKeys.hex;
			document.getElementById('keyhex2').value = json.aggreementKeyPair.privateKeys.hex;
            chrome.storage.local.set({
                keyhex: json.KEYS.authKeyPair.privateKeys.hex,
				keyhex2: json.aggreementKeyPair.privateKeys.hex,
                authKeyPair_hex: json.KEYS.authKeyPair.privateKeys.hex,
			    authKeyPair_jwk_d: json.KEYS.authKeyPair.privateKeys.jwk.d,
			    authKeyPair_jwk_x: json.KEYS.authKeyPair.privateKeys.jwk.x,
			    authKeyPair_jwk_y: json.KEYS.authKeyPair.privateKeys.jwk.y,
			    aggreementKeyPair_hex: json.aggreementKeyPair.privateKeys.hex,
			    aggreementKeyPair_jwk_d: json.aggreementKeyPair.privateKeys.jwk.d,
			    aggreementKeyPair_jwk_x: json.aggreementKeyPair.privateKeys.jwk.x
		        }, function() {
			        console.log("Keys saved!");
		    });
        }
        
    });
}

function loadVerifiableCredentialsFromBlockchain() {
	fetch('http://localhost:5000/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', },
		body: JSON.stringify({
			query: `
			query decryptVCFallback($privkeyhex: String!) {
				decryptVCFallback(privkeyhex: $privkeyhex) {
					transactionId
					action
					issuer
					vcJwtEnc
					vcJwt
					verifiedVC
				}
			}
			`,
			variables: {
				privkeyhex: document.getElementById('keyhex').value,
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		for(var i=0; i < result.data.decryptVCFallback.length; i++)
		{
			var r = result.data.decryptVCFallback[i]
			var issuer = r.issuer;
			var transactionId = r.transactionId;
			var verifiedVCJson = JSON.parse(r.verifiedVC);
			var type_name = verifiedVCJson.payload.vc.credentialSubject.vaccine.medicinalProductName;
			var type_code = verifiedVCJson.payload.vc.credentialSubject.vaccine.atcCode;

            if(type_name !== undefined)
			    addTableElement("verifiableCredentialsBlockchain", [transactionId.substring(0,10)+"...", issuer.substring(0,25)+"...", "10.2022", type_name, null])
			else
			    addTableElement("verifiableCredentialsBlockchain", [transactionId.substring(0,10)+"...", issuer.substring(0,25)+"...", "10.2022", type_code.substring(0,10)+"...", null])
		}
	});
}

function loadVerifiableCredentials() {
	chrome.storage.local.get('vcsArray', function (res) {
		console.log(res.vcsArray);
		var vcs = res.vcsArray;
		for(var i=0; i < vcs.length; i++)
		{
			var vc = vcs[i];
			fetch('http://127.0.0.1:5000/graphql', {
					method: 'POST',
					headers: {
					'Content-Type': 'application/json',
					},
					body: JSON.stringify({
					query: verifyVCQuery,
					variables: {
					jwt: vc,
					},
					}),
				})
				.then((res) => res.json())
				.then((result) => {
				console.log(result)
				const obj = JSON.parse(result.data.verifyVC.credential);

				//vcDiv.innerHTML += "<br>" + obj.payload.vc.credentialSubject.degree.type + ", " + obj.payload.vc.credentialSubject.degree.name + " - " + result.data.verifyVC.status;
				//vcDiv.appendChild(btn)
				//vcsDiv.appendChild(vcDiv);

                if(obj.payload.vc.credentialSubject.vaccine.medicinalProductName === undefined)
				    addTableElement("verifiableCredentials", [vc.substring(0,10)+"...", obj.payload.iss.substring(0,20)+"...", obj.payload.vc.credentialSubject.recipient.familyName, obj.payload.vc.credentialSubject.vaccine.atcCode.substring(0,10)+"...", result.data.verifyVC.status, null]);
				else
				    addTableElement("verifiableCredentials", [vc.substring(0,10)+"...", obj.payload.iss.substring(0,20)+"...", obj.payload.vc.credentialSubject.recipient.familyName, obj.payload.vc.credentialSubject.vaccine.medicinalProductName, result.data.verifyVC.status, null]);
				});
		}

	});


}

function loadVerifiablePresentations() {
	fetch('http://localhost:5000/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', },
		body: JSON.stringify({
			query: `
			query verifyVPFallback($holder: String!) {
				verifyVPFallback(holder: $holder) {
					transactionId
					action
					holder
					verifiedVP
				}
			}
			`,
			variables: {
				holder: document.getElementById('did').value,
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		console.log(result)
		for(var i=0; i < result.data.verifyVPFallback.length; i++)
		{
			var r = result.data.verifyVPFallback[i]
			var holder = r.holder;
			var transactionId = r.transactionId;
			var verifiedVPJson = JSON.parse(r.verifiedVP);

			addTableElement("verifiablePresentations", [transactionId.substring(0,10)+"...", document.getElementById('did').value.substring(0,25)+"...", "08.2022"]) //, verifiedVPJson])
		}
	});
}

function addTableElement2(tableId, content) {
	var table = document.getElementById(tableId);
	var rowCount = table.rows.length;
	var row = table.insertRow(rowCount);

	for(var i=0; i<content.length; i++)
	{
		var cell = row.insertCell(i);
		var element;
		if(i == 0)
		{
			element = document.createElement('a');
			element.href = "http://localhost:4000/en/transaction?id=" + content[i]
		}
		else
			element = document.createElement("div");

		var node = document.createTextNode(content[i]);
		element.appendChild(node);
		cell.appendChild(element);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	chrome.storage.local.get([
		'did',
		'authKeyPair_hex',
		'aggreementKeyPair_hex',
	], function(result) {
		document.getElementById('did').value = result.did;
		document.getElementById('keyhex').value = result.authKeyPair_hex;
		document.getElementById('keyhex2').value = result.aggreementKeyPair_hex;
	});

	document.getElementById("did").addEventListener('change', () => {
		chrome.storage.local.set({
			did: document.getElementById('did').value,
		}, function() {
			console.log("DID Saved!");
		});
	});

	document.getElementById("keyhex").addEventListener('change', () => {
		chrome.storage.local.set({
			keyhex: document.getElementById('keyhex').value,
		}, function() {
			console.log("KEYHEX Saved!");
		});
	});

	document.getElementById("keyhex2").addEventListener('change', () => {
		chrome.storage.local.set({
			keyhex2: document.getElementById('keyhex2').value,
		}, function() {
			console.log("KEYHEX2 Saved!");
		});
	});

});

document.getElementById("auto-fill").addEventListener("click", () => {
chrome.storage.local.get([
		'did',
		'authKeyPair_hex',
		'aggreementKeyPair_hex'
	], function(result) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log(tabs)
		chrome.tabs.sendMessage(tabs[0].id, {
			did: result.did,
			keyhex: result.authKeyPair_hex,
			keyhex2: result.aggreementKeyPair_hex
		}, function(response) {
			console.log(response);
		});
	});
	});
	
});

document.getElementById("reset-fields").addEventListener("click", () => {
	document.getElementById('did').value = '';
	document.getElementById('keyhex').value = '';

	chrome.storage.local.set({
		did: document.getElementById('did').value,
		keyhex: document.getElementById('keyhex').value,
		keyhex2: document.getElementById('keyhex2').value,
	});
});

document.getElementById("auth").addEventListener("click", () => {
	loadVerifiableCredentialsFromBlockchain();
	loadVerifiableCredentials();
	loadVerifiablePresentations();
});


/*
document.getElementById("auth").addEventListener("click", () => {

	fetch('http://localhost:5000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
	query getAuthChallenge($did: String!) {
        authChallenge(did: $did) {
            data
        }
    }
      `,
    variables: {
      did: document.getElementById('did').value,
    },
  }),
})
  .then((res) => res.json())
  .then((result) => {
	var challenge = result.data.authChallenge.data;
	console.log(challenge)
	var keyhex = document.getElementById('keyhex').value
	var bytes = new Uint8Array(Math.ceil(challenge.length / 2));
	for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(challenge.substr(i * 2, 2), 16);
	console.log(bytes);
	var challengeArr = bytes;
	console.log(challengeArr)

	//const privateKey = Secp256k1.uint256(keyArr, 16);
	//console.log(privateKey.toString(16))

	//const digest = Secp256k1.uint256(challenge, 16)
	//const sig = Secp256k1.ecsign(privateKey, digest)
	//console.log(sig);

	var EC = elliptic.ec;
	var ec = new EC('secp256k1');
	var key = ec.keyFromPrivate(keyhex, 'hex');
	//console.log("Public: ", key.getPublic('hex'));
	//console.log("Private: ", key.getPrivate('hex'));
	var signature = key.sign(challengeArr);
	console.log(signature)
	var sig_der = signature.toDER();
	var sig_ecdsa = signature.toECSDA();

	var convertedBack = '';
	for (var i = 0; i < sig_ecdsa.length; i++) {
	if (sig_der[i] < 16) convertedBack += '0';
	convertedBack += sig_ecdsa[i].toString(16);
	}
	console.log("SignatureECDSA: ", convertedBack);

	fetch('http://localhost:5000/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
			query getAuthResponse($did: String!, $response: String!) {
				authResponse(did: $did, response: $response) {
					result
					token
				}
			}
			`,
			variables: {
			did: document.getElementById('did').value,
			response: convertedBack,
			},
		}),
		})
	.then((res) => res.json())
	.then((result) => {console.log(result)});
  })
});
*/
