let currentScore = 0;
let isGameLoopRunning = false;

const keyStates = {xMovement: [], forward: []}; // Currently pressed down keys
const keyStatesValues = {xMovement: ["a", "ArrowLeft", "d", "ArrowRight"], forward: ["w", "ArrowUp", " "]}; // Currently pressed down keys
const keyCooldowns = {};
const clickStates = {};
let velocityState = 0;

const xMovementCooldownTime = 100;
const shootCooldownTime = 200;
const canvasWidthVelocityFactor = 0.03053435114503816793;
const canvasWidthMaxVelocityFactor = 0.22213740458015267175;

let Engine = Matter.Engine; // Physics engine
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

let gameCanvas = document.getElementById('game-canvas');
let gameCanvasHeight = gameCanvas.clientHeight;
let gameCanvasWidth = gameCanvas.clientWidth;

const engine = Engine.create();
const render = Render.create({
    element: gameCanvas,
    engine: engine,
    options: {
        width: gameCanvasWidth,
        height: gameCanvasHeight,
        showAngleIndicator: false,
        showCollisions: true,
        showSeparations: true,
        background: 'none',
        wireframes: false
    }
});

let runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);

// Create player body (assuming you already have a player in the DOM)
// let playerBody = Bodies.rectangle(400, 550, 50, 30, {
//     isStatic: true,
//     label: "player",
//     render: {
//         sprite: {
//             texture: "images/components/whitebox.svg"
//         }
//     }
// });

// Composite.add(engine.world, playerBody);

// Function to update render dimensions
function updateRenderDimensions() {
    // Get the current dimensions of the game canvas
    gameCanvasWidth = gameCanvas.clientWidth;
    gameCanvasHeight = gameCanvas.clientHeight;

    // Update the render's dimensions
    Render.setSize(render, gameCanvasWidth, gameCanvasHeight);
}

// Resize event listener
window.addEventListener('resize', () => {
    updateRenderDimensions();
});

// Function to create enemies
function createEnemy() {
    const enemy = Bodies.rectangle(getRandomNumberBetween(80, gameCanvasWidth - 120), 50, 0.1 * gameCanvasWidth, 30, {
        isStatic: true,
        label: 'enemy',
        health: 2,
        render: {
            fillStyle: "green"
        }
    });
    Composite.add(engine.world, enemy);
    
    // Animate enemy movement downward
    Matter.Body.setVelocity(enemy, { x: 0, y: 0.5 }); // Set downward velocity

    // Remove enemy after they go out of view
    setTimeout(() => {
        Composite.remove(engine.world, enemy);
    }, 4000); // Remove after 4 seconds
}

// Create a shooting projectile
function shootProjectile() {
    const projectile = document.createElement("img");
    projectile.src = "images/components/projectile.png";
    projectile.onload = function() {
        projectile.style.width = "1.5vmin";
        projectile.id = "projectile";
        projectile.alt = "Projectile";
        projectile.style.visibility = "hidden";
        gameCanvas.appendChild(projectile);

        const player = document.getElementById("player");
        const playerComputedStyle = window.getComputedStyle(player);
        const playerHeight = parseInt(playerComputedStyle.height);
        const playerWidth = parseFloat(playerComputedStyle.width);
        const projectileWidth = parseFloat(window.getComputedStyle(projectile).width);
        const projectileHeight = parseFloat(window.getComputedStyle(projectile).height);

        const playerPosition = parseFloat(playerComputedStyle.left);
        const xPos = playerPosition + (playerWidth / 2);
        const yPos = gameCanvasHeight - playerHeight;

        const projectileBody = Bodies.rectangle(xPos, yPos, 0.2, 0.5, {
            isStatic: false,
            label: "projectile",
            render: {
                sprite: {
                    texture: "images/components/projectile.png",
                    xScale: 0.7,
                    yScale: 1.3
                }
             }
        });

        Composite.add(engine.world, projectileBody);
        Matter.Body.setVelocity(projectileBody, { x: 0, y: -40 }); // Move projectileBody upward

        setTimeout(() => {
            projectile.remove();
            Composite.remove(engine.world, projectileBody);
        }, 2000);
    };
}

// Collision detection to check if projectile hits an enemy
Matter.Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check for collision between projectile and enemy
        if ((bodyA.label === 'projectile' && bodyB.label === 'enemy') || 
        (bodyA.label === 'enemy' && bodyB.label === 'projectile')) {
            // Handle the collision, e.g., removing the enemy and projectile
            
            // Determine which body is the enemy
            const enemyBody = bodyA.label === 'enemy' ? bodyA : bodyB;
            const projectileBody = bodyA.label === 'projectile' ? bodyA : bodyB;
            
            enemyBody.health--;
            if (enemyBody.health <= 0) {
                Composite.remove(engine.world, enemyBody);
                currentScore++; // Increment score
                updateScore(); // Update score display
            } else {
                enemyBody.render.fillStyle = "red";
            }

            Composite.remove(engine.world, projectileBody);
        }
    });
});

// Example function to start enemy creation at intervals
function startEnemySpawn() {
    setInterval(createEnemy, 2000); // Create an enemy every 2 seconds
}

/* Function to handle the initial key event */
const initialKeyEventHandler = function(event) {
    const fullscreenState = document.getElementById("fullscreen-control");
    if ((event.type === "click" && !fullscreenState.contains(event.target)) ||
        (event.key === "w" || event.key === " " || event.key === "ArrowUp")) {
        startEnemySpawn();

	    document.body.removeEventListener("keydown", initialKeyEventHandler);
	    gameCanvas.removeEventListener("click", initialKeyEventHandler);
        triggerOnStart();
        requestAnimationFrame(() => {
            document.body.addEventListener("keydown", keyDownHandler);
            document.body.addEventListener("keyup", keyUpHandler);
            gameCanvas.addEventListener("mousedown", clickDownHandler);
            gameCanvas.addEventListener("mouseup", clickUpHandler);
        });
    }
}

function triggerOnStart() {
    /* Animate the background */
    const scoreElement = document.getElementById("score");
    scoreElement.style.display = "block";
    gameCanvas.style.animation = "moveBackground 3.0s linear infinite";

    /* Turn on the music! */
    const audioElement = document.getElementById("audio-element");
    audioElement.play();

    /* Remove the start instruction */
    const startText = document.getElementById("start-text");
    startText.remove();

    /* Initialize falling asteroid animation in the game canvas */
    setTimeout(() => {
        createAsteroid(3000);
        setInterval(() => {
            createAsteroid(3000);
        }, 3000);

    }, 1000);

    /* Initialize random planet animation in the game canvas */
    setTimeout(() => {
        /* Variable which sets the planet to spawn either in the
        * first or last quarter of the game canvas.
        */
        let quarter = Math.floor(Math.random() * 2) + 1;
        const planetAnimationTime = 3000;
        randomPlanetsAnimate(quarter, planetAnimationTime);
        setInterval(() => {
            if (quarter === 1) {
                quarter = 2;
                randomPlanetsAnimate(quarter, planetAnimationTime);
            }
            else {
                quarter = 1;
                randomPlanetsAnimate(quarter, planetAnimationTime);
            }
        }, 8000);
    }, 6000)
}

document.body.addEventListener("keydown", initialKeyEventHandler);
gameCanvas.addEventListener("click", initialKeyEventHandler);

let lastTimeXMovementTriggered;

function checkIfTooRecentXMovement() {
    /* Function to prevent glitching when spamming movement keys */
    const timeToPass = 100;
    if (velocityState !== 0) {
        if (Date.now() < lastTimeXMovementTriggered + timeToPass) {
            return true;
        }
        else {
            return false;
        }
    }
}

const keyDownHandler = function(event) {
    Object.keys(keyStatesValues).forEach((key) => {
        if (keyStatesValues[key].includes(event.key)) {
            if (key === "xMovement") {
                if (checkIfTooRecentXMovement()) {
                    return;
                }
                lastTimeXMovementTriggered = Date.now();
            }
            keyStates[key][event.key] = true;
        }
    });

    /* Start the game loop if not already running */
    if (!isGameLoopRunning) {
        isGameLoopRunning = true;
        gameLoop();
    }
}

let decelerationInterval;
function deceleration(decelerationDirection, input) {
    changeVelocity(input);
    if ((decelerationDirection === "left" && velocityState <= 0) ||
    (decelerationDirection === "right" && velocityState >= 0)) {
        velocityState = 0;
        clearInterval(decelerationInterval);
    }
    else {
        movePlayerHorizontally(velocityState);
    }
}

const keyUpHandler = function(event) {
    /* remove key states and cooldowns */
    Object.keys(keyStates).forEach((key) => {
        const entry = keyStates[key];
        if (entry[event.key]) {
            delete entry[event.key];
        }
    });

    delete keyCooldowns[event.key];
    const decelerationTime = 50; //Time in ms between each deceleration of velocity
    const decrement = gameCanvasWidth * (canvasWidthVelocityFactor);

    if (keyStatesValues["xMovement"].includes(event.key)) {
        // Only start decelerating if velocity is greater/lesser than +-20
        if (velocityState > 20) { // Initial velocity direction is to the right
            clearInterval(decelerationInterval);
            decelerationInterval = setInterval(() => {
                deceleration("left", -decrement);
            }, decelerationTime);
        }
        else if (velocityState < -20) { // Initial velocity direction is to the left
            clearInterval(decelerationInterval);
            decelerationInterval = setInterval(() => {
                deceleration("right", decrement);
            }, decelerationTime);
        }
        else {
            velocityState = 0;
        }
    }
}

const clickDownHandler = function(event) {
    const fullscreenState = document.getElementById("fullscreen-control");
    if (!fullscreenState.contains(event.target)) {
        clickStates[event.button] = true;

        if (!isGameLoopRunning) {
            isGameLoopRunning = true;
            gameLoop();
        }
    }
}

const clickUpHandler = function(event) {
    delete clickStates[event.button];
}

function changeVelocity(increment) {
    const maxVelocity = gameCanvasWidth * canvasWidthMaxVelocityFactor;
    const minVelocity = -(gameCanvasWidth * canvasWidthMaxVelocityFactor);

    velocityState = Math.max(minVelocity, Math.min(maxVelocity, velocityState + increment));
}

function xMovement(direction, currentTime) {
    if (direction === "right") {
        changeVelocity(gameCanvasWidth * canvasWidthVelocityFactor);
    }
    else if (direction === "left") {
        changeVelocity(-(gameCanvasWidth * canvasWidthVelocityFactor));
    }
    movePlayerHorizontally(velocityState);
    keyCooldowns[direction] = currentTime + xMovementCooldownTime; // Set cooldown end time
}

function gameLoop() {
    const currentTime = Date.now();

    /* process key states */
    if ((keyStates.xMovement["a"] || keyStates.xMovement["ArrowLeft"]) &&
        (!keyCooldowns["left"] || currentTime >= keyCooldowns["left"])) {
        xMovement("left", currentTime);
    }

    if ((keyStates.xMovement["d"] || keyStates.xMovement["ArrowRight"]) &&
        (!keyCooldowns["right"] || currentTime >= keyCooldowns["right"])) {
        xMovement("right", currentTime);
    }

    if ((keyStates.forward["w"] || keyStates.forward[" "] || keyStates.forward["ArrowUp"]) &&
        (!keyCooldowns["forward"] || currentTime > keyCooldowns["forward"])) {
        shootProjectile();
        keyCooldowns["forward"] = currentTime + shootCooldownTime;
    }

    if (clickStates["0"] && (!keyCooldowns["forward"] || currentTime > keyCooldowns["forward"])) {
        shootProjectile();
        keyCooldowns["forward"] = currentTime + shootCooldownTime;
    }

    /* request the next frame */
    if (isGameLoopRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function movePlayerHorizontally(distance) {
    const player = document.getElementById("player");
    const playerPosition = getComputedStyle(player).left;
    let playerPositionInt = parseInt(playerPosition);

    const maxPosition = gameCanvasWidth - 180;
    const minPosition = 40;

    if (playerPositionInt > maxPosition) {
        playerPositionInt = maxPosition;
        velocityState = 0;
    }
    else if (playerPositionInt < minPosition) {
        playerPositionInt = minPosition;
        velocityState = 0;
    }
    else {
        playerPositionInt += distance;
    }
    player.style.left = playerPositionInt + "px";
}

function updateScore() {
    const score = document.querySelector(".score");
    const scoreNumber = score.querySelector("#score-number");
    scoreNumber.innerText = currentScore;
}

function initAudioIcon() {
    const path = "images/components/";
    const audioControlContainer = document.getElementById("audio-control");
    const audioElement = document.getElementById("audio-element");
    const audioControlIcon = document.createElement('img');
    audioControlIcon.style.width = "80%";
    audioControlIcon.id = "audio-control-icon";

    const muteState = localStorage.getItem("audio_mute_state");
    if (muteState === null) { // If not previously cached
        localStorage.setItem("audio_mute_state", "false");
    }

    setTimeout(() => {
        if (muteState === "true") {
            audioControlIcon.src = path + "speaker_muted.svg"; // Set to muted icon
            audioElement.muted = true;
        } else {
            audioControlIcon.src = path + "speaker_active.svg"; // Set to active icon
            audioElement.muted = false;
        }
    }, 200);

    audioControlContainer.appendChild(audioControlIcon);
}

function toggleAudio() {
    const path = "images/components/";
    const audioButton = document.getElementById("audio-control");
    const audioControlIcon = document.getElementById("audio-control-icon");
    const audioElement = document.getElementById("audio-element");

    audioControlIcon.alt = "Audio";
    audioButton.style.pointerEvents = "none";

    audioControlIcon.style.transition = "scale .2s";
    audioControlIcon.style.scale = "1.15";
    setTimeout(() => {
        audioControlIcon.style.scale = "1.0";
    }, 200);

    setTimeout(() => {
        const muteState = localStorage.getItem("audio_mute_state");
        if (muteState === null) { // If not previously cached
            localStorage.setItem("audio_mute_state", "false");
        }

        if (muteState === "true") {
            audioControlIcon.src = path + "speaker_active.svg"; // Set to active icon
            audioElement.muted = false;
            localStorage.setItem("audio_mute_state", "false");
        } else {
            audioControlIcon.src = path + "speaker_muted.svg"; // Set to muted icon
            audioElement.muted = true;
            localStorage.setItem("audio_mute_state", "true");
        }
        audioButton.style.pointerEvents = "auto";
    }, 200);
}

requestAnimationFrame(() => {
    initAudioIcon();
});

function toggleInvertColor() {
    const icon = document.getElementById("invert-colors-icon");
    const score = document.getElementById("score");
    const audioControlIcon = document.getElementById("audio-control-icon");
    const githubIcon = document.querySelector(".github-icon");
    const body = document.body;

    const bodyComputedStyle = getComputedStyle(body);

    if (bodyComputedStyle.backgroundColor === "rgb(255, 255, 255)") {
        body.style.backgroundColor = "black";
        body.style.color = "white";
        score.style.filter = "invert(0.1)";
        audioControlIcon.style.filter = "invert(0.9)";
        icon.src = "images/components/light_mode.svg";
        icon.style.filter = "invert(0.9)";
        githubIcon.style.filter = "none";
    }
    else {
        body.style.backgroundColor = "white";
        body.style.color = "black";
        score.style.filter = "none";
        audioControlIcon.style.filter = "none";
        icon.src = "images/components/dark_mode.svg";
        icon.style.filter = "none";
        githubIcon.style.filter = "invert(0.9)";
    }
}

let alreadyFullscreen = false;
function toggleFullscreen() {
    if (!alreadyFullscreen) {
        alreadyFullscreen = true;
        gameCanvas.requestFullscreen();
    } else {
        alreadyFullscreen = false;
        document.exitFullscreen();
    }
}

function handleFullscreenChange() {
    const path = "images/components/";
    const fullscreenIcon = document.getElementById("fullscreen-icon");

    if (document.fullscreenElement === gameCanvas) {
        // Game area is in fullscreen
        fullscreenIcon.src = path + "fullscreen_exit.svg";
        gameCanvas.style.borderStyle = "none"; // Remove border
    } else {
        // Game area has exited fullscreen
        fullscreenIcon.src = path + "fullscreen_enter.svg";
        gameCanvas.style.borderStyle = "solid";
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);

// Set to fullscreen by default on smaller screens. Currently not working.
function toggleFullscreenBasedOnWindowSize() {
    if (gameCanvasWidth <= 700 && !alreadyFullscreen) {
        toggleFullscreen();
    }
    else if (gameCanvasWidth > 700 && alreadyFullscreen) {
        toggleFullscreen();
    }
}

// let resizeTimeout;
// window.addEventListener('resize', () => {
//     clearTimeout(resizeTimeout);
//     resizeTimeout = setTimeout(() => {
//         toggleFullscreenBasedOnWindowSize();
//     }, 250);
// });

//toggleFullscreenBasedOnWindowSize();
