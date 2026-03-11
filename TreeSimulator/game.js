let stats = { money: 0, mult: 5, rebirths: 0, workers: 0, wPrice: 25, aPrice: 100 };
let bots = [];

// 1. Scene & Space Sky
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000105);
scene.fog = new THREE.FogExp2(0x000105, 0.008);

// Starfield
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<2000; i++) {
    starCoords.push((Math.random()-0.5)*600, (Math.random()-0.5)*600, (Math.random()-0.5)*600);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.5})));

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Realistic Ground & Borders
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(250, 250),
    new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: 0.8 })
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Border Fence
const fenceMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
function makeWall(x, z, w, d) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), fenceMat);
    wall.position.set(x, 2, z); scene.add(wall);
}
makeWall(0, 125, 250, 1); makeWall(0, -125, 250, 1);
makeWall(125, 0, 1, 250); makeWall(-125, 0, 1, 250);

// 3. The Shop Building
const shop = new THREE.Group();
const building = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshStandardMaterial({color: 0x111111}));
const glow = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.5, 12.2), new THREE.MeshBasicMaterial({color: 0x00ffff}));
glow.position.y = 4; shop.add(building, glow);
shop.position.set(0, 4, -40); scene.add(shop);

// 4. Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const pointLight = new THREE.PointLight(0x00ffff, 2, 50);
pointLight.position.set(0, 10, -40); scene.add(pointLight);

// 5. Trees & Workers
function createTree(x, z) {
    const g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 4), new THREE.MeshStandardMaterial({color: 0x221100}));
    const l = new THREE.Mesh(new THREE.ConeGeometry(2.5, 6, 8), new THREE.MeshStandardMaterial({color: 0x0a2a0a}));
    l.position.y = 4; g.add(t, l);
    g.position.set(x, 0, z); scene.add(g);
    return { obj: g, x, z };
}
let trees = [];
for(let i=0; i<50; i++) trees.push(createTree((Math.random()-0.5)*200, (Math.random()-0.5)*200));

function spawnBot() {
    const bot = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial({color: 0x00ffff, wireframe: true}));
    bot.position.set(0, 5, 0); scene.add(bot);
    bots.push(bot);
}

// 6. Controls & Interaction
let player = { x: 0, z: 20, yaw: 0 };
let keys = {};
document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if(e.key === 'e' || e.key === 'E') {
        if(Math.sqrt(player.x**2 + (player.z + 40)**2) < 15) document.getElementById('store-gui').style.display='block';
    }
    if(e.key === 'k' || e.key === 'K') { player.x = 0; player.z = -25; } // Teleport
    if(e.key === 'p' || e.key === 'P') document.getElementById('settings-gui').style.display='block';
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("mousemove", e => {
    if(document.pointerLockElement === document.body) {
        player.yaw -= e.movementX * 0.002;
        camera.rotation.set(0, player.yaw, 0);
    }
});
document.body.onclick = () => { if(document.getElementById('store-gui').style.display === 'none') document.body.requestPointerLock(); };

// 7. Logic functions
window.buyWorker = function() {
    if(stats.money >= stats.wPrice) { stats.money -= stats.wPrice; stats.workers++; spawnBot(); stats.wPrice *= 2; updateUI(); }
};
window.doRebirth = function() {
    if(stats.money >= 5000) { 
        stats.money = 0; stats.rebirths++; stats.mult = 5 + (stats.rebirths * 5); 
        stats.workers = 0; bots.forEach(b => scene.remove(b)); bots = []; updateUI();
    }
};

function updateUI() {
    document.getElementById('money').innerText = Math.floor(stats.money);
    document.getElementById('rebirths').innerText = stats.rebirths;
    document.getElementById('w-cost').innerText = stats.wPrice;
}

function update() {
    let speed = keys["shift"] ? 0.8 : 0.4;
    if(keys["w"]) { player.x -= Math.sin(player.yaw) * speed; player.z -= Math.cos(player.yaw) * speed; }
    if(keys["s"]) { player.x += Math.sin(player.yaw) * speed; player.z += Math.cos(player.yaw) * speed; }
    
    // Border check
    player.x = Math.max(-120, Math.min(120, player.x));
    player.z = Math.max(-120, Math.min(120, player.z));
    camera.position.set(player.x, 4, player.z);

    // Harvest
    trees.forEach(t => {
        if(Math.sqrt((player.x - t.x)**2 + (player.z - t.z)**2) < 4) {
            stats.money += stats.mult; updateUI();
            t.x = (Math.random()-0.5)*200; t.z = (Math.random()-0.5)*200;
            t.obj.position.set(t.x, 0, t.z);
        }
    });

    // Bots logic
    bots.forEach(b => {
        b.position.y = 5 + Math.sin(Date.now()*0.002);
        stats.money += 0.02 * stats.mult; updateUI();
    });
}

function animate() { requestAnimationFrame(animate); update(); renderer.render(scene, camera); }
animate();
