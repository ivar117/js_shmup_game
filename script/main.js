var current_score = 0;
var asteroid_last_placement;
let is_gameloop_running = false;

const key_states = {x_movement: [], forward: []}; // Currently pressed down keys
const key_states_values = {x_movement: ["a", "ArrowLeft", "d", "ArrowRight"], forward: ["w", "ArrowUp", " "]}; // Currently pressed down keys
const key_cooldowns = {};
const click_states = {};
let velocity_state = 0;
const XMOVEMENT_COOLDOWN_TIME = 100;
const SHOOT_COOLDOWN_TIME = 200;

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
    var enemy = Bodies.rectangle(Math.random() * game_area_width, 50, 0.1*game_area_width, 30, {
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

            const player_position = parseFloat(player_computed_style.left);
            const x_pos = player_position + (player_width / 2) ;
            //const x_pos = player_position + (player_width / 2) - (projectile_width / 2);
            //const y_pos = player_height; // Start on top of the player
            const y_pos = game_area_height - player_height;
        
            const projectile_body = Bodies.rectangle(x_pos, y_pos, 0.2, 0.5, {
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
            } else {
                enemyBody.render.fillStyle = "red";
            // render: {
            //     fillStyle: "blue"
            // }
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
    if ((event.type === "click" && !fullscreen_state.contains(event.target)) ||
        (event.key === "w" || event.key === " " || event.key === "ArrowUp")) {
        startEnemySpawn();

	    document.body.removeEventListener("keydown", initial_key_eventhandler);
	    game_area.removeEventListener("click", initial_key_eventhandler);
        forward_event_handler();
        requestAnimationFrame(() => {
            document.body.addEventListener("keydown", key_down_handler);
            document.body.addEventListener("keyup", key_up_handler);
            game_area.addEventListener("mousedown", click_down_handler);
            game_area.addEventListener("mouseup", click_up_handler);
        });
    }
}

document.body.addEventListener("keydown", initial_key_eventhandler);
game_area.addEventListener("click", initial_key_eventhandler);

const key_down_handler = function(event) {
    Object.keys(key_states_values).forEach((key) => {
        if (key_states_values[key].includes(event.key)) {
            key_states[key][event.key] = true;
        }
    });

    /* Start the game loop if not already running */
    if (!is_gameloop_running) {
        is_gameloop_running = true;
        game_loop();
    }
}

let deceleration_interval;
const deceleration = (direction, input) => {
    velocity_state += input;
    if ((direction === "left" && velocity_state <= 0) ||
    (direction === "right" && velocity_state >= 0)) {
        clearInterval(deceleration_interval);
        velocity_state = 0;
    }
    else {
        move_player_horizontally(velocity_state);
    }
}

const key_up_handler = function(event) {
    /* remove key states and cooldowns */
    delete key_cooldowns[event.key];
    const deceleration_time = 50;

    if (key_states_values["x_movement"].includes(event.key)) {
        if (velocity_state > 20) { // Initial velocity direction is to the right
            deceleration_interval = setInterval(() => {
                deceleration("left", -(game_area_width * 0.03053435114503816793));
            }, deceleration_time); // Reduce the velocity every 0.2s
        }
        else if (velocity_state < -20 ) { // Initial velocity direction is to the left
            deceleration_interval = setInterval(() => {
                deceleration("right", game_area_width * 0.03053435114503816793);
            }, deceleration_time); // Reduce the velocity every 0.2s
        }
        else {
            velocity_state = 0;
        }
    }

    // Go through the keys in key_states to find and delete the current event key
    Object.keys(key_states).forEach((key) => {
        const entry = key_states[key];
        if (entry[event.key]) {
            delete entry[event.key];
        }
    });
}

const click_down_handler = function(event) {
    const fullscreen_state = document.getElementById("fullscreen-control");
    if (!fullscreen_state.contains(event.target)) {
        click_states[event.button] = true;

        if (!is_gameloop_running) {
            is_gameloop_running = true;
            game_loop();
        }
    }
}

const click_up_handler = function(event) {
    delete click_states[event.button];
}

function increase_velocity(increment) {
    const game_area_width = game_area.clientWidth; // Game area width
    const max_velocity = game_area_width * 0.12213740458015267175
    const min_velocity = -(game_area_width * 0.12213740458015267175)

    if (velocity_state >= min_velocity && velocity_state <= max_velocity) {
        velocity_state += increment;
    }
}

function x_movement(direction, current_time) {
    //if ((key_states.x_movement["a"] || key_states.x_movement["ArrowLeft"])
        //&& (!key_cooldowns["left"] || current_time > key_cooldowns["left"])) {
    const game_area_width = game_area.clientWidth; // Game area width
    if (direction === "right") {
        increase_velocity(game_area_width * 0.03053435114503816793);
    }
    else if (direction === "left") {
        increase_velocity(-(game_area_width * 0.03053435114503816793));
    }
    move_player_horizontally(velocity_state);
    key_cooldowns[direction] = current_time + XMOVEMENT_COOLDOWN_TIME; // Set cooldown end time
    //}
}

function game_loop() {
    const current_time = Date.now();

    /* process key states */
    if ((key_states.x_movement["a"] || key_states.x_movement["ArrowLeft"]) &&
        (!key_cooldowns["left"] || current_time > key_cooldowns["left"])) {
        x_movement("left", current_time);
    }

    if ((key_states.x_movement["d"] || key_states.x_movement["ArrowRight"]) &&
        (!key_cooldowns["right"] || current_time > key_cooldowns["right"])) {
        x_movement("right", current_time)
    }

    if ((key_states.forward["w"] || key_states.forward[" "] || key_states.forward["ArrowUp"]) &&
        (!key_cooldowns["forward"] || current_time > key_cooldowns["forward"])) {
        forward_event_handler();
        key_cooldowns["forward"] = current_time + SHOOT_COOLDOWN_TIME;
    }

    if (click_states["0"] && (!key_cooldowns["forward"] || current_time > key_cooldowns["forward"])) {
        forward_event_handler();
        key_cooldowns["forward"] = current_time + SHOOT_COOLDOWN_TIME;
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
        game_area.style.animation = "moveBackground 3.0s linear infinite";
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

function move_player_horizontally(distance) {
    const game_area = document.getElementById("game-area")
    const game_area_width = game_area.clientWidth; // Game area width
    const player = document.getElementById("player");
    const player_position = getComputedStyle(player).left;
    let player_position_int = parseInt(player_position);

    max_position = game_area_width - 80;
    min_position = 20;

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
    score_number = score.querySelector("#score-number");
    score_number.innerText = current_score;
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

let already_fullscreen = false;
function toggle_fullscreen() {
    if (!already_fullscreen) {
        already_fullscreen = true;
        game_area.requestFullscreen();
        // game_area.requestFullscreen().then(() => {
        //     already_fullscreen = true;
        // });
    } else {
        already_fullscreen = false;
        document.exitFullscreen();
        // document.exitFullscreen().then(() => {
        //     already_fullscreen = false;
        // });
    }
}

function handleFullscreenChange() {
    const path = "images/components/";
    const game_area = document.getElementById("game-area");
    const fullscreen_icon = document.getElementById("fullscreen-icon");

    if (document.fullscreenElement === game_area) {
        // Game area is in fullscreen
        fullscreen_icon.src = path + "fullscreen_exit.svg";
        game_area.style.borderStyle = "none"; // Remove border
    } else {
        // Game area has exited fullscreen
        fullscreen_icon.src = path + "fullscreen_enter.svg";
        game_area.style.borderStyle = "solid";
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);

// Set to fullscreen by default on smaller screens. Currently not working.
function toggleFullscreenBasedOnWindowSize() {
    if (game_area_width <= 700 && !already_fullscreen) {
        // already_fullscreen = true;
        toggle_fullscreen();
    }
    else if (game_area_width > 700 && already_fullscreen) {
        // already_fullscreen = false;
        toggle_fullscreen();
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
