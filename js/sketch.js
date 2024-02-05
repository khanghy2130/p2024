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
        pointA, pointB, midpoint,
        startAngle, radius, negArc
    }
*/

const SCALING_FACTOR = 0.169; // controls the hexagon size
const BORDER_EXTEND = 1.1; // extends the border limit to include border hexes
const COLOR_CHANGING_SPEED = 0.02;
const PARTICLE_SPEED = 0.01;
const PARTICLE_SPEED_RANGE = 1.1; // added % of orginal speed
const AUTOCLICK_DELAY = 3; // in seconds


const doc = document.documentElement;
const rootStyle = document.querySelector(':root').style;

// Constants for rendering hexagons
let TILE_SCALE, SQRT_3, HALF_SQRT_3, HALF_TILE_SCALE, SCALED_SQRT;
let HEX_POINTS_RENDER;

let mostX = 0, mostY = 0; // grid size
let hexes = []; // contains hexagon objects
let transitions = [];
let autoClickTimer = 200;

let color1, color2;


function getCanvasSize() {
    return [doc.clientWidth, doc.clientHeight * 1.1];
}
function windowResized() {
    const [cvWidth, cvHeight] = getCanvasSize();
    resizeCanvas(cvWidth, cvHeight);
    resetApp();
}


function resetApp() {
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

    const newMostX = ceil(width * BORDER_EXTEND * 2 / 3 / TILE_SCALE);
    const newMostY = ceil(height * BORDER_EXTEND / SCALED_SQRT / 2);

    if (newMostX === mostX) { // only update rPos
        for (let y = 0; y < mostY; y++) {
            for (let x = 0; x < mostX; x++) {
                const hex = hexes[y][x];
                hex.renderPosition = getHexagonRenderPosition([x, y - floor(x / 2)]);
            }
        }
    }
    else { // reset all
        mostX = newMostX;
        mostY = newMostY;

        transitions = [];
        hexes = [];

        // set up a list of hexagons
        for (let y = 0; y < mostY; y++) {
            const row = [];
            for (let x = 0; x < mostX; x++) {
                row.push({
                    position: [x, y],
                    renderPosition: getHexagonRenderPosition([x, y - floor(x / 2)]),
                    colorBoolean: y > (mostY / mostX) * x, // true is color1
                    isInTransition: false
                });
            }
            hexes.push(row);
        }
    }

    // TS changed? end all transitions
    if (oldTS !== TILE_SCALE) {
        for (let i = 0; i < transitions.length; i++) {
            let particles = transitions[i].particles;
            for (let j = 0; j < particles.length; j++) {
                particles[j].progress = 1;
            }
        }
    }
}


function generateParticles(hex1, hex2) {
    let h1rp = hex1.renderPosition;
    let h2rp = hex2.renderPosition;

    // [rx, ry, rotation]
    let infoA = [
        [h1rp[0] - HALF_TILE_SCALE, h1rp[1] - SCALED_SQRT / 3, 0], // top left
        [h1rp[0], h1rp[1] - SCALED_SQRT * 2 / 3, 60], // top
        [h1rp[0] + HALF_TILE_SCALE, h1rp[1] - SCALED_SQRT / 3, 0], // top right
        [h1rp[0] - HALF_TILE_SCALE, h1rp[1] + SCALED_SQRT / 3, 60], // bottom left
        [h1rp[0], h1rp[1] + SCALED_SQRT * 2 / 3, 0], // bottom
        [h1rp[0] + HALF_TILE_SCALE, h1rp[1] + SCALED_SQRT / 3, 60] // bottom right
    ];
    let infoB = [
        [h2rp[0] - HALF_TILE_SCALE, h2rp[1] - SCALED_SQRT / 3, 0], // top left
        [h2rp[0], h2rp[1] - SCALED_SQRT * 2 / 3, 60], // top
        [h2rp[0] + HALF_TILE_SCALE, h2rp[1] - SCALED_SQRT / 3, 0], // top right
        [h2rp[0] - HALF_TILE_SCALE, h2rp[1] + SCALED_SQRT / 3, 60], // bottom left
        [h2rp[0], h2rp[1] + SCALED_SQRT * 2 / 3, 0], // bottom
        [h2rp[0] + HALF_TILE_SCALE, h2rp[1] + SCALED_SQRT / 3, 60] // bottom right
    ];
    infoB = shuffleArray(infoB.slice());

    return infoA.map((a, i) => {
        const b = infoB[i];
        const pc = {
            pointA: [a[0], a[1]],
            rotationA: a[2] + randomInt(-2, 3) * 120,
            pointB: [b[0], b[1]],
            rotationB: b[2],
            progress: 0,
            speed: PARTICLE_SPEED * (1 + Math.random() * PARTICLE_SPEED_RANGE),
            negArc: Math.random() > 0.5 ? 1 : -1
        };
        pc.midpoint = [(pc.pointA[0] + pc.pointB[0]) / 2, (pc.pointA[1] + pc.pointB[1]) / 2];
        pc.startAngle = 90 - atan2(pc.pointA[1] - pc.midpoint[1], pc.pointA[0] - pc.midpoint[0]);
        pc.radius = dist(pc.midpoint[0], pc.midpoint[1], pc.pointA[0], pc.pointA[1]);
        return pc;
    });
}

function hexTouched(hex) {
    let randomHex;
    let attemptsLeft = 25;
    while (true) {
        if (attemptsLeft-- < 0) return; // too long to find, cancel
        randomHex = getRandomHex();
        // same color? reroll
        if (randomHex.colorBoolean === hex.colorBoolean) continue;
        // is already in transition? reroll
        if (randomHex.isInTransition) continue;
        // too far away? reroll
        if (dist(hex.renderPosition[0], hex.renderPosition[1],
            randomHex.renderPosition[0], randomHex.renderPosition[1]) / TILE_SCALE > 5
        ) continue;
        break;
    }

    // add transition
    transitions.push({
        hex1: hex, hex2: randomHex,
        colorBoolean: hex.colorBoolean,
        particles: generateParticles(hex, randomHex)
    });
    hex.colorBoolean = !hex.colorBoolean; // flip hex1
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
function drawHexagon(renderPosition) {
    beginShape();
    for (let i = 0; i < HEX_POINTS_RENDER.length; i++) {
        vertex(
            renderPosition[0] + HEX_POINTS_RENDER[i][0],
            renderPosition[1] + HEX_POINTS_RENDER[i][1]
        );
    }
    endShape(CLOSE);
}

function drawTriangle(rPos, r) {
    push();
    translate(rPos[0], rPos[1]);
    rotate(r);
    triangle(
        0, -SCALED_SQRT * 2 / 3, // top
        HALF_TILE_SCALE, SCALED_SQRT / 3, // bottom right
        -HALF_TILE_SCALE, SCALED_SQRT / 3 // bottom left
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
    noStroke();

    color1 = color(getComputedStyle(document.documentElement)
    .getPropertyValue('--background-color2'));
    color2 = color(getComputedStyle(document.documentElement)
    .getPropertyValue('--background-color1'));

    resetApp();
    if (typeof onCanvasLoaded !== "undefined") onCanvasLoaded();
}


function draw() {
    touchCountdown--; // update input blocking timer
    background(color2);


    // render all hexes
    for (let y = 0; y < mostY; y++) {
        for (let x = 0; x < mostX; x++) {
            const hex = hexes[y][x];
            if (hex.colorBoolean) fill(color1);
            else noFill(); // no need to render darker blocks
            drawHexagon(hex.renderPosition);

            // check hover
            if (isTouching && !hex.isInTransition && dist(
                hex.renderPosition[0], hex.renderPosition[1], mouseX, mouseY
            ) < TILE_SCALE * 0.85) {
                isTouching = false;
                resetAutoClick();
                hexTouched(hex);
            }

        }
    }

    // update transitions & particles
    for (let i = transitions.length - 1; i >= 0; i--) {
        let trs = transitions[i];

        // update and render particles
        fill(trs.colorBoolean ? color1 : color2);
        let particles = trs.particles;
        let allCompleted = true;
        for (let j = 0; j < particles.length; j++) {
            let pc = particles[j];
            if (pc.progress < 1) allCompleted = false;
            pc.progress = min(pc.progress + pc.speed, 1);

            const eProgress = sin(pc.progress * 90);
            const r = map(eProgress, 0, 1, pc.rotationA, pc.rotationB);
            const deg = map(eProgress, 0, 1, 0, 180);

            drawTriangle([
                sin(pc.startAngle + deg * pc.negArc) * pc.radius + pc.midpoint[0],
                cos(pc.startAngle + deg * pc.negArc) * pc.radius + pc.midpoint[1]
            ], r);
        }

        if (allCompleted) { // end transition
            transitions.splice(i, 1);
            trs.hex2.colorBoolean = !trs.hex2.colorBoolean;
            trs.hex2.isInTransition = false;
        }
    }

    if (autoClickTimer-- === 0) {
        let randomHex;
        do { randomHex = getRandomHex(); }
        while (randomHex.isInTransition)
        hexTouched(randomHex);
        resetAutoClick();
    }
    isTouching = false;
}

function resetAutoClick() {
    autoClickTimer = 60 * AUTOCLICK_DELAY;
}

let touchCountdown = 0;
let isTouching = false;
function touchEnded() {
    if (touchCountdown > 0) return;
    touchCountdown = 5;
    isTouching = true;
}

function getRandomHex() {
    return hexes[randomInt(0, hexes.length)][randomInt(0, hexes[0].length)];
}
function randomInt(start, end) {
    return Math.floor(Math.random() * end + start);
}
function getRandomItem(arr) { return arr[randomInt(0, arr.length)]; }
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

