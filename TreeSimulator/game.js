// --- 1. STATS & SAVING ---
let stats = {
    money: 0,
    mult: 5,
    rebirths: 0,
    workers: 0,
    wPrice: 25
};

function save() { localStorage.setItem('EchoDupe_TreeSave', JSON.stringify(stats)); }
function load() {
    const d = localStorage.getItem('EchoDupe_TreeSave');
    if(d) { stats = JSON.parse(d); updateUI(); }
}
window.resetGame = function() {
    if(confirm("Erase all data?")) { localStorage.removeItem('EchoDupe_TreeSave'); location.reload(); }
};

// --- 2. THE WORLD (Daylight & Sky) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 50, 400);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHTING: Max Brightness
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 150, 50);
scene.add(sun);

// Grass
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// --- 3. ANIMATED CLOUDS ---
let clouds = [];
function makeCloud() {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    for(let i=0; i<4; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random()*3, 8, 8), mat);
        p.position.set(i*3, Math.random()*2, Math.random()*2);
        group.add(p);
    }
    group.position.set((Math.random()-0.5)*500, 50 + Math.random()*20, (Math.random()-0.5)*500);
    scene.add(group);
    return group;
}
for(let i=0; i<15; i++) clouds.push(makeCloud());

// --- 4. THE TREES (Multiple Styles + Brown Trunks) ---
let trees = [];
function createTree(x, z) {
    const group = new THREE.Group();
    const type = Math.floor(Math.random() * 3); // 0: Pine, 1: Round, 2: Blocky

    // Brown Trunk (Planting it slightly into ground)
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 5),
        new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    trunk.position.y = 2.5;
    group.add(trunk);

    // Leaves
    let leafGeo;
    if(type === 0) leafGeo = new THREE.ConeGeometry(3.5, 9, 8);
    else if(type === 1) leafGeo = new THREE.SphereGeometry(3.5, 8, 8);
    else leafGeo = new THREE.BoxGeometry(5, 5, 5);

    const leaves = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: 0x388e3c }));
    leaves.position.y = (type === 1) ? 6.5 : 8;
    group.add(leaves);

    group.position.set(x, 0, z);
    scene.add(group);
    return { obj: group, x, z };
}
for(let i=0; i<80; i++) trees.push(createTree((Math.random()-0.5)*400, (Math.random()-0.5)*400));

// --- 5. CONTROLS & CAMERA ---
let player = { x: 0, z: 20, yaw: 0 };
let keys = {};

window.addEventListener("mousedown", () => {
    if(document.getElementById('store-gui').style.display === 'none') {
        renderer.domElement.requestPointerLock();
    }
});

document.addEventListener("mousemove", (e) => {
    if(document.pointerLockElement === renderer.domElement) {
        player.yaw -= e.movementX * 0.003;
        camera.rotation.set(0, player.yaw, 0);
    }
});

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if(e.key.toLowerCase() === 'e') {
        document.getElementById('store-gui').style.display = 'block';
        document.exitPointerLock();
    }
    if(e.key.toLowerCase() === 'p') {
        document.getElementById('settings-gui').style.display = 'block';
        document.exitPointerLock();
    }
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// --- 6. MECHANICS ---
window.buyWorker = function() {
    if(stats.money >= stats.wPrice) {
        stats.money -= stats.wPrice; stats.workers++;
        stats.wPrice = Math.floor(stats.wPrice * 1.5);
        updateUI(); save();
    }
};

window.doRebirth = function() {
    if(stats.money >= 5000) {
        stats.money = 0; stats.rebirths++;
        stats.mult = 5 * (stats.rebirths + 1);
        stats.workers = 0; stats.wPrice = 25;
        updateUI(); save();
    }
};

function updateUI() {
    document.getElementById('money').innerText = Math.floor(stats.money);
    document.getElementById('w-cost').innerText = stats.wPrice;
}

setInterval(() => {
    if(stats.workers > 0) {
        stats.money += (stats.workers * (stats.rebirths + 1));
        updateUI(); save();
    }
}, 1000);

// --- 7. MAIN LOOP ---
function update() {
    let speed = keys["shift"] ? 1.2 : 0.6;
    if(keys["w"]) { player.x -= Math.sin(player.yaw) * speed; player.z -= Math.cos(player.yaw) * speed; }
    if(keys["s"]) { player.x += Math.sin(player.yaw) * speed; player.z += Math.cos(player.yaw) * speed; }
    if(keys["a"]) { player.x -= Math.cos(player.yaw) * speed; player.z += Math.sin(player.yaw) * speed; }
    if(keys["d"]) { player.x += Math.cos(player.yaw) * speed; player.z -= Math.sin(player.yaw) * speed; }

    camera.position.set(player.x, 6, player.z);

    // Clouds Drift
    clouds.forEach(c => {
        c.position.x += 0.05;
        if(c.position.x > 300) c.position.x = -300;
    });

    // Harvesting
    trees.forEach(t => {
        const dist = Math.sqrt((player.x - t.x)**2 + (player.z - t.z)**2);
        if(dist < 5) {
            stats.money += stats.mult;
            updateUI(); save();
            t.x = (Math.random()-0.5)*400; t.z = (Math.random()-0.5)*400;
            t.obj.position.set(t.x, 0, t.z);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

load();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
