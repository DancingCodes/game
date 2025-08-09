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
    // // 地图的真实大小
    // const worldWidth = MAP_DATA.WORLD_WIDTH;
    // const worldHeight = MAP_DATA.WORLD_HEIGHT;

    // // 浏览器窗口大小
    // const windowWidth = window.innerWidth;
    // const windowHeight = window.innerHeight;

    // // 计算宽高比例
    // const worldRatio = worldWidth / worldHeight;
    // const windowRatio = windowWidth / windowHeight;

    // // 铺满浏览器窗口
    // if (windowRatio > worldRatio) {
    //     canvas.height = windowHeight;
    //     canvas.width = windowHeight * worldRatio;
    // } else {
    //     canvas.width = windowWidth;
    //     canvas.height = windowWidth / worldRatio;
    // }
    // clearCanvas();


    const worldWidth = MAP_DATA.WORLD_WIDTH;
    const worldHeight = MAP_DATA.WORLD_HEIGHT;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    canvas.width = worldWidth;
    canvas.height = worldHeight;

    const scaleX = windowWidth / worldWidth;
    const scaleY = windowHeight / worldHeight;

    // 取最小缩放比例，保持宽高比
    const scale = Math.min(scaleX, scaleY);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale);

    clearCanvas();

}

// 重置Canvas
function clearCanvas() {
    ctx.fillStyle = MAP_DATA.WORLD_BGCOLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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