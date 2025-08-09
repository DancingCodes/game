// 地图信息
const MAP_DATA = {
    WORLD_WIDTH: null,
    WORLD_HEIGHT: null,
    WORLD_BGCOLOR: null,
}

// 获取canvas
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d');

window.addEventListener('resize', () => {
    initMap();
});

// 渲染地图
function initMap() {
    const { WORLD_WIDTH, WORLD_HEIGHT } = MAP_DATA
    if (!WORLD_WIDTH || !WORLD_HEIGHT) return;

    const { innerWidth, innerHeight } = window;
    // 计算窗口和地图宽高比
    const [worldRatio, windowRatio] = [WORLD_WIDTH / WORLD_HEIGHT, innerWidth / innerHeight];

    const [w, h] = worldRatio > windowRatio ? [innerWidth, innerWidth / worldRatio] : [innerHeight * worldRatio, innerHeight];

    const scale = worldRatio > windowRatio ? innerWidth / WORLD_WIDTH : innerHeight / WORLD_HEIGHT

    canvas.width = w
    canvas.height = h

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale)
    clearCanvas();
}

// 重置Canvas
function clearCanvas() {
    ctx.fillStyle = MAP_DATA.WORLD_BGCOLOR;
    ctx.fillRect(0, 0, MAP_DATA.WORLD_WIDTH, MAP_DATA.WORLD_HEIGHT);
}

let players = []

// 连接 WebSocket 服务端
const socket = new WebSocket('ws://localhost:3004');
socket.addEventListener('open', () => {
    console.log('已连接到 WebSocket 服务器');
});

// 接收消息
socket.addEventListener('message', (event) => {
    const { type, data } = parseJSON(event.data);
    console.log('📩 收到消息：', type, data);

    if (type === 'initMap') {
        Object.assign(MAP_DATA, { ...data });
        initMap()
    }

    if (type === 'updatePlayers') {
        players = data
        renderPlayers()
    }

});


// 渲染玩家
function renderPlayers() {
    clearCanvas();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    players.forEach(p => {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = '#ffffff';
        const textX = p.x + p.width / 2;
        const textY = p.y + p.height / 2;
        ctx.fillText(p.id, textX, textY);
    });

    // 循环渲染
    requestAnimationFrame(renderPlayers);
}

// 玩家移动
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        socket.send(sendJSON('move', key));
    }
});


function sendJSON(type, data) {
    return JSON.stringify({ type, data })
}

function parseJSON(msg) {
    return JSON.parse(msg);
}