/**
 * main.js - HallowEcho Advanced Raycasting Engine
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const assetsPath = './assets/';

// Configuration State
let config = {
    brightness: 1.0,
    sensitivity: 0.002,
    fov: Math.PI / 3,
    isPaused: false
};

const textureNames = [
    'grimy_plaster_wall.png', 'kitchen_wall.png', 'game_over_static.png',
    'broken_refrigerator.png', 'rusted_stove.png', 'grimy_kitchen_sink.png',
    'organic_remains_pile.png'
];

const textureCache = {};
let loadedImages = 0;
let zBuffer = [];

// --- ASSET PIPELINE ---
textureNames.forEach(name => {
    const img = new Image();
    img.onload = () => {
        loadedImages++;
        document.getElementById('load-text').innerText = `CALIBRATING: ${Math.floor((loadedImages/textureNames.length)*100)}%`;
        if(loadedImages === textureNames.length) {
            document.getElementById('load-text').style.display = 'none';
            document.getElementById('start-btn').style.display = 'block';
        }
    };
    img.src = assetsPath + name;
    textureCache[name] = img;
});

// --- UI HANDLERS ---
document.getElementById('bright').oninput = (e) => config.brightness = e.target.value / 100;
document.getElementById('sens').oninput = (e) => config.sensitivity = (e.target.value / 100) * 0.004;
document.getElementById('fov').oninput = (e) => config.fov = (e.target.value * Math.PI) / 180;

function toggleSettings() {
    config.isPaused = !config.isPaused;
    document.getElementById('settings').style.display = config.isPaused ? 'block' : 'none';
    if (config.isPaused) document.exitPointerLock();
}

// --- ENGINE STATE ---
let player = { x: 4.5, y: 8.5, dir: -Math.PI / 2 };
let keys = {};

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') toggleSettings();
});
window.addEventListener('keyup', e => keys[e.code] = false);

document.addEventListener('mousemove', e => {
    if (document.pointerLockElement === canvas && !config.isPaused) {
        player.dir += e.movementX * config.sensitivity;
    }
});

// --- CORE ENGINE FUNCTIONS ---

function getTile(x, y) {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) return 1;
    return houseData.floor1[Math.floor(y)][Math.floor(x)];
}

function castRays() {
    const w = canvas.width, h = canvas.height;
    zBuffer = new Array(w);

    for (let x = 0; x < w; x++) {
        let rayAngle = (player.dir - config.fov / 2) + (x / w) * config.fov;
        let dist = 0, hit = false, tileType = 0;
        
        let sin = Math.sin(rayAngle), cos = Math.cos(rayAngle);

        // Raymarching loop
        while (!hit && dist < 20) {
            dist += 0.02; 
            let testX = Math.floor(player.x + cos * dist);
            let testY = Math.floor(player.y + sin * dist);

            let t = getTile(testX, testY);
            if (t === 1 || t === 2) {
                hit = true;
                tileType = t;
            }
        }

        // Correct for fish-eye effect
        let correctedDist = dist * Math.cos(rayAngle - player.dir);
        zBuffer[x] = correctedDist;

        let lineH = h / (correctedDist || 0.1);
        let drawStart = (h - lineH) / 2;

        // Texture Selection
        let tex = tileType === 2 ? textureCache['kitchen_wall.png'] : textureCache['grimy_plaster_wall.png'];
        
        if (tex && tex.complete) {
            ctx.drawImage(tex, x, drawStart, 1, lineH);
        } else {
            ctx.fillStyle = "#222"; ctx.fillRect(x, drawStart, 1, lineH);
        }

        // Lighting calculation
        let light = Math.min(0.98, correctedDist / (14 * config.brightness));
        ctx.fillStyle = `rgba(0,0,0,${light})`;
        ctx.fillRect(x, drawStart, 1, lineH);
    }
}

function drawSprites() {
    const w = canvas.width, h = canvas.height;
    
    // Sort sprites by distance (Back-to-Front)
    let sortedSprites = decorObjects.map(obj => {
        let dx = (obj.x / 200) - player.x;
        let dy = (obj.y / 200) - player.y;
        return { ...obj, dist: dx*dx + dy*dy, dx, dy };
    }).sort((a, b) => b.dist - a.dist);

    sortedSprites.forEach(sprite => {
        let dist = Math.sqrt(sprite.dist);
        let spriteAngle = Math.atan2(sprite.dy, sprite.dx) - player.dir;

        // Wrap angle
        while (spriteAngle < -Math.PI) spriteAngle += 2 * Math.PI;
        while (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;

        if (Math.abs(spriteAngle) < config.fov) {
            let sSize = (h / dist) * (sprite.scale || 1);
            let xCenter = (0.5 * (spriteAngle / (config.fov / 2)) + 0.5) * w;
            let yCenter = (h - sSize) / 2;

            let tex = textureCache[sprite.img];
            // Check Z-Buffer at the center of the sprite to see if it's behind a wall
            if (tex && tex.complete && dist < zBuffer[Math.floor(xCenter)] + 0.5) {
                ctx.drawImage(tex, xCenter - sSize/2, yCenter, sSize, sSize);
                
                // Sprite shading
                let sShade = Math.min(0.8, dist / 12);
                ctx.fillStyle = `rgba(0,0,0,${sShade})`;
                ctx.fillRect(xCenter - sSize/2, yCenter, sSize, sSize);
            }
        }
    });
}

function update() {
    if (config.isPaused) return;

    let moveSpeed = keys['ShiftLeft'] ? 0.09 : 0.05;
    let nx = player.x, ny = player.y;

    // Movement Vectors
    let fwdX = Math.cos(player.dir), fwdY = Math.sin(player.dir);
    let sideX = Math.cos(player.dir + Math.PI/2), sideY = Math.sin(player.dir + Math.PI/2);

    if (keys['KeyW']) { nx += fwdX * moveSpeed; ny += fwdY * moveSpeed; }
    if (keys['KeyS']) { nx -= fwdX * moveSpeed; ny -= fwdY * moveSpeed; }
    if (keys['KeyA']) { nx -= sideX * moveSpeed; ny -= sideY * moveSpeed; }
    if (keys['KeyD']) { nx += sideX * moveSpeed; ny += sideY * moveSpeed; }

    // Collision Sliding (Checks X and Y separately)
    if (getTile(nx, player.y) === 0) player.x = nx;
    if (getTile(player.x, ny) === 0) player.y = ny;
}

function draw() {
    // Background (Ceiling/Floor)
    ctx.fillStyle = "#020202"; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    castRays();
    drawSprites();

    // Horror Vignette (Static Overlay)
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/0.7);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

window.initHallowEcho = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = houseData.spawn.x;
    player.y = houseData.spawn.y;
    
    function mainLoop() {
        update();
        draw();
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
};

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});