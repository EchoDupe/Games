/**
 * HALLOWECHO: FIRST-PERSON RAYCASTING ENGINE
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Updated to the new lowercase relative path
const assetsPath = './assets/';
const textureCache = {};
const textureNames = [
    'grimy_plaster_wall.png', 'dusty_hardwood_floor.png', 
    'kitchen_wall.png', 'creature_silhouette.png', 'game_over_static.png'
];

// Preload Textures
textureNames.forEach(name => {
    const img = new Image();
    img.src = assetsPath + name;
    textureCache[name] = img;
});

const sfx = {
    gameOver: new Audio(assetsPath + 'game_over.mp3'),
    footstep: new Audio(assetsPath + 'footstep_wood.mp3')
};

// Player State
let player = {
    x: 2.5, y: 2.5, 
    dir: 0, 
    fov: Math.PI / 3,
    dead: false,
    stamina: 100
};

let keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function castRays() {
    const width = canvas.width;
    const height = canvas.height;
    const numRays = width; 
    const map = houseData.floor1;

    for (let i = 0; i < numRays; i++) {
        let rayAngle = (player.dir - player.fov / 2) + (i / numRays) * player.fov;
        let distanceToWall = 0;
        let hitWall = false;

        let eyeX = Math.cos(rayAngle);
        let eyeY = Math.sin(rayAngle);

        while (!hitWall && distanceToWall < 16) {
            distanceToWall += 0.02;
            let testX = Math.floor(player.x + eyeX * distanceToWall);
            let testY = Math.floor(player.y + eyeY * distanceToWall);

            if (testX < 0 || testX >= map[0].length || testY < 0 || testY >= map.length) {
                hitWall = true; distanceToWall = 16;
            } else if (map[testY][testX] === 1) {
                hitWall = true;
                
                let wallHeight = height / distanceToWall;
                let ceiling = (height - wallHeight) / 2;
                
                // Drawing using the preloaded texture
                if (textureCache['grimy_plaster_wall.png'].complete) {
                    ctx.drawImage(textureCache['grimy_plaster_wall.png'], i, ceiling, 1, wallHeight);
                }
                
                // Distance Shading
                ctx.fillStyle = `rgba(0,0,0,${Math.min(1, distanceToWall / 10)})`;
                ctx.fillRect(i, ceiling, 1, wallHeight);
            }
        }
    }
}

function update() {
    if (player.dead) return;

    let moveSpeed = keys['ShiftLeft'] ? 0.08 : 0.04;
    let rotSpeed = 0.03;

    if (keys['KeyW']) {
        let nx = player.x + Math.cos(player.dir) * moveSpeed;
        let ny = player.y + Math.sin(player.dir) * moveSpeed;
        if (houseData.floor1[Math.floor(ny)][Math.floor(nx)] !== 1) { player.x = nx; player.y = ny; }
    }
    if (keys['KeyS']) {
        let nx = player.x - Math.cos(player.dir) * moveSpeed;
        let ny = player.y - Math.sin(player.dir) * moveSpeed;
        if (houseData.floor1[Math.floor(ny)][Math.floor(nx)] !== 1) { player.x = nx; player.y = ny; }
    }
    if (keys['KeyA']) player.dir -= rotSpeed;
    if (keys['KeyD']) player.dir += rotSpeed;
}

function draw() {
    if (player.dead) {
        ctx.drawImage(textureCache['game_over_static.png'], 0, 0, canvas.width, canvas.height);
        return;
    }

    // Floor and Ceiling
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = "#111"; ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

    castRays();

    // Flashlight Overlay
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 50, canvas.width/2, canvas.height/2, canvas.width/0.8);
    grad.addColorStop(0, 'rgba(255,255,230,0.05)');
    grad.addColorStop(1, 'black');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // UI Dot
    ctx.fillStyle = "red";
    ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 2, 0, Math.PI*2); ctx.fill();
}

function triggerGameOver() {
    player.dead = true;
    sfx.gameOver.play();
    setTimeout(() => { window.location.reload(); }, 4000);
}

window.initHallowEcho = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    function loop() { 
        update(); 
        draw(); 
        requestAnimationFrame(loop); 
    }
    loop();
};