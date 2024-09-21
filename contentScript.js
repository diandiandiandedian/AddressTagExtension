// 提取地址的函数
function getAddressFromURL() {
    const currentURL = window.location.href;
    const match = currentURL.match(/\/address\/(0x[a-fA-F0-9]{40})/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

// 发送 POST 请求的函数，使用原生 XMLHttpRequest
function sendPostRequest(url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(null, JSON.parse(xhr.responseText));
            } else {
                callback(xhr.status, null);
            }
        }
    };

    xhr.send(JSON.stringify(data));
}

// 创建标签的函数
function createTag(content, link) {
    const customDiv = document.createElement('div');
    customDiv.style.display = 'inline-block';
    customDiv.style.padding = '5px 15px';
    customDiv.style.margin = '5px';
    customDiv.style.borderRadius = '20px';
    customDiv.style.backgroundColor = '#4caf50';
    customDiv.style.color = '#fff';
    customDiv.style.fontSize = '14px';
    customDiv.style.fontWeight = 'bold';
    customDiv.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.2)';
    customDiv.textContent = content || '';

    if (link) {
        customDiv.style.cursor = 'pointer';
        customDiv.style.textDecoration = 'underline';
        customDiv.addEventListener('click', () => {
            window.open(link, '_blank');
        });
    }

    return customDiv;
}

// 等待页面加载完成
window.addEventListener('load', () => {
    const extractedAddress = getAddressFromURL();
    if (!extractedAddress) return;

    // 将 extractedAddress 发送给 popup.js
    chrome.runtime.sendMessage({ type: 'address', address: extractedAddress });

    // 加载时请求标签数据
    sendPostRequest('https://testapi.ezswap.io/addressTag/queryAddressTagList', { address: extractedAddress }, (error, response) => {
        if (error) {
            console.error('请求失败:', error);
            return;
        }

        const contentList = response.data || [];
        const targetElement = document.querySelector('section.container-xxl');

        if (targetElement) {
            contentList.forEach(item => {
                const tag = createTag(item.content, item.link);
                targetElement.appendChild(tag);
            });
        }
    });

    // 添加消息监听，处理来自 popup.js 的数据
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'addTag') {
            const { content, link, address } = request;
            console.log('Received data:', content, link, address);

            const targetElement = document.querySelector('section.container-xxl');
            if (targetElement) {
                const newTag = createTag(content, link);
                targetElement.appendChild(newTag);
            }
        }
    });
});
