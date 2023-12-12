function sendMessagePromise(action, value = '') {
    return new Promise(async (resolve, reject) => {
        let tabs = await chrome.tabs.query({currentWindow: true, active: true});

        chrome.tabs.sendMessage(tabs[0].id, {action, value}, (response) => {
            if (response) {
                resolve(response)
            } else {
                reject(response)
            }
        });
    })
}

async function sendSelector() {
    let msg = document.querySelector("#value").value;
    if (!msg) {
        return
    }
    let keyName = await getKey()
    await chrome.storage.sync.set({[keyName]: msg})
    let res = await sendMessagePromise('selectCss', msg)
    console.log('send selector success', res)
}

async function getKey() {
    return await sendMessagePromise('getHost')
}

document.querySelector('form').addEventListener('submit', async (m) => {
    m.preventDefault()
    try {
        await sendSelector()
    } catch (e) {
        console.log('form submit error', e)
    }
})

document.querySelector('#copy').addEventListener('click', async (m) => {
    m.preventDefault()
    try {
        await sendSelector()
        await sendMessagePromise('copyHtml')
    } catch (e) {
        console.log('form submit error', e)
    }
})

// 等待页面加载完成后执行代码
document.addEventListener('DOMContentLoaded', async function () {
    let keyName = await getKey()
    const data = await chrome.storage.sync.get(keyName)
    let res = data[keyName]
    console.log('get key', keyName, data, res)
    if (data && res) {
        document.querySelector('#value').value = res;
    } else {
        document.querySelector('#value').value = '';
    }
});
