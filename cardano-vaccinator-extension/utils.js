function addTableElement(tableId, content) {
  var table = document.getElementById(tableId);
  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);

  for (var i = 0; i < content.length - 1; i++) {
    var cell = row.insertCell(i);
    var element;
    element = document.createElement("div");
    //element = document.createElement('a');
    //element.href = "http://localhost:4000/en/transaction?id=" + content[i]

    var node = document.createTextNode(content[i]);
    element.appendChild(node);
    cell.appendChild(element);
  }

  if (content[content.length - 1] !== null) {
    var cell = row.insertCell(content.length - 1)
    var element = document.createElement("div");
    element.appendChild(content[content.length - 1]);
    cell.appendChild(element);
  }

}

var selectedVCS = [];

function loadVerifiableCredentials2() {

  chrome.storage.local.get('vcsArray', function (res) {
    console.log(res.vcsArray);
    var vcs = res.vcsArray;
    var x = 0;
    for (var i = 0; i < vcs.length; i++) {
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


          var btn = document.createElement("button");
          btn.setAttribute("class", "btn btn-sm btn-primary");

          if (selectedVCS.indexOf(vc) === -1)
            btn.innerHTML = "Select"
          else
            btn.innerHTML = "Unselect"

          btn.onclick = function () {
            chrome.storage.local.get('vcsArray', function (res) {
              var vcsArray = res.vcsArray;
              chrome.storage.local.get('selectedVCS', function (res) {
                var selectedVCS = res.selectedVCS;
                if (selectedVCS === undefined)
                  selectedVCS = []
                var vcid = parseInt(btn.innerHTML);
                console.log(vcid)
                console.log(vcsArray[vcid])

                if (selectedVCS.indexOf(vcsArray[vcid]) === -1) {
                  selectedVCS.push(vcsArray[vcid]);
                  btn.innerHTML = "Selected"

                  chrome.storage.local.set({
                    selectedVCS: selectedVCS,
                  });
                }
              });
            });
          }

          btn.innerHTML = x++;

          //vcDiv.innerHTML += "<br>" + obj.payload.vc.credentialSubject.degree.type + ", " + obj.payload.vc.credentialSubject.degree.name + " - " + result.data.verifyVC.status;
          //vcDiv.appendChild(btn)
          //vcsDiv.appendChild(vcDiv);

          if (obj.payload.vc.credentialSubject.vaccine.medicinalProductName)
            addTableElement("verifiableCredentials", [vc.substring(0, 10) + "...", obj.payload.iss.substring(0, 10) + "...", obj.payload.vc.credentialSubject.recipient.familyName, obj.payload.vc.credentialSubject.vaccine.medicinalProductName, result.data.verifyVC.status, btn]);
          else
            addTableElement("verifiableCredentials", [vc.substring(0, 10) + "...", obj.payload.iss.substring(0, 10) + "...", obj.payload.vc.credentialSubject.recipient.familyName, obj.payload.vc.credentialSubject.vaccine.atcCode.substring(0, 10) + "...", result.data.verifyVC.status, btn]);
        });
    }

  });


}
