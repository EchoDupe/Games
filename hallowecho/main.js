/**
 * main.js - HallowEcho Engine v1.3 (Spritework Update)
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const assetsPath = './assets/';
const textureCache = {};

// 1. ADD ALL YOUR DECOR TO THE LIST
const textureNames = [
    'grimy_plaster_wall.png', 'kitchen_wall.png', 'game_over_static.png',
    'broken_refrigerator.png', 'rusted_stove.png', 'grimy_kitchen_sink.png'
];

let brightnessMultiplier = 1.0;
let mouseSens = 0.002;
let settingsOpen = false;
let zBuffer = []; // To make sure sprites don't show through walls

// Load Textures
textureNames.forEach(name => {
    const img = new Image();
    img.src = assetsPath + name;
    textureCache[name] = img;
});

let player = { x: 4.5, y: 8.5, dir: -Math.PI / 2, fov: Math.PI / 3, dead: false };
let keys = {};

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') {
        settingsOpen = !settingsOpen;
        if (settingsOpen) document.exitPointerLock();
        document.getElementById('settingsMenu').style.display = settingsOpen ? 'block' : 'none';
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

document.addEventListener('mousemove', (e) => {
    if ((document.pointerLockElement === canvas) && !player.dead && !settingsOpen) {
        player.dir += e.movementX * mouseSens;
    }
});

function isWall(x, y) {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) return true;
    const tile = houseData.floor1[Math.floor(y)][Math.floor(x)];
    return (tile === 1 || tile === 2);
}

function castRays() {
    const width = canvas.width;
    const height = canvas.height;
    zBuffer = []; // Reset Z-Buffer for sprites

    for (let i = 0; i < width; i++) {
        let rayAngle = (player.dir - player.fov / 2) + (i / width) * player.fov;
        let distanceToWall = 0;
        let hitWall = false;
        let hitType = 0;

        let eyeX = Math.cos(rayAngle);
        let eyeY = Math.sin(rayAngle);

        while (!hitWall && distanceToWall < 16) {
            distanceToWall += 0.05;
            let testX = Math.floor(player.x + eyeX * distanceToWall);
            let testY = Math.floor(player.y + eyeY * distanceToWall);
            if (testX < 0 || testX >= 10 || testY < 0 || testY >= 10) {
                hitWall = true; distanceToWall = 16;
            } else {
                let cell = houseData.floor1[testY][testX];
                if (cell === 1 || cell === 2) { hitWall = true; hitType = cell; }
            }
        }

        zBuffer[i] = distanceToWall; // Store distance for sprite clipping

        let wallHeight = height / distanceToWall;
        let ceiling = (height - wallHeight) / 2;
        
        let tex = hitType === 2 ? textureCache['kitchen_wall.png'] : textureCache['grimy_plaster_wall.png'];
        if (tex && tex.complete && tex.naturalWidth !== 0) {
            ctx.drawImage(tex, i, ceiling, 1, wallHeight);
        } else {
            ctx.fillStyle = "#333"; ctx.fillRect(i, ceiling, 1, wallHeight);
        }
        
        let shadow = Math.min(0.9, distanceToWall / (12 * brightnessMultiplier));
        ctx.fillStyle = `rgba(0,0,0,${shadow})`;
        ctx.fillRect(i, ceiling, 1, wallHeight);
    }
}

// 2. NEW FUNCTION TO DRAW THE STOVE/FRIDGE
function drawSprites() {
    const width = canvas.width;
    const height = canvas.height;

    decorObjects.forEach(obj => {
        // Convert map pixel coords to grid coords (1 tile = 200px in your map settings)
        let objX = obj.x / 200;
        let objY = obj.y / 200;

        let dx = objX - player.x;
        let dy = objY - player.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        // Calculate angle to sprite
        let spriteAngle = Math.atan2(dy, dx) - player.dir;
        while (spriteAngle < -Math.PI) spriteAngle += 2 * Math.PI;
        while (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;

        // If it's within FOV
        if (Math.abs(spriteAngle) < player.fov) {
            let spriteSize = height / dist;
            let xPos = (0.5 * (spriteAngle / (player.fov / 2)) + 0.5) * width;
            let yPos = (height - spriteSize) / 2;

            let tex = textureCache[obj.img];
            if (tex && tex.complete && dist < zBuffer[Math.floor(xPos)]) {
                ctx.drawImage(tex, xPos - spriteSize/2, yPos, spriteSize, spriteSize);
                
                // Darken sprites based on distance
                let shade = Math.min(0.8, dist / 10);
                ctx.fillStyle = `rgba(0,0,0,${shade})`;
                ctx.fillRect(xPos - spriteSize/2, yPos, spriteSize, spriteSize);
            }
        }
    });
}

function update() {
    if (player.dead || settingsOpen) return;
    let moveSpeed = keys['ShiftLeft'] ? 0.08 : 0.05;
    let nx = player.x;
    let ny = player.y;

    if (keys['KeyW']) { nx += Math.cos(player.dir) * moveSpeed; ny += Math.sin(player.dir) * moveSpeed; }
    if (keys['KeyS']) { nx -= Math.cos(player.dir) * moveSpeed; ny -= Math.sin(player.dir) * moveSpeed; }
    if (keys['KeyA']) { nx += Math.cos(player.dir - Math.PI/2) * moveSpeed; ny += Math.sin(player.dir - Math.PI/2) * moveSpeed; }
    if (keys['KeyD']) { nx += Math.cos(player.dir + Math.PI/2) * moveSpeed; ny += Math.sin(player.dir + Math.PI/2) * moveSpeed; }

    if (!isWall(nx, player.y)) player.x = nx;
    if (!isWall(player.x, ny)) player.y = ny;
}

function draw() {
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = "#151515"; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    castRays();
    drawSprites(); // DRAW STUFF AFTER WALLS

    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 50, canvas.width/2, canvas.height/2, canvas.width/(0.7 * brightnessMultiplier));
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'black');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.initHallowEcho = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = houseData.spawn.x;
    player.y = houseData.spawn.y;
    function loop() { update(); draw(); requestAnimationFrame(loop); }
    loop();
};