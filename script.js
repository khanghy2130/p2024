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


// load tool icons
const toolsContainer = document.getElementById("tools-container");
TOOLS_LIST.forEach((tool) => {
    const iconElement = new Image();
    iconElement.src = tool.iconSrc;
    iconElement.addEventListener("mouseenter", iconMouseEnterHandler);
    iconElement.addEventListener("mouseleave", iconMouseLeaveHandler);

    toolsContainer.appendChild(iconElement);
    tool.iconElement = iconElement;
});
function iconMouseEnterHandler(e){
    toolTargeter.targetedIcon = e.currentTarget;
    toolTargeter.setFramePosition();
    toolTargeter.setTargetedName();
    clearInterval(toolTargeter.autoChangeTimer);
}
function iconMouseLeaveHandler(e){
    toolTargeter.setAutoChangeTimer();
}


const toolTargeter = {
    // initial targetedIcon is a random icon
    targetedName: "",
    targetedIcon: getRandomToolIcon(),
    text: document.getElementById("tool-targeter-text"),
    frame: document.getElementById("tool-targeter-frame"),

    setFrameSize: function(){
        toolTargeter.frame.style.width = (toolTargeter.targetedIcon.clientWidth * 1.2) + "px";
        toolTargeter.frame.style.height = toolTargeter.frame.style.width;
    },
    setFramePosition: function(){
        const centerX = toolTargeter.targetedIcon.offsetLeft + toolTargeter.targetedIcon.offsetWidth / 2 - toolTargeter.frame.offsetWidth / 2;
        const centerY = toolTargeter.targetedIcon.offsetTop + toolTargeter.targetedIcon.offsetHeight / 2 - toolTargeter.frame.offsetHeight / 2;
        toolTargeter.frame.style.top = centerY + "px";
        toolTargeter.frame.style.left = centerX + "px";
    },
    setTargetedName: function(){
        TOOLS_LIST.some(({iconElement, toolName}) => {
            if (toolTargeter.targetedIcon === iconElement){
                toolTargeter.targetedName = toolName;
                return true;
            }
            return false;
        });
    },

    autoChangeTimer: null,
    setAutoChangeTimer: function(){
        clearInterval(toolTargeter.autoChangeTimer);
        toolTargeter.autoChangeTimer = setInterval(() => {
            toolTargeter.targetedIcon = getRandomToolIcon();
            toolTargeter.setFramePosition();
            toolTargeter.setTargetedName();
        }, 3000);
    },
    setToolNameUpdateTimer: function(){
        setInterval(() => {
            // check if name already matched
            if (toolTargeter.text.innerText === toolTargeter.targetedName) return;
            
            const textEle = toolTargeter.text;
            const loopLength = Math.max(
                toolTargeter.targetedName.length,
                textEle.innerText.length
            );
            for (let i=0; i < loopLength; i++){
                const targetChar = toolTargeter.targetedName.charAt(i);
                // check to change first wrong letter
                if (textEle.innerText.charAt(i) !== targetChar){
                    let charArr = textEle.innerText.split("");
                    if (!targetChar){
                        charArr.splice(i, 1); // no targetChar, remove char
                    } else {
                        charArr[i] = targetChar;
                    }
                    textEle.innerText = charArr.join("");
                    return; // exit after change
                }
            }
        }, 100);
    }
};


function getRandomToolIcon() {
    return TOOLS_LIST[
        Math.floor( Math.random() * TOOLS_LIST.length )
    ].iconElement;
}






function pageReady(){
    

    //// drop curtains
}



window.addEventListener("load", () => {
    updateScroll();
    toolTargeter.setFrameSize();
    toolTargeter.setFramePosition();
    toolTargeter.setTargetedName(); // already has a random target
    toolTargeter.setAutoChangeTimer();
    toolTargeter.setToolNameUpdateTimer();
});

window.addEventListener("resize", function(){
    toolTargeter.setFrameSize();
    toolTargeter.setFramePosition();
});

window.addEventListener("scroll", () => {
    if (updateScrollTimeout) return; // already set to trigger later
    else { // not set? trigger after a delay
        updateScrollTimeout = setTimeout(() => {
            updateScrollTimeout = null;
            updateScroll();
        }, 100); // delay time
    }
});