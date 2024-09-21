const e = React.createElement;

function App() {
    // 创建一个简单的 Hello World 组件
    return e('div', null, 'Hello World');
}

// 将 Hello World 组件渲染到根容器
ReactDOM.render(e(App), document.getElementById('root'));
