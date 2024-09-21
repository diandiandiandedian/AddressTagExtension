let extractedAddress = null; // 用于保存传入的地址

// 监听来自 contentScript.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'address') {
        extractedAddress = request.address; // 保存 extractedAddress
        console.log('Received extractedAddress:', extractedAddress);
    }
});

// 保存按钮点击事件
document.getElementById('saveButton').addEventListener('click', () => {
    const content = document.getElementById('contentInput').value.trim();
    const link = document.getElementById('linkInput').value.trim();

    // 检查输入框是否为空
    if (!content) {
        alert('Content is required.');
        return;
    }

    // 确保 extractedAddress 已经被接收到
    if (!extractedAddress) {
        alert('Address not received from contentScript.');
        return;
    }

    // 向 contentScript.js 发送数据，包括 extractedAddress
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'addTag',
            content: content,
            link: link,
            address: extractedAddress // 发送地址到 contentScript
        });
    });

    // 清空输入框并关闭插件弹窗
    document.getElementById('contentInput').value = '';
    document.getElementById('linkInput').value = '';
    window.close();
});

// 关闭按钮事件
document.getElementById('closeButton').addEventListener('click', () => {
    window.close();
});
