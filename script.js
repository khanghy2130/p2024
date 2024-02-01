const cc = console.log;


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
        }, 120);
    }
};


function getRandomToolIcon() {
    return TOOLS_LIST[
        Math.floor( Math.random() * TOOLS_LIST.length )
    ].iconElement;
}



let hoveredProjectIndex = null;
// create other-projects items from data
const otherProjectsContainerEle = document.getElementById("other-projects-container");
//////const otherProjectElements = [];
for (let i=0; i < OTHER_PROJECTS.length; i++){
    /*<p> 
        <a> <button> (text) <svg/> </button> </a>
        (text) OR <a> link </a>
    </p>*/
    const project = OTHER_PROJECTS[i];

    const pEle = document.createElement("p");
    pEle.classList.add("other-projects-item");
    otherProjectsContainerEle.append(pEle);
    
    const buttonAnchorEle = document.createElement("a");
    buttonAnchorEle.target = "_blank";
    buttonAnchorEle.href = project.link;
    pEle.appendChild(buttonAnchorEle); // add <a> to <p>

    const buttonEle = document.createElement("button");
    buttonEle.appendChild(document.createTextNode(project.title));
    buttonAnchorEle.appendChild(buttonEle); // add <button> to <a>
    // add cloned new-tab-svg
    buttonEle.appendChild(
        document.getElementsByClassName("new-tab-svg")[0].cloneNode(true)
    );
    
    // description (add text / link)
    for (let j=0; j < project.description.length; j++){
        const descItem = project.description[j];
        if (typeof descItem === "string"){
            pEle.appendChild(document.createTextNode(descItem));
        } 
        else {
            const linkAnchorEle = document.createElement("a");
            linkAnchorEle.target = "_blank";
            linkAnchorEle.href = descItem.link;
            linkAnchorEle.innerText = descItem.text;
            linkAnchorEle.classList.add("link");
            pEle.appendChild(linkAnchorEle);
        }
    }

    // otherProjectElements.push(pEle);
    // // events
    // pEle.addEventListener("mouseenter", () => {
    //     hoveredProjectIndex = i;
    // });
    // pEle.addEventListener("mouseleave", () => {
    //     hoveredProjectIndex = null;
    // });
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