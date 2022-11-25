var did = "";
var didkeysau = "";
var didkeysag = "";
var commid = "";
var invitation = "";

var receive_result = "";
var timer = null;

var vc = "";
var vcs = []

var verifierDid = "";

var privkeyhex = "";
chrome.storage.local.get('privkeyhex', function (res) {
  privkeyhex = res.privkeyhex;
});

function getTmpDID() {
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
      //commid = result.data.invitation.commid;
      invitation = result.data.invitation.invitation;

      console.log(commid, did, didkeysau, didkeysag);
    });

}


var invitationText = document.getElementById("invitation2");
console.log(invitationText)
invitationText.addEventListener('change', checkInvitation);
function checkInvitation(e) {
  console.log(e.target.value);
  getTmpDID();

  invitation = e.target.value;
  var decodedHeader = jwt_decode(invitation, { header: true });
  console.log(decodedHeader);
  verifierDid = decodedHeader.from;
  commid = decodedHeader.id;

  document.getElementById("invitationData").innerHTML = "Data: " + verifierDid.substring(0, 30) + "... (" + commid + ")";

  loadVerifiableCredentials2()
}

function processJWT(vc) {
  var vcsDiv = document.getElementById("vcs");
  var btn = document.createElement("button");
  var vcDiv = document.createElement("div");
  btn.innerHTML = "Select"

  btn.onclick = function () {
    chrome.storage.local.get([
      'selectedVCS',
    ], function (result) {
      var vcs = []
      if (result.selectedVCS !== undefined && result.selectedVCS.length > 0)
        vcs = result.selectedVCS;
      if (vcs.indexOf(vc) === -1) {
        vcs.push(vc);
        btn.innerHTML = "Unselect";
      }
      else {
        vcs.splice(vc, 1);
        btn.innerHTML = "Select";
      }
      chrome.storage.local.set({
        selectedVCS: vcs,
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

      addTableElement("verifiableCredentials", [obj.payload.vc.credentialSubject.degree.type, obj.payload.vc.credentialSubject.degree.name, result.data.verifyVC.status, btn]);


    });
}

document.getElementById("send-vp").addEventListener("click", () => {
  chrome.storage.local.get(['selectedVCS', "did", "keyhex"], function (res) {
    var selectedVCS = res.selectedVCS;
    var selectedVCS_str = selectedVCS.toString();
    console.log(selectedVCS);
    console.log(selectedVCS_str);
    console.log(selectedVCS, res.did, res.keyhex)


    fetch('http://127.0.0.1:5000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: addVP,
        variables: {
          did: res.did,
          privkeyhex: res.keyhex,
          vcJwt: selectedVCS_str,
        },
      }),
    })
      .then((res) => res.json())
      .then((result) => {

        console.log("addVP:")
        console.log(result)

        //const obj = JSON.parse(result.data.verifyVC.credential);

        fetch('http://127.0.0.1:2222/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: sendMutation,
            variables: {
              commid: commid,
              sender: did,
              recipient: verifierDid,
              contents: result.data.addVP.vpJwt,
              aukeys: didkeysau,
              agkeys: didkeysag,
              passw: "pass"
            },
          }),
        })
          .then((res) => res.json())
          .then((result) => {

            console.log("sendMutation:")
            console.log(commid);
            console.log(result)

            //const obj = JSON.parse(result.data.verifyVC.credential);
          })

      })


  });
});
