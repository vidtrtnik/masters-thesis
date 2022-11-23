chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        try {
            const e = new Event("change", { bubbles: true });

            const el_did = document.getElementById("formDID");
            console.log(el_did)
            el_did.value = request.did;
            el_did.dispatchEvent(e);

            const el_keyhex = document.getElementById("formKey");
            console.log(el_keyhex)
            el_keyhex.value = request.keyhex;
            el_keyhex.dispatchEvent(e);

            const button_request = document.getElementById("button_request");
            console.log(button_request);
            button_request.click();
            
            localStorage.setItem("privkeyhex2", request.keyhex2);

            sendResponse({status: "Success!"});
        } catch (error) {
            console.log(error)
            sendResponse({status: "Exception occurred!"});
        }
    }
);

var target = document.getElementById("formChallenge");
console.log(target);

function delayRefresh(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if(mutation.target == target) {
            console.log(target.value);
            const button_send = document.getElementById("button_send");
            console.log(button_send);
            button_send.click();

            delayRefresh(1000).then(() => location.reload(true));
        }
    });
});

var config = { attributes: true, childList: true, characterData: true, subtree:true }
observer.observe(document.body, config);

// observer.disconnect();
