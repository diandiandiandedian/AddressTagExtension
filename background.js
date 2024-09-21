// 监听插件按钮点击事件
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension button clicked in tab:', tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            alert('Hello from background script!');
        }
    });
});


chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome extension installed");
});
