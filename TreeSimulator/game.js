let stats = { money: 0, mult: 1, workers: 0, wPrice: 25, aPrice: 100 };

// 1. Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue
scene.fog = new THREE.Fog(0x87CEEB, 40, 250); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Realistic Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(10, 50, 10);
scene.add(sun);

// 3. Realistic Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x2d5a27 }) // Grass Green
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// 4. Realistic Tree Function
function createTree(x, z) {
    const group = new THREE.Group();
    // Trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 3, 10),
        new THREE.MeshStandardMaterial({ color: 0x4d2926 }) // Brown
    );
    trunk.position.y = 1.5;
    // Foliage
    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a3300 }) // Forest Green
    );
    leaves.position.y = 4.5;
    
    group.add(trunk, leaves);
    group.position.set(x, 0, z);
    scene.add(group);
    return { obj: group, x: x, z: z };
}

let trees = [];
for(let i=0; i<45; i++) {
    trees.push(createTree((Math.random()-0.5)*180, (Math.random()-0.5)*180));
}

// 5. Controls & Movement
let player = { x: 0, z: 15, yaw: 0 };
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("mousemove", e => {
    if(document.pointerLockElement === document.body) {
        player.yaw -= e.movementX * 0.002;
        camera.rotation.set(0, player.yaw, 0);
    }
});

document.body.onclick = () => {
    if(document.getElementById('store-gui').style.display !== 'block') {
        document.body.requestPointerLock();
    }
};

// 6. Gameplay Logic
window.buyWorker = function() {
    if(stats.money >= stats.wPrice) {
        stats.money -= stats.wPrice;
        stats.workers++;
        stats.wPrice = Math.floor(stats.wPrice * 1.6);
        updateUI();
    }
}

window.buyAxe = function() {
    if(stats.money >= stats.aPrice) {
        stats.money -= stats.aPrice;
        stats.mult *= 2;
        stats.aPrice = Math.floor(stats.aPrice * 3);
        updateUI();
    }
}

function updateUI() {
    document.getElementById('money').innerText = Math.floor(stats.money);
    document.getElementById('worker-cost').innerText = stats.wPrice;
    document.getElementById('axe-cost').innerText = stats.aPrice;
}

function update() {
    let speed = keys["shift"] ? 0.6 : 0.3;
    if(keys["w"]) { player.x -= Math.sin(player.yaw) * speed; player.z -= Math.cos(player.yaw) * speed; }
    if(keys["s"]) { player.x += Math.sin(player.yaw) * speed; player.z += Math.cos(player.yaw) * speed; }
    if(keys["a"]) { player.x -= Math.cos(player.yaw) * speed; player.z += Math.sin(player.yaw) * speed; }
    if(keys["d"]) { player.x += Math.cos(player.yaw) * speed; player.z -= Math.sin(player.yaw) * speed; }
    
    camera.position.set(player.x, 3, player.z);

    trees.forEach(t => {
        let d = Math.sqrt((player.x - t.x)**2 + (player.z - t.z)**2);
        if(d < 3) {
            stats.money += (1 * stats.mult);
            updateUI();
            t.x = (Math.random()-0.5)*180;
            t.z = (Math.random()-0.5)*180;
            t.obj.position.set(t.x, 0, t.z);
        }
    });

    if(stats.workers > 0) {
        stats.money += (0.02 * stats.workers);
        updateUI();
    }
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
animate();
