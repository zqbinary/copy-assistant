function sendMessageToTab(tabId, message, callback) {
    chrome.tabs.sendMessage(tabId, message, callback);
}

function sendMsg(msg) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (tabs.length === 0) return;
        sendMessageToTab(tabs[0].id, {action: 'selectCss', value: msg});
    });
}

document.querySelector('#btn').addEventListener('click', async (m) => {
    let css_path = document.querySelector("#inputField").value;
    sendMsg(css_path)
})
