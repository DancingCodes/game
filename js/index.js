// 地图信息
const WORLD = {
    WIDTH: null,
    HEIGHT: null,
    BGCOLOR: null,
}

// 获取canvas
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d');

window.addEventListener('resize', () => {
    initMap();
});

// 渲染地图
function initMap() {
    const { WIDTH, HEIGHT } = WORLD
    if (!WIDTH || !HEIGHT) return;

    const { innerWidth, innerHeight } = window;
    // 计算窗口和地图宽高比
    const [worldRatio, windowRatio] = [WIDTH / HEIGHT, innerWidth / innerHeight];

    const [w, h] = worldRatio > windowRatio ? [innerWidth, innerWidth / worldRatio] : [innerHeight * worldRatio, innerHeight];

    const scale = worldRatio > windowRatio ? innerWidth / WIDTH : innerHeight / HEIGHT

    canvas.width = w
    canvas.height = h

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale)
    clearCanvas();
}

// 重置Canvas
function clearCanvas() {
    ctx.fillStyle = WORLD.BGCOLOR;
    ctx.fillRect(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
}

let players = []
let bullets = [];


// 连接 WebSocket 服务端
// const socket = new WebSocket('ws://localhost:3004');
const socket = new WebSocket('wss://gameapi.moonc.love/ws');

socket.addEventListener('open', () => {
    console.log('已连接到 WebSocket 服务器');
});

// 接收消息
socket.addEventListener('message', (event) => {
    const { type, data } = parseJSON(event.data);
    // console.log('📩 收到消息：', type, data);

    if (type === 'initMap') {
        Object.assign(WORLD, { ...data });
        initMap()
    }

    if (type === 'message') {
        showMsg(data)
    }

    if (type === 'renderGame') {
        players = data.players
        bullets = data.bullets
        renderGame()
    }
});


// 渲染主线程
function renderGame() {
    clearCanvas();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    players.forEach(p => {
        // 设置透明度
        ctx.globalAlpha = p.isAlive ? 1 : 0.3;

        // 绘制玩家矩形
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);

        // 绘制武器
        const barrelLength = 30 / 2;
        let [endX, endY] = [null, null];
        switch (p.direction) {
            case 'w':
                endX = p.x
                endY = p.y - barrelLength;
                break;
            case 's':
                endX = p.x
                endY = p.y + barrelLength;
                break;
            case 'a':
                endX = p.x - barrelLength;
                endY = p.y;
                break;
            case 'd':
                endX = p.x + barrelLength;
                endY = p.y;
                break;
        }
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // 绘制玩家ID
        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.id, p.x, p.y);
    });


    bullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

// 玩家移动
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        socket.send(sendJSON('move', key));
    }
    if ([' '].includes(key)) {
        socket.send(sendJSON('fire', key));
    }
});


function sendJSON(type, data) {
    return JSON.stringify({ type, data })
}

function parseJSON(msg) {
    return JSON.parse(msg);
}

// 通知
let msgDiv = null;
let currentTimer = null;
function showMsg(msg) {
    if (msgDiv) {
        msgDiv.remove();
        msgDiv = null;
        clearTimeout(currentTimer);
        currentTimer = null;
    }

    // 创建新的消息
    msgDiv = document.createElement('div');
    msgDiv.textContent = msg;
    Object.assign(msgDiv.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    });

    document.body.appendChild(msgDiv);

    currentTimer = setTimeout(() => {
        msgDiv.remove();
        msgDiv = null;
        currentTimer = null;
    }, 1000);
}