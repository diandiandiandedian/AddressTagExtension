// 提取地址的函数
function getAddressFromURL() {
    const currentURL = window.location.href; // 获取当前页面的 URL
    const match = currentURL.match(/\/address\/(0x[a-fA-F0-9]{40})/); // 使用正则表达式提取地址
    if (match && match[1]) {
        return match[1]; // 返回提取的地址部分
    }
    return null; // 如果没有找到，返回 null
}

// 发送 POST 请求的函数，使用原生 XMLHttpRequest
function sendPostRequest(url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { // 请求完成
            if (xhr.status >= 200 && xhr.status < 300) { // 请求成功
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
    // 添加 tag 风格的样式
    customDiv.style.display = 'inline-block';
    customDiv.style.padding = '5px 15px';
    customDiv.style.margin = '5px';
    customDiv.style.border = '1px solid #000';
    customDiv.style.borderRadius = '20px'; // 增加圆角
    customDiv.style.backgroundColor = '#4caf50'; // 设置背景色
    customDiv.style.color = '#fff'; // 文字颜色为白色
    customDiv.style.fontSize = '14px';
    customDiv.style.fontWeight = 'bold';
    customDiv.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.2)'; // 增加阴影效果

    // 设置 div 内部文本内容
    customDiv.textContent = content || '';

    // 检查 link 是否存在且不为空
    if (link) {
        customDiv.style.cursor = 'pointer'; // 当有链接时，显示手型指针
        customDiv.style.textDecoration = 'underline'; // 给文本添加下划线

        // 添加点击事件，跳转到新标签页
        customDiv.addEventListener('click', () => {
            window.open(link, '_blank'); // 在新标签页打开链接
        });
    } else {
        customDiv.style.cursor = 'default'; // 当没有链接时，显示普通指针
        customDiv.style.textDecoration = 'none'; // 没有链接时，无下划线
    }

    return customDiv;
}

// 等待页面加载完成
window.addEventListener('load', () => {
    console.log('页面加载完成');
    // 调用函数提取地址
    const extractedAddress = getAddressFromURL();

    // 如果没有提取到地址，则不做请求和渲染操作
    if (!extractedAddress) {
        console.log('未找到地址，停止渲染');
        return; // 不做任何操作
    }

    console.log('提取到的地址:', extractedAddress);

    // 查找 class 为 'container-xxl' 的 section 元素
    const targetElement = document.querySelector('section.container-xxl');

    if (targetElement) {
        // 使用原生 XMLHttpRequest 发送 POST 请求获取标签数据，传递 address 作为请求参数
        sendPostRequest('http://localhost:8085/addressTag/queryAddressTagList', { address: extractedAddress }, (error, response) => {
            if (error) {
                console.error('请求失败:', error);
                return;
            }

            // 服务器返回的数据赋值给 contentList
            const contentList = response.data || [];

            // 循环生成多个标签
            contentList.forEach(item => {
                const tag = createTag(item.content, item.link);
                targetElement.appendChild(tag);
            });

            // 创建折叠的 HTML 结构，放置在标签列表后面
            const modalHTML = `
                <div>
                    <button id="toggleButton" style="background-color: #ff5722; color: white; padding: 10px; border-radius: 5px; cursor: pointer; border: none;">
                        添加新内容
                    </button>
                    <div id="modalContent" class="modal-content" style="display: none; background-color: #fff; margin-top: 10px; padding: 20px; border: 1px solid #888; border-radius: 10px;">
                        <label for="titleInput">Title:</label>
                        <input type="text" id="titleInput" placeholder="请输入标题" style="display: block; margin-bottom: 10px; width: 100%; padding: 5px;"/>

                        <label for="linkInput">Link (可选):</label>
                        <input type="text" id="linkInput" placeholder="请输入链接 (可选)" style="display: block; margin-bottom: 10px; width: 100%; padding: 5px;"/>

                        <button class="close-button" id="closeModal" style="background-color: #d9534f; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">关闭</button>
                        <button class="submit-button" id="submitForm" style="background-color: #5cb85c; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">提交</button>
                    </div>
                </div>
            `;

            // 将折叠的 HTML 添加到标签列表后面
            targetElement.insertAdjacentHTML('beforeend', modalHTML);

            // 打印 toggleButton 以确保它被插入页面
            console.log(document.querySelector('#toggleButton'));

            // 获取按钮并添加点击事件进行折叠/展开切换
            const toggleButton = document.getElementById('toggleButton');
            const modalContent = document.getElementById('modalContent');

            toggleButton.addEventListener('click', () => {
                if (modalContent.style.display === 'none') {
                    modalContent.style.display = 'block'; // 展开
                } else {
                    modalContent.style.display = 'none'; // 折叠
                }
            });

            // 提交表单事件
            document.getElementById('submitForm').addEventListener('click', () => {
                const content = document.getElementById('titleInput').value;
                const link = document.getElementById('linkInput').value;

                // 提交请求并将新标签添加到列表
                sendPostRequest('http://localhost:8085/addressTag/save', { content, link: link || null, address: extractedAddress }, (error, response) => {
                    if (error) {
                        console.error('提交失败:', error);
                        return;
                    }

                    console.log('成功:', response);

                    // 创建新的标签并添加到页面中
                    const newTag = createTag(content, link);
                    targetElement.appendChild(newTag);

                    // 提交成功后折叠内容
                    modalContent.style.display = 'none';
                });
            });

            // 关闭按钮事件
            document.getElementById('closeModal').addEventListener('click', () => {
                modalContent.style.display = 'none'; // 点击关闭按钮折叠内容
            });
        });
    } else {
        console.error('Target section not found!');
    }
});
