const cc = console.log;

let showGreet = true;
let greetProgress = 0; // 0 to 100
const tiltPercent = 20; // angle of greet clip path
const scrollProgressRange = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--scroll-progress-range'));


window.addEventListener("load", updateScroll);
window.addEventListener("scroll", () => {
    if (updateScrollTimeout) return; // already set to trigger later
    else { // not set? trigger after a delay
        updateScrollTimeout = setTimeout(() => {
            updateScrollTimeout = null;
            updateScroll();
        }, 100); // delay time
    }
});


let updateScrollTimeout = null;
function updateScroll(){cc(greetProgress)
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


