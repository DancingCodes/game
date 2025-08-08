// 获取canvas
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d');

// 设置尺寸
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 设置背景色
function clearCanvas() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
clearCanvas()

let myPlayer = null

// 连接 WebSocket 服务端
const socket = new WebSocket('ws://localhost:3004');
socket.addEventListener('open', () => {
    console.log('已连接到 WebSocket 服务器');
});

// 接收消息
socket.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
    console.log('📩 收到消息：', type, data);

    if (type === 'playerInfo') {
        myPlayer = data
        ctx.fillStyle = i.color;
        ctx.fillRect(i.x, i.y, i.width, i.height);
    }
});







