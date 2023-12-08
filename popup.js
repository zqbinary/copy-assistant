function sendMsg() {
    let msg = document.querySelector("#value").value;
    if (!msg) {
        return
    }
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (tabs.length === 0) return;
        chrome.tabs.sendMessage(tabs[0].id, {action: 'selectCss', value: msg}, () => {

        });
    });
}

document.querySelector('#btn').addEventListener('click', async (m) => {
    sendMsg()
})
document.querySelector('form').addEventListener('submit', async (m) => {
    sendMsg()
})
