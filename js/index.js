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



// 连接 WebSocket 服务端
const socket = new WebSocket('ws://localhost:3004');
socket.addEventListener('open', () => {
    console.log('✅ 已连接到 WebSocket 服务器');
});

// 接收消息
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('📩 收到消息：', data);
});





// 玩家列表
const playerList = [{
    x: 100,
    y: 200,
    width: 50,
    height: 50,
    color: 'red'
}, {
    x: 200,
    y: 300,
    width: 50,
    height: 50,
    color: 'blue'
}]


playerList.forEach(i => {
    ctx.fillStyle = i.color;
    ctx.fillRect(i.x, i.y, i.width, i.height);
})