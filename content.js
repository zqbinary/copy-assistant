// 复制链接功能
async function copyLink(link) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([link], {type: 'text/html'})
                })
            ]);
            console.log('链接已成功复制到剪贴板');
        } catch (error) {
            console.error('复制链接到剪贴板失败:', error);
            throw error;
        }
    } else {
        const richTextElement = document.createElement('div');
        richTextElement.innerHTML = link;

        document.body.appendChild(richTextElement);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(richTextElement);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            if (!document.execCommand('copy')) {
                throw new Error('复制命令执行失败');
            }
            console.log('链接已成功复制到剪贴板');
        } catch (error) {
            console.error('复制链接到剪贴板失败:', error);
            throw error;
        } finally {
            selection.removeAllRanges();
            document.body.removeChild(richTextElement);
        }
    }
}

// 获取图像 Blob
async function getImageBlob(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('获取图像 Blob 失败:', error);
        throw error;
    }
}

// 复制图像 Blob 到剪贴板
async function copyImageBlobToClipboard(blob) {
    try {
        await navigator.clipboard.write([
            new ClipboardItem({"image/png": blob})
        ]);
        console.log('图像 Blob 已成功复制到剪贴板');
    } catch (error) {
        console.error('复制图像 Blob 到剪贴板失败:', error);
        throw error;
    }
}

// 处理消息
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.action === 'copyImage') {
        try {
            sendResponse('received');
            const blob = await getImageBlob(message.value);
            await copyImageBlobToClipboard(blob);
        } catch (error) {
            console.error('复制图像失败:', error);
        }
    } else if (message.action === 'copyLink') {
        try {
            sendResponse('received');
            await copyLink(message.value);
        } catch (error) {
            console.error('复制链接失败:', error);
        }
    } else if (message.action === 'copyHtml') {
        copyHtml();
        sendResponse('received');
    } else if (message.action === 'selectCss') {
        selectRange(message.value)
        sendResponse('received');
    } else if (message.action === 'getHost') {
        sendResponse(window.location.host)
    }
});


function showNotification(msg) {

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        new Notification("copy-copy", {
            body: msg,
        });
    }
}

function selectRange(selector) {
    const selectedElement = document.querySelector(selector);
    if (!selectedElement) {
        return showNotification("非法CSS path");
    }
    const range = document.createRange();
    // 将 Range 设置为选定的区域
    range.selectNodeContents(selectedElement);

    // 获取当前选择对象并清除之前的选择
    const selection = window.getSelection();
    selection.removeAllRanges();

    // 将新的 Range 添加到选择对象中
    selection.addRange(range);
}

// 复制 HTML
function copyHtml() {
    const selectedText = window.getSelection().toString();
    if (selectedText !== '') {
        const selectedHTML = window.getSelection().getRangeAt(0).cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(selectedHTML.cloneNode(true));
        sendText(tempDiv.innerHTML);
    }
}

// 发送文本
function sendText(text) {
    const xhr = new XMLHttpRequest();
    const data = new FormData();
    data.append('data', text);
    document.location.title = document.title;
    data.append('location', JSON.stringify(document.location));

    xhr.timeout = 5000; // 设置超时时间，单位为毫秒
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status !== 200) {
                showNotification("服务器错误，status:" + xhr.status);
            }
        }
    };
    xhr.open('POST', 'http://localhost:7826/html', true);
    xhr.send(data);
}
