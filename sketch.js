
function windowResized(){
    resizeCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
    ///// reset app
}

function setup() {
    let mainEle = document.getElementsByTagName("main")[0];
    for (let i=0; i < 100; i++){
        mainEle.innerHTML += i + "<br>"
    }

    createCanvas(
        document.documentElement.clientWidth, 
        document.documentElement.clientHeight,
        document.getElementById("bg-canvas")
    );

}

let squareCount = 5;
function draw() {
    background(40);
    noFill();
    stroke(0);
    strokeWeight(10);
    for (let y=0; y < squareCount; y++){
        for (let x=0; x < squareCount; x++){
            rect(x * width/squareCount, y * height/squareCount, width/squareCount, height/squareCount)
        }
    }
}