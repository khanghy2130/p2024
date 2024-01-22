const cc = console.log;

let showGreet = true;
let greetProgress = 0; // 0 to 100
const tiltPercent = 20;
const scrollProgressRange = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--scroll-progress-range'));

window.addEventListener("scroll", onScrollHandler);
window.addEventListener("load", onScrollHandler);

function onScrollHandler(){
    const oldGreetProgress = greetProgress;
    greetProgress = Math.min(1, window.scrollY / scrollProgressRange) * 100;

    // greetProgress changed?
    if (oldGreetProgress !== greetProgress){
        const displayProgress = greetProgress * (1 + tiltPercent/100);
        const frontDiv = document.getElementById("greet-front-div");
        frontDiv.style.clipPath = `polygon(0 0, 0 100%, ${displayProgress - tiltPercent}% 100%, ${displayProgress}% 0)`;
        const behindDiv = document.getElementById("greet-behind-div");
        behindDiv.style.clipPath = `polygon(100% 0, 100% 100%, ${displayProgress - tiltPercent}% 100%, ${displayProgress}% 0)`;
    }

    // switch greet container and contact heading
    const middleSectionTop= document.getElementById("body-middle-section")
        .getBoundingClientRect().top;
    // Check if the top of div is above the viewport
    if (middleSectionTop < 0) {
        if (showGreet){
            showGreet = false; // show contact heading
            document.getElementById("greet-container").hidden = true;
            document.getElementById("contact-heading").hidden = false;
        }
    } 
    else if (!showGreet) {
        showGreet = true; // show greet container
        document.getElementById("greet-container").hidden = false;
        document.getElementById("contact-heading").hidden = true;
    }

}



function pageReady(){
    

    //// drop curtains
}