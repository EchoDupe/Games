/**
 * map.js - House Geometry & Object Definitions
 */
const houseData = {
    floor1: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 2, 2, 2, 1], 
        [1, 0, 0, 0, 0, 0, 3, 3, 2, 1],
        [1, 0, 0, 0, 0, 0, 3, 3, 2, 1],
        [1, 0, 0, 0, 0, 0, 3, 3, 2, 1],
        [1, 1, 1, 0, 0, 2, 2, 2, 2, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 2, 2, 0, 0, 0, 0, 0, 1], 
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    spawn: { x: 4.5, y: 8.5, dir: -Math.PI / 2 }
};

const decorObjects = [
    { x: 1400, y: 300, img: 'broken_refrigerator.png', scale: 1.0 },
    { x: 1550, y: 300, img: 'rusted_stove.png', scale: 0.8 },
    { x: 1700, y: 300, img: 'grimy_kitchen_sink.png', scale: 0.8 },
    { x: 1000, y: 800, img: 'organic_remains_pile.png', scale: 0.5 }
];