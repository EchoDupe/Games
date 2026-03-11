let stats = { money: 0, mult: 1, workers: 0, wPrice: 25, aPrice: 100 };
let workerModels = [];

// 1. Scene Setup
const scene = new THREE.Scene();
// Space Sky: Black with Stars
scene.background = new THREE.Color(0x000205);
for (let i = 0; i < 1000; i++) {
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    star.position.set((Math.random() - 0.5) * 400, (Math.random()) * 200, (Math.random() - 0.5) * 400);
    scene.add(star);
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lighting (Neon Glow)
scene.add(new THREE.AmbientLight(0x404040, 1));
const moonLight = new THREE.DirectionalLight(0x00ffff, 0.5);
moonLight.position.set(10, 50, 10);
scene.add(moonLight);

// 3. Environment & Borders
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x051a05 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Fence Border
function createFence(x, z, w, d) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, 2, d), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    f.position.set(x, 1, z);
    scene.add(f);
}
createFence(0, 100, 200, 1); createFence(0, -100, 200, 1);
createFence(100, 0, 1, 200); createFence(-100, 0, 1, 200);

// 4. The Shop Building
const shop = new THREE.Group();
const walls = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }));
const roof = new THREE.Mesh(new THREE.BoxGeometry(11, 1, 11), new THREE.MeshStandardMaterial({ color: 0x00ffff }));
roof.position.y = 3.5;
shop.add(walls, roof);
shop.position.set(0, 3, -20);
scene.add(shop);

// Shop NPC (The Merchant)
const merchant = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1), new THREE.MeshStandardMaterial({ color: 0x00ffff }));
merchant.position.set(0, 1, -20);
scene.add(merchant);

// 5. Trees & Workers
function createTree(x, z) {
    const g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3), new THREE.MeshStandardMaterial({ color: 0x1a0a00 }));
    const l = new THREE.Mesh(new THREE.ConeGeometry(2, 5, 6), new THREE.MeshStandardMaterial({ color: 0x003300, emissive: 0x001100 }));
    l.position.y = 3.5; g.add(t, l);
    g.position.set(x, 0, z); scene.add(g);
    return { obj: g, x, z };
}

let trees = [];
for (let i = 0; i < 40; i++) trees.push(createTree((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160));

function spawnWorker() {
    const bot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true }));
    bot.position.set((Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20);
    scene.add(bot);
    workerModels.push(bot);
}

// 6. Logic & Interaction
let player = { x: 0, z: 15, yaw: 0 };
let keys = {};
document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e') {
        let d = Math.sqrt(player.x ** 2 + (player.z + 20) ** 2);
        if (d < 8) window.toggleStore(true);
    }
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === document.body) player.yaw -= e.movementX * 0.002;
    camera.rotation.set(0, player.yaw, 0);
});

window.buyWorker = function() {
    if (stats.money >= stats.wPrice) {
        stats.money -= stats.wPrice;
        stats.workers++;
        spawnWorker();
        stats.wPrice = Math.floor(stats.wPrice * 1.6);
        updateUI();
    }
}

function updateUI() {
    document.getElementById('money').innerText = Math.floor(stats.money);
    document.getElementById('worker-cost').innerText = stats.wPrice;
    document.getElementById('worker-stat').innerText = "WORKERS: " + stats.workers;
}

function update() {
    let speed = keys["shift"] ? 0.6 : 0.3;
    if (keys["w"]) { player.x -= Math.sin(player.yaw) * speed; player.z -= Math.cos(player.yaw) * speed; }
    if (keys["s"]) { player.x += Math.sin(player.yaw) * speed; player.z += Math.cos(player.yaw) * speed; }
    
    // Border Collision
    player.x = Math.max(-98, Math.min(98, player.x));
    player.z = Math.max(-98, Math.min(98, player.z));

    camera.position.set(player.x, 3, player.z);

    // Prompt logic
    let distToShop = Math.sqrt(player.x ** 2 + (player.z + 20) ** 2);
    document.getElementById('interaction-prompt').style.display = distToShop < 8 ? 'block' : 'none';

    // Worker Movement
    workerModels.forEach(w => {
        w.rotation.y += 0.05;
        w.position.x += Math.sin(Date.now() * 0.001) * 0.05;
        stats.money += 0.005; // Passive income
        updateUI();
    });

    trees.forEach(t => {
        if (Math.sqrt((player.x - t.x) ** 2 + (player.z - t.z) ** 2) < 3) {
            stats.money += stats.mult; updateUI();
            t.x = (Math.random() - 0.5) * 160; t.z = (Math.random() - 0.5) * 160;
            t.obj.position.set(t.x, 0, t.z);
        }
    });
}

function animate() { requestAnimationFrame(animate); update(); renderer.render(scene, camera); }
animate();
