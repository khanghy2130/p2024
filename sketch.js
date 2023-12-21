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
        pointA, pointB, arcPoint, radius
    }


*/

const SCALING_FACTOR = 0.12; // controls the hexagon size
const BORDER_EXTEND = 1.1; // extends the border limit to include border hexes
const COLOR_CHANGING_SPEED = 0.015;
const ARC_EXTENSION = 0.0; // particle arc curveness
const PARTICLE_SPEED = 0.012;
const PARTICLE_SPEED_RANGE = 1.2; // added % of orginal speed
const AUTOCLICK_DELAY = 4; // in seconds


const doc = document.documentElement;
const rootStyle = document.querySelector(':root').style;

// Constants for rendering hexagons
let TILE_SCALE, SQRT_3, HALF_SQRT_3, HALF_TILE_SCALE, SCALED_SQRT;
let HEX_POINTS_RENDER;

let mostX = 0, mostY = 0; // grid size
let hexes = []; // contains hexagon objects
let transitions = [];
let autoClickTimer = 200;

let themeHue = Math.random() * 100;
let color1, color2;


function getCanvasSize(){
    return [doc.clientWidth, doc.clientHeight * 1.05];
}
function windowResized(){
    const [cvWidth, cvHeight] = getCanvasSize();
    resizeCanvas(cvWidth, cvHeight);
    resetApp();
}


function resetApp(){
    const oldTS = TILE_SCALE;

    // recalculate the constants for rendering
    TILE_SCALE = min(width, height) * SCALING_FACTOR;
    SQRT_3 = Math.sqrt(3);
    HALF_SQRT_3 = SQRT_3 / 2;
    HALF_TILE_SCALE = TILE_SCALE / 2;
    SCALED_SQRT = HALF_SQRT_3 * TILE_SCALE;
    HEX_POINTS_RENDER = [
        [HALF_TILE_SCALE, -SCALED_SQRT], // top right
        [TILE_SCALE, 0], // right
        [HALF_TILE_SCALE, SCALED_SQRT], // bottom right
        [-HALF_TILE_SCALE, SCALED_SQRT], // bottom left
        [-TILE_SCALE, 0], // left
        [-HALF_TILE_SCALE, -SCALED_SQRT] // top left
    ];

    const newMostX = ceil(width*BORDER_EXTEND *2/3/TILE_SCALE);
    const newMostY = ceil(height*BORDER_EXTEND /SCALED_SQRT/2);
    
    if (newMostX === mostX) { // only update rPos
        for (let y=0; y < mostY; y++){
            for (let x=0; x < mostX; x++){
                const hex = hexes[y][x];
                hex.renderPosition = getHexagonRenderPosition([x, y - floor(x/2)]);
            }
        }
    }
    else { // reset all
        mostX = newMostX;
        mostY = newMostY;

        transitions = []; 
        hexes = [];

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

    // update points in particles
    for (let i=0; i < transitions.length; i++){
        let particles = transitions[i].particles;
        for (let j=0; j < particles.length; j++){
            let pc = particles[j];
            pc.pointA = [pc.pointA[0]/oldTS*TILE_SCALE, pc.pointA[1]/oldTS*TILE_SCALE]
            pc.pointB = [pc.pointB[0]/oldTS*TILE_SCALE, pc.pointB[1]/oldTS*TILE_SCALE]
            pc.arcPoint = [pc.arcPoint[0]/oldTS*TILE_SCALE, pc.arcPoint[1]/oldTS*TILE_SCALE]
            pc.radius = pc.radius[0]/oldTS*TILE_SCALE;
        }
    }


}

function additionalRotation(){
    let factor = Math.random() > 0.5 ? 1 : -1;
    return factor * 120 * randomInt(1, 3);
}
function getArcPoint(point1, point2){
    const arcFactor = 1.01 + Math.random() * ARC_EXTENSION;
    const distance = dist(point1.x, point1.y, point2.x, point2.y);
    
    // Calculate the midpoint between the given points
    const midPoint = {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2
    };
    // Calculate the vector components
    const dx = (point2.x - point1.x) / distance;
    const dy = (point2.y - point1.y) / distance;
    
    // pick random from 2 points
    if (Math.random() > 0.5){
        return [
            midPoint.x + arcFactor * distance * dy,
            midPoint.y - arcFactor * distance * dx
        ];
    } else {
        return [
            midPoint.x - arcFactor * distance * dy,
            midPoint.y + arcFactor * distance * dx
        ];
    }
}
function pointOnArc(particle, arcPosition) {
    // Calculate the angle corresponding to the arcPosition
    // const startAngle = Math.atan2(arcStartPoint.y - midPoint.y, arcStartPoint.x - midPoint.x);
    // const endAngle = startAngle + (2 * Math.PI * arcPosition);
    
    return [
        particle.arcPoint[0] + particle.radius * Math.cos(arcPosition*10),
        particle.arcPoint[1] + particle.radius * Math.sin(arcPosition*10)
    ];
}

function generateParticles(hex1, hex2){
    let h1rp = hex1.renderPosition;
    let h2rp = hex2.renderPosition;
    
    // [rx, ry, rotation]
    let infoA = [
        [h1rp[0] - HALF_TILE_SCALE, h1rp[1] - SCALED_SQRT/3, 0], // top left
        [h1rp[0], h1rp[1] - SCALED_SQRT*2/3, 60], // top
        [h1rp[0] + HALF_TILE_SCALE, h1rp[1] - SCALED_SQRT/3, 0], // top right
        [h1rp[0] - HALF_TILE_SCALE, h1rp[1] + SCALED_SQRT/3, 60], // bottom left
        [h1rp[0], h1rp[1] + SCALED_SQRT*2/3, 0], // bottom
        [h1rp[0] + HALF_TILE_SCALE, h1rp[1] + SCALED_SQRT/3, 60] // bottom right
    ];
    let infoB = [
        [h2rp[0] - HALF_TILE_SCALE, h2rp[1] - SCALED_SQRT/3, 0], // top left
        [h2rp[0], h2rp[1] - SCALED_SQRT*2/3, 60], // top
        [h2rp[0] + HALF_TILE_SCALE, h2rp[1] - SCALED_SQRT/3, 0], // top right
        [h2rp[0] - HALF_TILE_SCALE, h2rp[1] + SCALED_SQRT/3, 60], // bottom left
        [h2rp[0], h2rp[1] + SCALED_SQRT*2/3, 0], // bottom
        [h2rp[0] + HALF_TILE_SCALE, h2rp[1] + SCALED_SQRT/3, 60] // bottom right
    ];
    infoB = shuffleArray(infoB.slice());

    return infoA.map((a, i) => {
        const b = infoB[i];
        const pc = {
            pointA: [a[0], a[1]], 
            rotationA: a[2] + additionalRotation(),
            pointB: [b[0], b[1]], 
            rotationB: b[2],
            progress: 0,
            speed: PARTICLE_SPEED * (1 + Math.random() * PARTICLE_SPEED_RANGE)
        };
        pc.arcPoint = getArcPoint(
            {x: pc.pointA[0], y: pc.pointA[1]}, 
            {x: pc.pointB[0], y: pc.pointB[1]}
        );
        pc.radius = dist(pc.arcPoint[0], pc.arcPoint[1], pc.pointA[0], pc.pointA[1]);
        return pc;
    });
}

function hexTouched(hex){
    let randomHex;
    let attemptsLeft = 15;
    while (true){
        if (attemptsLeft-- < 0) return; // too long to find, cancel
        randomHex = getRandomHex();
        // same color? reroll
        if (randomHex.colorBoolean === hex.colorBoolean) continue;
        // is already in transition? reroll
        if (randomHex.isInTransition) continue;
        break;
    } 
    
    // add transition
    transitions.push({
        hex1: hex, hex2: randomHex,
        colorBoolean: hex.colorBoolean, 
        particles: generateParticles(hex, randomHex)
    });
    hex.colorBoolean = !hex.colorBoolean; // flip hex1
    hex.isInTransition = true;
    randomHex.isInTransition = true;
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

function drawTriangle(rPos, r){
    push();
    translate(rPos[0], rPos[1]);
    rotate(r);
    triangle(
        0, -SCALED_SQRT*2/3, // top
        HALF_TILE_SCALE, SCALED_SQRT/3, // bottom right
        -HALF_TILE_SCALE, SCALED_SQRT/3 // bottom left
    );
    pop();
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
    themeHue += COLOR_CHANGING_SPEED; // color changing speed
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
                resetAutoClick();
                hexTouched(hex);
            }

        }
    }

    // update transitions & particles
    for (let i=transitions.length-1; i >= 0; i--){
        let trs = transitions[i];
        
        // update and render particles
        fill(trs.colorBoolean ? color1 : color2);
        let particles = trs.particles;
        let allCompleted = true;
        for (let j=0; j < particles.length; j++){ 
            let pc = particles[j];
            if (pc.progress < 1) allCompleted = false;
            pc.progress = min(pc.progress + pc.speed, 1);

            // fill("white");
            // circle(pc.pointA[0], pc.pointA[1], TILE_SCALE*0.5)
            // fill("black");
            // circle(pc.pointB[0], pc.pointB[1], TILE_SCALE*0.5)
            
            // fill("red");
            // circle(pc.arcPoint[0], pc.arcPoint[1], TILE_SCALE*0.3)

            // fill("yellow")
            // for (let ww = 0; ww < 50; ww++){
            //     const rPos = pointOnArc(pc, ww/50)
            //     circle(rPos[0], rPos[1], TILE_SCALE*0.1)
            // }

            


            /////// get eased progress
            const r = map(pc.progress, 0, 1, pc.rotationA, pc.rotationB);
            const x = map(pc.progress, 0, 1, pc.pointA[0], pc.pointB[0]);
            const y = map(pc.progress, 0, 1, pc.pointA[1], pc.pointB[1]);
            drawTriangle([x,y], r);
        }

        if (allCompleted){ // end transition
            transitions.splice(i, 1);
            trs.hex2.colorBoolean = !trs.hex2.colorBoolean;
            trs.hex1.isInTransition = false;
            trs.hex2.isInTransition = false;
        }
    }

    if (autoClickTimer-- === 0) {
        hexTouched(getRandomHex());
        resetAutoClick();
    }
    isTouching = false;
}

function resetAutoClick(){
    autoClickTimer = 60 * AUTOCLICK_DELAY;
}

let touchCountdown = 0;
let isTouching = false;
function touchEnded(){
	if (touchCountdown > 0) return;
	touchCountdown = 5;
    isTouching = true;
}

function getRandomHex(){
    return hexes[randomInt(0, hexes.length)][randomInt(0, hexes[0].length)];
}

function randomInt(start, end) { 
    return Math.floor(Math.random()*end + start); 
}
function getRandomItem(arr) { return arr[randomInt(0, arr.length)]; }
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const cc = console.log;

// let mainEle = document.getElementsByTagName("main")[0];
// for (let i=0; i < 8; i++){
//     mainEle.innerHTML += `<button>Button ${i}</button><br>`
// }