/*
    Hexagon Object {
        position, renderPosition,
        colorIndex, isInTransition
    }

    --- start: hex1 flips, end: hex2 flips ---
    Transition {
        colorIndex, Particles[],
        Hex1 (from), Hex2 (to)
    }

    Particle {
        progress (0 to 1), rotationA (0|60 + 120 * x), rotationB: 0|60,
        pointA, pointB, arcCenterPoint
    }

*/


const doc = document.documentElement;
const color1 = getComputedStyle(doc).getPropertyValue("--theme-color1");
const color2 = getComputedStyle(doc).getPropertyValue("--theme-color2");


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




function getCanvasSize(){
    return [doc.clientWidth, doc.clientHeight];
}
function windowResized(){
    const [cvWidth, cvHeight] = getCanvasSize();
    resizeCanvas(cvWidth, cvHeight);
    resetApp();
}

function resetApp(){
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

    /// find mostX & mostY
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
    mostY = currentY



    // set up a list of hexagons
    hexes = [];



    
    // clear stuffs???
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

    resetApp();
}

function draw() {
    touchCountdown--;
    background(color2);


    fill(0,200,0);
    noStroke();
    for (let y=0; y < mostY; y++){
        for (let x=0; x < mostX; x++){
            if (y > (mostY/mostX) * x){
                fill(color1);
            } else {
                noFill();
            }
            drawHexagon(getHexagonRenderPosition([x, y - floor(x/2)]));
        }
    }

}

let touchCountdown = 0;
function touchEnded(){
	if (touchCountdown > 0) return;
	else touchCountdown = 5;

    
}




let mainEle = document.getElementsByTagName("main")[0];
for (let i=0; i < 10; i++){
    mainEle.innerHTML += `<button>Button ${i}</button><br>`
}