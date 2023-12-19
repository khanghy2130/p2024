/*
    Hexagon Object {
        position, renderPosition,
        colorBoolean, isInTransition
    }

    --- start: hex1 flips, end: hex2 flips ---
    Transition {
        hex1 (from), hex2 (to),
        colorBoolean, particles
    }

    Particle {
        progress (0 to 1), speed,
        rotationA (0|60 + 120 * x), rotationB: 0|60,
        pointA, pointB, arcCenterPoint
    }


*/


const doc = document.documentElement;
const rootStyle = document.querySelector(':root').style;


// Constants for rendering hexagons
const SCALING_FACTOR = 0.11; // controls the hexagon size
const BORDER_EXTEND = 1.1; // extends the border limit to include border hexes
let TILE_SCALE, SQRT_3, HALF_SQRT_3, HALF_TILE_SCALE, SCALED_SQRT;
let HEX_POINTS_RENDER;
const NEIGHBOR_VERTICES = [
    [0, -1],
    [1, -1],
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0]
];

let mostX = 0, mostY = 0; // grid size
let hexes = []; // contains hexagon objects
let transitions = [];


let themeHue = Math.random() * 100;
let color1, color2;


function getCanvasSize(){
    return [doc.clientWidth, doc.clientHeight * 1.1];
}
function windowResized(){
    const [cvWidth, cvHeight] = getCanvasSize();
    resizeCanvas(cvWidth, cvHeight);
    resetApp();
}

function resetApp(){
    // reset
    transitions = []; 
    hexes = [];

    // recalculate the constants for rendering
    TILE_SCALE = min(width, height) * SCALING_FACTOR;
    SQRT_3 = Math.sqrt(3);
    HALF_SQRT_3 = SQRT_3 / 2;
    HALF_TILE_SCALE = TILE_SCALE / 2;
    SCALED_SQRT = HALF_SQRT_3 * TILE_SCALE;
    HEX_POINTS_RENDER = [
        [HALF_TILE_SCALE, -SCALED_SQRT],
        [TILE_SCALE, 0],
        [HALF_TILE_SCALE, SCALED_SQRT],
        [-HALF_TILE_SCALE, SCALED_SQRT],
        [-TILE_SCALE, 0],
        [-HALF_TILE_SCALE, -SCALED_SQRT]
    ];

    // find mostX & mostY
    let currentX = 0;
    let currentY = 0;
    while (true){
        let rPos = getHexagonRenderPosition([currentX, floor(currentY)]);
        // stop if x rPos is far past canvas width
        if (rPos[0] > width * BORDER_EXTEND) break;
        currentX++;
        currentY -= 0.5;
    }
    mostX = currentX;
    currentY = 0;
    while (true){
        let rPos = getHexagonRenderPosition([0, currentY]);
        // stop if y rPos is far past canvas height
        if (rPos[1] > height * BORDER_EXTEND) break;
        currentY++;
    }
    mostY = currentY;

    // set up a list of hexagons
    for (let y=0; y < mostY; y++){
        const row = [];
        for (let x=0; x < mostX; x++){
            row.push({
                position: [x,y], 
                renderPosition: getHexagonRenderPosition([x, y - floor(x/2)]),
                colorBoolean: y > (mostY/mostX) * x, // true is color1
                isInTransition: false
            });
        }
        hexes.push(row);
    }
}

function generateParticles(hex1, hex2){

}

function hexTouched(hex){
    let randomHex;
    let attemptsLeft = 12;
    while (true){
        if (attemptsLeft-- < 0) return; // too long to find, cancel
        randomHex = hexes[randomInt(0, mostY)][randomInt(0, mostX)];

        // same color? reroll
        if (randomHex.colorBoolean === hex.colorBoolean) continue;
        // is already in transition? reroll
        if (randomHex.isInTransition) continue;
        // adjacent to hex? reroll
        if (NEIGHBOR_VERTICES.some(v => (
            randomHex.position[0] - hex.position[0] === v[0] &&
            randomHex.position[1] - hex.position[1] === v[1]
        ))) continue;

        break;
    } 
    
    // add transition
    // transitions.push({
    //     hex1: hex, hex2: randomHex,
    //     colorBoolean: hex.colorBoolean, 
    //     particles: generateParticles(hex, randomHex)
    // });

    
    hex.colorBoolean = !hex.colorBoolean; // flip hex1


    ///////// remove this
    randomHex.colorBoolean = !randomHex.colorBoolean;
}


function getNeighborPosition(position, neighborIndex){
    let neighborRelativePosition = NEIGHBOR_VERTICES[neighborIndex];
    return [
        position[0] + neighborRelativePosition[0],
        position[1] + neighborRelativePosition[1]
    ];
}

// returns the center position of the hexagon to render
function getHexagonRenderPosition(position) {
    return [
        (position[0] * TILE_SCALE * 3) / 2, 
        (position[1] * 2 + position[0]) * SCALED_SQRT
    ];
}

// draw hexagon shape for given position
function drawHexagon(renderPosition){
    beginShape();
    for (let i = 0; i < HEX_POINTS_RENDER.length; i++) {
        vertex(
            renderPosition[0] + HEX_POINTS_RENDER[i][0], 
            renderPosition[1] + HEX_POINTS_RENDER[i][1]
        );
    }
    endShape(CLOSE);
}


function setup() {
    const [cvWidth, cvHeight] = getCanvasSize();
    createCanvas(cvWidth, cvHeight, document.getElementById("bg-canvas"));

    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    imageMode(CENTER);
    angleMode(DEGREES);
    strokeJoin(ROUND);
    colorMode(HSB, 100);
    noStroke();

    resetApp();
}


function draw() {
    // update theme colors
    themeHue += 0.02; // color changing speed
    if (themeHue > 100) themeHue -= 100;
    color1 = color(themeHue, 60, 35);
    color2 = color(themeHue, 50, 20);
    rootStyle.setProperty("--theme-color1", color1.toString());
    rootStyle.setProperty("--theme-color2", color2.toString());

    touchCountdown--; // update input blocking timer
    background(color2);

    
    // render all hexes
    for (let y=0; y < mostY; y++){
        for (let x=0; x < mostX; x++){
            const hex = hexes[y][x];
            if (hex.colorBoolean) fill(color1);
            else noFill(); // no need to render darker blocks
            drawHexagon(hex.renderPosition);
            
            // check hover
            if (isTouching && !hex.isInTransition && dist(
                hex.renderPosition[0], hex.renderPosition[1], mouseX, mouseY
            ) < TILE_SCALE*0.85){
                isTouching = false;
                hexTouched(hex);
            }

        }
    }

    // update transitions & particles
    ///// loop backwards transitions: loop particles to update their progress
    ///// once all particles completed, remove the transition (flip hex2, set !isInTransition)


    

    isTouching = false;
}

let touchCountdown = 0;
let isTouching = false;
function touchStarted(){
	if (touchCountdown > 0) return;
	touchCountdown = 5;
    isTouching = true;
}

function randomInt(start, end) { 
    return Math.floor(Math.random()*end + start); 
}
function getRandomItem(arr) { return arr[randomInt(0, arr.length)]; }


const cc = console.log;

// let mainEle = document.getElementsByTagName("main")[0];
// for (let i=0; i < 8; i++){
//     mainEle.innerHTML += `<button>Button ${i}</button><br>`
// }