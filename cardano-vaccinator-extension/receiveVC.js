var did = "";
var didkeysau = "";
var didkeysag = "";
var commid = "";
var invitation = "";

var receive_result = "";
var timer = null;

var vc = "";
var vcs = []

var qrcode = new QRCode("qrcode", {
  text: "",
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H
});

window.onload = function () {
  console.log("window.onload");
  var invitationDiv = document.getElementById("invitation");
  var commidDiv = document.getElementById("commid");

  fetch('http://127.0.0.1:2222/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: invitationQuery,
      variables: {
        passw: "pass"
      },
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
      did = result.data.invitation.did;
      didkeysau = result.data.invitation.didkeysau;
      didkeysag = result.data.invitation.didkeysag;
      commid = result.data.invitation.commid;
      invitation = result.data.invitation.invitation;

      invitationDiv.innerHTML = invitation;
      commidDiv.innerHTML = commid;

      qrcode.clear();
      qrcode.makeCode(invitation);

      console.log(commid, did, didkeysau, didkeysag);
    });

  startTimer();

}

function startTimer() {
  timer = setInterval(function () {
    fetch('http://127.0.0.1:2222/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: receiveLatestQuery,
        variables: {
          commid: commid,
          aukeys: didkeysau,
          agkeys: didkeysag,
          passw: "pass"
        },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        var msg = result.data.receiveLatest.msg;
        const arr = msg.split(":");
        if (arr[0] === "JWT") {
          console.log("RECEIVED JWT!!!");
          //clearInterval(timer);
          processJWT(arr[1]);
        }
      });
  }, 2000);
}

function processJWT(vc) {
  var vcsDiv = document.getElementById("vcs");
  var btn = document.createElement("button");
  var vcDiv = document.createElement("div");
  btn.setAttribute("class", "btn btn-sm btn-primary");
  btn.innerHTML = "Accept"

  btn.onclick = function () {
    chrome.storage.local.get([
      'vcsArray',
    ], function (result) {
      var vcs = []
      if (result.vcsArray !== undefined && result.vcsArray.length > 0)
        vcs = result.vcsArray;

      btn.innerHTML = "OK"
      vcs.indexOf(vc) === -1 ? vcs.push(vc) : btn.innerHTML = "Already";
      chrome.storage.local.set({
        vcsArray: vcs,
      });
    });
  };

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

      if (obj.payload.vc.credentialSubject.vaccine.medicinalProductName !== undefined)
        addTableElement("verifiableCredentials", [obj.payload.vc.credentialSubject.vaccine.medicinalProductName + " (" + obj.payload.vc.credentialSubject.vaccine.marketingAuthorizationHolder + ")", obj.payload.vc.credentialSubject.recipient.givenName + " " + obj.payload.vc.credentialSubject.recipient.familyName, obj.payload.vc.issuanceDate, result.data.verifyVC.status, btn]);
      else
        addTableElement("verifiableCredentials", [obj.payload.vc.credentialSubject.vaccine.atcCode.substring(0, 20), obj.payload.vc.credentialSubject.recipient.did.substring(0, 20) + "...", obj.payload.vc.issuanceDate, result.data.verifyVC.status, btn]);

    });
}
