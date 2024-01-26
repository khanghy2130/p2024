const cc = console.log;

const TOOLS_LIST = [
    {
        toolName: "Git", iconSrc: "./tool-icons/Git.png"
    },
    {
        toolName: "HTML", iconSrc: "./tool-icons/HTML.png"
    },
    {
        toolName: "CSS", iconSrc: "./tool-icons/CSS.png"
    },
    {
        toolName: "JavaScript", iconSrc: "./tool-icons/JavaScript.png"
    },
    {
        toolName: "TypeScript", iconSrc: "./tool-icons/TypeScript.png"
    },
    {
        toolName: "React", iconSrc: "./tool-icons/React.png"
    },
    {
        toolName: "Next.js", iconSrc: "./tool-icons/Nextjs.png"
    },
    {
        toolName: "Remix", iconSrc: "./tool-icons/Remix.png"
    },
    {
        toolName: "Tailwind", iconSrc: "./tool-icons/Tailwind.png"
    },
    {
        toolName: "Bootstrap", iconSrc: "./tool-icons/Bootstrap.png"
    },
    {
        toolName: "Sass", iconSrc: "./tool-icons/Sass.png"
    },
    {
        toolName: "p5.js", iconSrc: "./tool-icons/p5js.png"
    },
    {
        toolName: "Socket.io", iconSrc: "./tool-icons/Socketio.png"
    },
    {
        toolName: "Supabase", iconSrc: "./tool-icons/Supabase.png"
    },
    {
        toolName: "Firebase", iconSrc: "./tool-icons/Firebase.png"
    },
    {
        toolName: "MongoDB", iconSrc: "./tool-icons/MongoDB.png"
    },
    {
        toolName: "Docker", iconSrc: "./tool-icons/Docker.png"
    }
];


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
function updateScroll(){
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


// load tools
const toolsContainer = document.getElementById("tools-container");
TOOLS_LIST.forEach(({toolName, iconSrc}) => {
    const iconElement = new Image();
    iconElement.src = iconSrc;
    toolsContainer.appendChild(iconElement);
})



function pageReady(){
    

    //// drop curtains
}


