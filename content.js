async function copyLink(link) {
    // 安全域包括本地访问与开启TLS安全认证的地址，如 https 协议的地址、127.0.0.1 或 localhost 。
    if (navigator && navigator.clipboard) {
        return navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([link], {type: 'text/html'})
        })])
    }

    // 创建一个包含富文本的元素，例如一个包含超链接的 <div>
    const richTextElement = document.createElement('div');
    richTextElement.innerHTML = link

    // 将富文本元素添加到页面中，以便能够执行 execCommand
    document.body.appendChild(richTextElement);

    // 创建一个选区并选择富文本元素
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(richTextElement);
    selection.removeAllRanges();
    selection.addRange(range);

    return new Promise((res, rej) => {
        // 执行复制命令并移除文本框
        document.execCommand('copy') ? res() : rej()

        selection.removeAllRanges();
        document.body.removeChild(richTextElement);
    })


}

// 获取图像 Blob
function getImageBlob(url, callback) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            callback(blob);
        })
        .catch(error => {
            console.error("获取图像 Blob 失败：", error);
        });
}

// 将图像 Blob 复制到剪贴板
function copyImageBlobToClipboard(blob) {
    navigator.clipboard.write([
        new ClipboardItem({"image/png": blob}) // 将 Blob 添加到 ClipboardItem 中
    ]).then(function () {
        console.log("已成功复制图像 Blob 到剪贴板");
    }).catch(function (error) {
        console.error("复制图像 Blob 到剪贴板失败：", error);
    });
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    //一定要回应，不然报错:
    //Unchecked runtime.lastError: The message port closed before a response was received.
    if (message.action === 'copyImage') {
        // handleCopyImg(message.value)
        sendResponse("received")
        getImageBlob(message.value, function (blob) {
            copyImageBlobToClipboard(blob);
        });

    }
    if (message.action === 'copyLink') {
        sendResponse("received")
        copyLink(message.value).then(() => {
            console.log('pasted')
        }).catch((error) => {
            console.log('not pasted', error)
        })
    }
    if (message.action === 'copyHtml') {
        copyHtml()
        sendResponse("received")
    }

});

function copyHtml(event) {
    var selectedText = window.getSelection().toString();
    if (selectedText !== '') {
        let selectedHTML = window.getSelection().getRangeAt(0).cloneContents();

        let tempDiv = document.createElement('div');
        tempDiv.appendChild(selectedHTML.cloneNode(true));

        navigator.clipboard.writeText(tempDiv.innerHTML);

        sendText(tempDiv.innerHTML)

    }
}

function sendText(text) {
    // 创建一个 XMLHttpRequest 对象
    var xhr = new XMLHttpRequest();
    // 定义要发送的数据
    var data = new FormData();
    data.append('data', text);
    data.append('location', JSON.stringify(document.location));

    // 设置POST请求
    xhr.open("POST", "http://localhost:7826/html", true);
    // 发送数据
    xhr.send(data);
}
