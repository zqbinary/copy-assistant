function sendMsg() {
    let msg = document.querySelector("#value").value;
    if (!msg) {
        return
    }
    chrome.storage.sync.set({'qSelecor': msg}, () => {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            if (tabs.length === 0) return;
            chrome.tabs.sendMessage(tabs[0].id, {action: 'selectCss', value: msg}, () => {

            });
        });
    })
}

document.querySelector('#btn').addEventListener('click', async (m) => {
    sendMsg()
})
document.querySelector('form').addEventListener('submit', async (m) => {
    sendMsg()
})
// 等待页面加载完成后执行代码
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get('qSelecor', data => {
        let res = data['qSelecor']
        console.log('iii', data, res)
        if (data && res) {
            document.querySelector('#value').value = res;
        } else {
            document.querySelector('#value').value = '';
        }
    })
});
