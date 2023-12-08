// 创建右键菜单项
function createContextMenu() {
    chrome.contextMenus.create({
        id: 'menu-1',
        title: '复制标题链接',
        type: 'normal',
    });
    chrome.contextMenus.create({
        id: 'copyHtml',
        title: '复制html',
        type: 'normal'
    });
    chrome.contextMenus.create({
        id: "copyImage",
        title: "Copy Image",
        contexts: ["image"]
    });
}

// 处理复制链接操作
function handleCopyLink() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (tabs.length === 0) return;

        const msg = `<a href="${tabs[0].url}">${tabs[0].title}</a>`;
        sendMessageToTab(tabs[0].id, {action: 'copyLink', value: msg}, (res) => {
            if (res === 'ok') {
                showNotification(`标题为：${tabs[0].title}`, '复制成功');
            }
        });
    });
}

// 处理复制HTML操作
function handleCopyHtml() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (tabs.length === 0) return;

        sendMessageToTab(tabs[0].id, {action: 'copyHtml'});
    });
}

// 处理复制图片操作
function handleCopyImg(imageUrl) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (tabs.length === 0) return;

        sendMessageToTab(tabs[0].id, {action: 'copyImage', value: imageUrl});
    });
}

// 发送消息给当前活动的标签页
function sendMessageToTab(tabId, message, callback) {
    chrome.tabs.sendMessage(tabId, message, callback);
}

// 显示通知
function showNotification(message, title) {
    chrome.notifications.create({
        type: 'basic',
        title: title,
        message: message,
        iconUrl: 'icon48.png'
    });
}

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener(function (data) {
    if (data.menuItemId === 'menu-1') {
        handleCopyLink(data);
    }
    if (data.menuItemId === "copyImage" && data.srcUrl) {
        handleCopyImg(data.srcUrl);
    }
    if (data.menuItemId === "copyHtml") {
        handleCopyHtml();
    }
});

// 监听扩展程序安装事件
chrome.runtime.onInstalled.addListener(function () {
    createContextMenu();
});

// 监听键盘快捷键事件
chrome.commands.onCommand.addListener(function (command) {
    if (command === "copyLink") {
        handleCopyLink();
    }
});
