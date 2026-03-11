// --- 1. CONFIG & STATS ---
let stats = { money: 0, mult: 5, rebirths: 0, workers: 0, wPrice: 25 };
let isMenuOpen = false, isHarvesting = false;
let velocityY = 0, isGrounded = true;

function save() { localStorage.setItem('TreeSim_v4', JSON.stringify(stats)); }
function load() {
    const d = localStorage.getItem('TreeSim_v4');
    if(d) { stats = JSON.parse(d); updateUI(); }
}

// --- 2. THE WORLD (Hills & Borders) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(50, 150, 50); scene.add(sun);

// Hills logic
const groundGeo = new THREE.PlaneGeometry(800, 800, 40, 40);
const pos = groundGeo.attributes.position;
for(let i=0; i<pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x*0.05) * Math.cos(y*0.05) * 4); // Random Hills
}
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ color: 0x3d8c40 }));
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Neon Border
const border = new THREE.Mesh(
    new THREE.TorusGeometry(390, 2, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x00ffff })
);
border.rotation.x = Math.PI/2; scene.add(border);

// --- 3. REALISTIC TREES (Branches & Sizes) ---
let trees = [];
function createDetailedTree(x, z) {
    const group = new THREE.Group();
    const scale = 0.5 + Math.random() * 2.5; // HUGE variety in size

    // Trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.6, 6),
        new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    trunk.position.y = 3; group.add(trunk);

    // Branches
    for(let i=0; i<3; i++) {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 3), new THREE.MeshStandardMaterial({color: 0x5d4037}));
        branch.position.y = 3 + i;
        branch.rotation.z = Math.random() * 1.5;
        branch.rotation.y = Math.random() * Math.PI * 2;
        group.add(branch);
    }

    // Leaves (Blobs)
    const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(3.5), new THREE.MeshStandardMaterial({color: 0x2e7d32}));
    leaves.position.y = 7; group.add(leaves);

    group.scale.set(scale, scale, scale);
    group.position.set(x, 0, z);
    scene.add(group);
    return { obj: group, x, z, scale };
}
for(let i=0; i<110; i++) trees.push(createDetailedTree((Math.random()-0.5)*700, (Math.random()-0.5)*700));

// Shop House
const shop = new THREE.Mesh(new THREE.BoxGeometry(15, 10, 15), new THREE.MeshStandardMaterial({color: 0x8d6e63}));
shop.position.set(0, 5, -60); scene.add(shop);

// --- 4. PLAYER & JUMP ---
let player = { x: 0, z: 10, y: 6, yaw: 0 };
let keys = {};

window.addEventListener("mousedown", () => { if(!isMenuOpen) renderer.domElement.requestPointerLock(); });
document.addEventListener("mousemove", (e) => {
    if(document.pointerLockElement === renderer.domElement) {
        player.yaw -= e.movementX * 0.003;
        camera.rotation.set(0, player.yaw, 0);
    }
});

document.addEventListener("keydown", e => {
    const k = e.key.toLowerCase(); keys[k] = true;
    if(k === ' ' && isGrounded) { velocityY = 0.3; isGrounded = false; }
    if(k === 'e' || k === 'p') {
        isMenuOpen = true; 
        document.getElementById(k === 'e' ? 'store-gui' : 'settings-gui').style.display = 'block';
        document.exitPointerLock();
    }
    if(k === 'k') teleportToShop();
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

window.teleportToShop = function() { player.x = 0; player.z = -40; };

// --- 5. LOGIC ---
window.buyWorker = function() {
    if(stats.money >= stats.wPrice) {
        stats.money -= stats.wPrice; stats.workers++;
        stats.wPrice = Math.floor(stats.wPrice * 1.6);
        updateUI(); save();
    }
};

function updateUI() { document.getElementById('money').innerText = Math.floor(stats.money); document.getElementById('w-cost').innerText = stats.wPrice; }

// --- 6. GAME LOOP ---
function update() {
    if(isMenuOpen) return;

    let speed = keys["shift"] ? 1.5 : 0.8;
    if(keys["w"]) { player.x -= Math.sin(player.yaw) * speed; player.z -= Math.cos(player.yaw) * speed; }
    if(keys["s"]) { player.x += Math.sin(player.yaw) * speed; player.z += Math.cos(player.yaw) * speed; }
    if(keys["a"]) { player.x -= Math.cos(player.yaw) * speed; player.z += Math.sin(player.yaw) * speed; }
    if(keys["d"]) { player.x += Math.cos(player.yaw) * speed; player.z -= Math.sin(player.yaw) * speed; }

    // Gravity/Jump
    player.y += velocityY;
    if(player.y > 6) { velocityY -= 0.015; } else { player.y = 6; velocityY = 0; isGrounded = true; }

    // Border Check
    const distFromCenter = Math.sqrt(player.x**2 + player.z**2);
    if(distFromCenter > 380) { player.x *= 0.98; player.z *= 0.98; }

    camera.position.set(player.x, player.y, player.z);

    // Harvest
    if(!isHarvesting) {
        trees.forEach(t => {
            if(Math.sqrt((player.x - t.x)**2 + (player.z - t.z)**2) < 8) {
                isHarvesting = true; stats.money += stats.mult;
                updateUI(); save();
                t.x = (Math.random()-0.5)*700; t.z = (Math.random()-0.5)*700;
                t.obj.position.set(t.x, 0, t.z);
                setTimeout(() => { isHarvesting = false; }, 200);
            }
        });
    }
}

function animate() { requestAnimationFrame(animate); update(); renderer.render(scene, camera); }
load(); animate();
