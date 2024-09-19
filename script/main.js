var current_score = 0;
var asteroid_last_placement;
let is_gameloop_running = false;

const key_states = {}; // Currently pressed down keys
const key_cooldowns = {};
const distance_state = {};
distance_state["left"] = 10;
distance_state["right"] = 10;
const COOLDOWN_TIME = 100;

var Engine = Matter.Engine; // Physics engine
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var game_area = document.getElementById('game-area')
let game_area_height = game_area.clientHeight;
let game_area_width = game_area.clientWidth;

const engine = Engine.create();
const render = Render.create({
    element: game_area,
    engine: engine,
    options: { // TODO: width and height are not dynamic
        width: game_area_width,
        height: game_area_height,
        showAngleIndicator: false,
        showCollisions: true,
        showSeparations: true,
        background: 'none',
        wireframes: false
    }
});

var runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);

// Create player body (assuming you already have a player in the DOM)
// var playerBody = Bodies.rectangle(400, 550, 50, 30, {
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
    // Get the current dimensions of the game area
    game_area_width = game_area.clientWidth;
    game_area_height = game_area.clientHeight;

    // Update the render's dimensions
    Render.setSize(render, game_area_width, game_area_height);
}

// Resize event listener
window.addEventListener('resize', () => {
    updateRenderDimensions();
});

// Function to create enemies
function createEnemy() {
    var enemy = Bodies.rectangle(Math.random() * 800, 50, 80, 30, { 
        isStatic: true,
        label: 'enemy',
        health: 2,
        render: {
            fillStyle: "red"
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
function shoot_projectile() {
    // if (!document.getElementById("projectile")) {
        const game_area = document.getElementById("game-area");
        const projectile = document.createElement("img");
        projectile.src = "images/components/projectile.png";
        projectile.onload = function() {
            projectile.style.width = "1.5vmin";
            projectile.id = "projectile";
            projectile.alt = "Projectile";
            projectile.style.visibility = "hidden";
            game_area.appendChild(projectile);

            const player = document.getElementById("player");
            const player_computed_style = window.getComputedStyle(player);
            const player_height = parseInt(player_computed_style.height);
            const player_width = parseFloat(player_computed_style.width);
            const projectile_width = parseFloat(window.getComputedStyle(projectile).width);
            const projectile_height = parseFloat(window.getComputedStyle(projectile).height);
            console.log(projectile_width, projectile_height);

            const player_position = parseFloat(player_computed_style.left);
            const x_pos = player_position + (player_width / 2) ;
            //const x_pos = player_position + (player_width / 2) - (projectile_width / 2);
            //const y_pos = player_height; // Start on top of the player
            const y_pos = game_area_height - player_height;
        
            const projectile_body = Bodies.rectangle(x_pos, y_pos, projectile_width*0.8, projectile_height*0.8, {
                isStatic: false,
                label: "projectile",
                render: { 
                     sprite: {
                         texture: "images/components/projectile.png",
                     }
                 }
            });

            Composite.add(engine.world, projectile_body);
            Matter.Body.setVelocity(projectile_body, { x: 0, y: -40 }); // Move projectile_body upward

            setTimeout(() => {
                projectile.remove();
                Composite.remove(engine.world, projectile_body);
            }, 2000)
        };
    // }
}

// Collision detection to check if projectile hits an enemy
Matter.Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    pairs.forEach(pair => {
        var bodyA = pair.bodyA;
        var bodyB = pair.bodyB;

        // Check for collision between projectile and enemy
        if ((bodyA.label === 'projectile' && bodyB.label === 'enemy') || 
            (bodyA.label === 'enemy' && bodyB.label === 'projectile')) {
            // Handle the collision, e.g., removing the enemy and projectile
            
            // Determine which body is the enemy
            var enemyBody = bodyA.label === 'enemy' ? bodyA : bodyB;
            var projectileBody = bodyA.label === 'projectile' ? bodyA : bodyB;

            
            enemyBody.health--;
            if (enemyBody.health <= 0) {
                Composite.remove(engine.world, enemyBody);
                current_score++; // Increment score
                update_score(); // Update score display
            }
            // Composite.remove(engine.world, bodyA);
            Composite.remove(engine.world, projectileBody);
        }
    });
});

// Example function to start enemy creation at intervals
function startEnemySpawn() {
    setInterval(createEnemy, 2000); // Create an enemy every 2 seconds
}

/* Function to handle the initial key event */
const initial_key_eventhandler = function(event) {
    //const excluded_keys = ["Alt", "Control", "Meta", "Escape"];

    //if (excluded_keys.includes(event.key)) {
        //return;
    //}
    const fullscreen_state = document.getElementById("fullscreen-control");
    if ((event.type === "click" && !fullscreen_state.contains(event.target))
        || (event.key === "w" || event.key === " " || event.key === "ArrowUp")) {
        startEnemySpawn();

	    document.body.removeEventListener("keydown", initial_key_eventhandler);
	    game_area.removeEventListener("click", initial_key_eventhandler);
        forward_event_handler();
        requestAnimationFrame(() => {
            document.body.addEventListener("keydown", key_down_handler);
            document.body.addEventListener("keyup", key_up_handler);
        });
    }
}

document.body.addEventListener("keydown", initial_key_eventhandler);
game_area.addEventListener("click", initial_key_eventhandler);

const key_down_handler = function(event) {
    key_states[event.key] = true;

    /* Start the game loop if not already running */
    if (!is_gameloop_running) {
        is_gameloop_running = true;
        game_loop();
    }
}

const key_up_handler = function(event) {
    /* remove key states and cooldowns */
    delete key_states[event.key];
    delete key_cooldowns[event.key];
    distance_state["left"] = 10;
    distance_state["right"] = 10;
}

function game_loop() {
    const currentTime = Date.now();
    const max_distance = 80;

    /* process key states */
    if ((key_states["a"] || key_states["ArrowLeft"])
        && (!key_cooldowns["left"] || currentTime > key_cooldowns["left"])) {
        if (document.getElementById("score").style.display != "none") {
            move_player_horizontally("left", distance_state["left"]);

            distance_state["left"] = Math.exp(distance_state["left"] * 0.5);
            if (distance_state["left"] > 80) {
                distance_state["left"] = 80;
            }

            key_cooldowns["left"] = currentTime + COOLDOWN_TIME; // Set cooldown end time
        }
    }

    if ((key_states["d"] || key_states["ArrowRight"])
        && (!key_cooldowns["right"] || currentTime > key_cooldowns["right"])) {
        if (document.getElementById("score").style.display != "none") {
            move_player_horizontally("right", distance_state["right"]);

            distance_state["right"] = Math.exp(distance_state["right"] * 0.5);
            if (distance_state["right"] > 80) {
                distance_state["right"] = 80;
            }

            key_cooldowns["right"] = currentTime + COOLDOWN_TIME;
        }
    }

    if ((key_states["w"] || key_states[" "] || key_states["ArrowUp"])
        && (!key_cooldowns["forward"] || currentTime > key_cooldowns["forward"])) {
        forward_event_handler();
        key_cooldowns["forward"] = currentTime + 300;
    }

    /* request the next frame */
    if (is_gameloop_running) {
        requestAnimationFrame(game_loop);
    }
}

function forward_event_handler() {
    const score_element = document.getElementById("score");
    game_area = document.getElementById("game-area");
    if (score_element.style.display === "none") { // Only run at initialization
        /* Animate the background */
        score_element.style.display = "block";
        game_area.style.animation = "moveBackground 2.0s linear infinite";
        /* Turn on the music! */
        const audio_element = document.getElementById("audio-element");
        audio_element.play();
        /* Remove the start instruction */
        const start_text = document.getElementById("start-text");
        start_text.remove();
        /* Initialize random asteroid placement in the game area */
        setTimeout(() => {
            create_asteroid();
            setInterval(create_asteroid, 3000);
        }, 1000)
    }
    else { /* Shoot projectile */
        shoot_projectile();
    }
}

function move_player_horizontally(direction, distance) {
    const game_area = document.getElementById("game-area")
    const game_area_width = game_area.clientWidth; // Game area width
    const player = document.getElementById("player");
    const player_position = getComputedStyle(player).left;
    let player_position_int = parseInt(player_position);

    max_position = game_area_width - 80;
    min_position = 20;

    if (direction == "left") {
        distance = -distance;
    }

    if (player_position_int > max_position) {
        player_position_int = max_position;
    }
    else if (player_position_int < min_position) {
        player_position_int = min_position;
    }
    else {
        player_position_int += distance;
    }
    player.style.left = player_position_int + "px";
}

function update_score() {
    score = document.querySelector(".score");
    score.innerHTML = `<div class="score-text">Score: </div> <span id="score-number">${current_score}</span>`;
}

function init_audio_icon() {
    const path = "images/components/";
    const audio_control_container = document.getElementById("audio-control");
    const audio_element = document.getElementById("audio-element");
    const audio_control_icon = document.createElement('img');
    audio_control_icon.style.width = "80%";
    audio_control_icon.id = "audio-control-icon"

    const mute_state = localStorage.getItem("audio_mute_state");
    if (mute_state === null) { // If not previously cached
        localStorage.setItem("audio_mute_state", "false")
    }

    setTimeout(() => {
        if (mute_state == "true") {
            audio_control_icon.src = path + "speaker_muted.svg"; // Set to muted icon
            audio_element.muted = true;
        } else {
            audio_control_icon.src = path + "speaker_active.svg"; // Set to active icon
            audio_element.muted = false;
        }
    }, 200);

    audio_control_container.appendChild(audio_control_icon);
}

function toggle_audio() {
    const path = "images/components/";
    const audio_button = document.getElementById("audio-control");
    const audio_control_icon = document.getElementById("audio-control-icon");
    const audio_element = document.getElementById("audio-element");

    audio_control_icon.alt = "Audio";
    audio_button.style.pointerEvents = "none";

    audio_control_icon.style.transition = "scale .2s"
    audio_control_icon.style.scale = "1.15";
    setTimeout(() => {
        audio_control_icon.style.scale = "1.0"
    }, 200);

    setTimeout(() => {
        const mute_state = localStorage.getItem("audio_mute_state");
        if (mute_state === null) { // If not previously cached
            localStorage.setItem("audio_mute_state", "false")
        }

        if (mute_state === "true") {
            audio_control_icon.src = path + "speaker_active.svg"; // Set to active icon
            audio_element.muted = false;
            localStorage.setItem("audio_mute_state", "false");
        } else {
            audio_control_icon.src = path + "speaker_muted.svg"; // Set to muted icon
            audio_element.muted = true;
            localStorage.setItem("audio_mute_state", "true");
        }
        audio_button.style.pointerEvents = "auto";
    }, 200);
}

function toggle_invert_color() {
    const icon = document.getElementById("invert-colors-icon");
    const score = document.getElementById("score");
    const audio_control_icon = document.getElementById("audio-control-icon");
    const body = document.body;

    const body_computedStyle = getComputedStyle(body);

    if (body_computedStyle.backgroundColor === "rgb(255, 255, 255)") {
        body.style.backgroundColor = "black";
        body.style.color = "white";
        score.style.filter = "invert(10%)";
        audio_control_icon.style.filter = "invert(90%)";
        icon.src = "images/components/light_mode.svg"
        icon.style.filter = "invert(90%)";
    }
    else {
        body.style.backgroundColor = "white";
        body.style.color = "black";
        score.style.filter = "none";
        audio_control_icon.style.filter = "none";
        icon.src = "images/components/dark_mode.svg"
        icon.style.filter = "none";
    }
}

function create_asteroid() {
    const game_area = document.getElementById("game-area")
    const asteroid = document.createElement("img");
    asteroid.src = "images/components/asteroid.png";
    asteroid.style.width = "9vmin";
    asteroid.id = "asteroid";
    asteroid.alt = "Asteroid";
    game_area.appendChild(asteroid);
    
    const game_area_height = game_area.clientHeight;
    const game_area_width = game_area.clientWidth;
    const asteroid_height = asteroid.clientHeight;
    const asteroid_animation_time = 4000;

    /* Calculate how far to move the asteroid during the animation */
    const distance_to_move = game_area_height + asteroid_height; // Move beyond the game area height plus the asteroid's height
    
    vertical_placement = Math.floor(Math.random() * ((game_area_width - 60) - 1));
    asteroid.style.left = vertical_placement + "px";

    const keyframes = [
        { transform: `translateY(-${distance_to_move}px) rotate(0deg)` }, // Asteroid starts upward beyond the view
        { transform: `translateY(${game_area_height}px) rotate(360deg)` } // Move it down past the bottom
    ];

    const options = {
        duration: asteroid_animation_time,
        fill: "forwards"
    };

    asteroid.animate(keyframes, options);
    setTimeout(() => {
        asteroid.remove();
    }, asteroid_animation_time);
    asteroid_last_placement = vertical_placement;
}

requestAnimationFrame(() => {
    init_audio_icon();
})

function set_fullscreen() {
    const game_area = document.getElementById("game-area");
    // const fullscreen_button = document.getElementById("fullscreen-control");
    const fullscreen_icon = document.getElementById("fullscreen-icon");

    if (fullscreen_icon.src.endsWith("fullscreen_enter.svg")) {
        requestAnimationFrame(() => {
            game_area.requestFullscreen();
        });
    }
    else {
        document.exitFullscreen();
    }
}

const fullscreen_state = localStorage.getItem("fullscreen_state");
if (fullscreen_state === null) { // If not previously cached
    localStorage.setItem("fullscreen_state", "false");
}
else if (fullscreen_state == "true") { // If fullscreen was previously set to true
    // game_area.requestFullscreen();
    game_area.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err);
    });
}

function handleFullscreenChange() {
    const path = "images/components/";
    const game_area = document.getElementById("game-area");
    const fullscreen_icon = document.getElementById("fullscreen-icon");

    if (document.fullscreenElement === game_area) {
        // Game area is in fullscreen
        fullscreen_icon.src = path + "fullscreen_exit.svg";
        game_area.style.borderStyle = "none"; // Remove border
        localStorage.setItem("fullscreen_state", "true")
        // You can change your variables or styles here
    } else {
        // Game area has exited fullscreen
        fullscreen_icon.src = path + "fullscreen_enter.svg";
        game_area.style.borderStyle = "solid"; // Remove border
        localStorage.setItem("fullscreen_state", "false")
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);

let already_fullscreen = false;
function toggleFullscreenBasedOnWindowSize() {
    if (game_area_width <= 700 && !already_fullscreen) {
        already_fullscreen = true;
        game_area.requestFullscreen();
    }
    else if (game_area_width > 700 && already_fullscreen) {  // Exit fullscreen if it's too large
        already_fullscreen = false;
        document.exitFullscreen();
    }
}

window.addEventListener('resize', () => {
    toggleFullscreenBasedOnWindowSize();
});
