/**
 * map.js - HallowEcho House Layout
 */

const MAP_SETTINGS = {
    tileSize: 200,
    houseWidth: 10,
    houseHeight: 10
};

// Texture mapping for the grid
const TILE_TYPES = {
    1: 'grimy_plaster_wall.png',   // Living Room/Hall walls
    0: 'dusty_hardwood_floor.png', // Main floor
    2: 'kitchen_wall.png',         // Kitchen walls
    3: 'kitchen_floor.png',        // Kitchen floor
    'S': 'stairs_placeholder'      // We can use a dark floor for stairs
};

const houseData = {
    floor1: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 2, 2, 2, 1], // Transition to kitchen on the right
        [1, 0, 0, 0, 0, 0, 3, 3, 2, 1],
        [1, 0, 0, 0, 0, 0, 3, 3, 2, 1],
        [1, 0, 0, 0, 0, 0, 3, 3, 2, 1],
        [1, 1, 1, 0, 0, 2, 2, 2, 2, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, S, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    floor2: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, S, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
};

// Decor Objects (Static items placed in the world)
// format: { x, y, img, w, h, floor }
const decorObjects = [
    { x: 1400, y: 300, img: 'broken_refrigerator.png', w: 100, h: 180, floor: 'floor1' },
    { x: 1550, y: 300, img: 'rusted_stove.png', w: 100, h: 100, floor: 'floor1' },
    { x: 1700, y: 300, img: 'grimy_kitchen_sink.png', w: 100, h: 100, floor: 'floor1' },
    { x: 400, y: 400, img: 'stained_mattress.png', w: 200, h: 300, floor: 'floor2' },
    { x: 600, y: 200, img: 'broken_mirror.png', w: 60, h: 100, floor: 'floor2' },
    { x: 1000, y: 800, img: 'organic_remains_pile.png', w: 150, h: 100, floor: 'floor1' }
];