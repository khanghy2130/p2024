const doc = document.documentElement;
const color1 = getComputedStyle(doc).getPropertyValue("--theme-color1");
const color2 = getComputedStyle(doc).getPropertyValue("--theme-color2");


function getCanvasSize(){
    return [doc.clientWidth, doc.clientHeight * 1.2];
}

function windowResized(){
    const [cvWidth, cvHeight] = getCanvasSize();
    resizeCanvas(cvWidth, cvHeight);
    ///// reset app
}

function setup() {
    let mainEle = document.getElementsByTagName("main")[0];
    for (let i=0; i < 50; i++){
        mainEle.innerHTML += `<button>Button ${i}</button><br>`
    }

    const [cvWidth, cvHeight] = getCanvasSize();
    createCanvas(cvWidth, cvHeight, document.getElementById("bg-canvas"));

}

let squareCount = 5;
function draw() {
    touchCountdown--;

    background(color2);
    noFill();
    stroke(color1);
    strokeWeight(10);
    for (let y=0; y < squareCount; y++){
        for (let x=0; x < squareCount; x++){
            rect(x * width/squareCount, y * height/squareCount, width/squareCount, height/squareCount)
        }
    }

}

let touchCountdown = 0;
function touchEnded(){
	if (touchCountdown > 0) return;
	else touchCountdown = 5;

    
}