var current_score = 0;
var position = 5;
var max_position = 10;
var min_position = 1;
var speed; //Maybe?
var asteroid_last_placement;
let is_gameloop_running = false;

const key_states = {};
const key_cooldowns = {};
const COOLDOWN_TIME = 60;

/* Function to handle the initial key event */
const initial_key_eventhandler = function(event) {
    const excludedKeys = ["Alt", "Control", "Meta", "Escape"];

    if (excludedKeys.includes(event.key)) {
        return;
    }

	document.body.removeEventListener("keydown", initial_key_eventhandler);
    forward_event_handler();
    requestAnimationFrame(() => {
        document.body.addEventListener("keydown", key_down_handler);
        document.body.addEventListener("keyup", key_up_handler);
    });
}

document.body.addEventListener("keydown", initial_key_eventhandler);

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
}

function game_loop() {
    const currentTime = Date.now();

    /* process key states */
    if ((key_states["a"] || key_states["ArrowLeft"])
        && (!key_cooldowns["left"] || currentTime > key_cooldowns["left"])) {
        if (document.getElementById("score").style.display != "none") {
            move_player_horizontally("left");
            key_cooldowns["left"] = currentTime + COOLDOWN_TIME; // Set cooldown end time
        }
    }

    if ((key_states["d"] || key_states["ArrowRight"])
        && (!key_cooldowns["right"] || currentTime > key_cooldowns["right"])) {
        if (document.getElementById("score").style.display != "none") {
            move_player_horizontally("right");
            key_cooldowns["right"] = currentTime + COOLDOWN_TIME;
        }
    }

    if ((key_states["w"] || key_states[" "] || key_states["ArrowUp"])
        && (!key_cooldowns["forward"] || currentTime > key_cooldowns["forward"])) {
        forward_event_handler();
        key_cooldowns["forward"] = currentTime + COOLDOWN_TIME;
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
        game_area.style.animation = "moveBackground 0.5s linear infinite";
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
        if (!document.getElementById("projectile")) { // If no projectile is present in the DOM
            const projectile = document.createElement("img");
            projectile.src = "images/components/projectile.svg";
            projectile.style.width = "1.5vmin";
            projectile.id = "projectile";
            projectile.alt = "Projectile";
            game_area.appendChild(projectile);

            const projectile_animation_time = 500;
            const game_area_height = game_area.clientHeight + 100; // Game area height, add a bit more height so the projectile moves out of bounds
            const game_area_width = game_area.clientWidth; // Game area width

            const player = document.getElementById("player");
            const player_computed_style = window.getComputedStyle(player);
            const player_height = parseInt(player_computed_style.height);
            const player_width = parseFloat(player_computed_style.width);
            const projectile_width = parseFloat(window.getComputedStyle(projectile).width);
            const player_position = parseFloat(player_computed_style.left);
            projectile.style.left = player_position + (player_width / 2) - (projectile_width / 2) + "px";

            projectile.style.marginBottom = `${player_height+60}px`; // Start on top of the player

            const keyframes = [
                    { transform: "translateY(100%)" },  // Start below the visible area
                    { transform: "translateY(-" + game_area_height + "px)", visibility: "hidden" } // Move across the game area
            ];


            const options = {
                   duration: projectile_animation_time, // Animation duration in milliseconds
                   fill: "forwards" // Keep the last keyframe after finishing
            };

            projectile.style.visibility = "visible";
            projectile.animate(keyframes, options);

            setTimeout(() => {
                projectile.style.visibility = "hidden";
                projectile.style.animation = ""; // Reset animation
                projectile.remove();
                current_score++;
                update_score();
            }, projectile_animation_time);
        }
    }
}

function move_player_horizontally(direction) {
    const game_area = document.getElementById("game-area")
    const game_area_height = game_area.clientHeight; // Game area height, add a bit more height so the projectile moves out of bounds
    const game_area_width = game_area.clientWidth; // Game area width
    const player = document.getElementById("player");
    const player_position = getComputedStyle(player).left;
    let player_position_int = parseInt(player_position);

    max_position = game_area_width - 80;
    min_position = 20;
    let increment = 50;

    if (direction == "left") {
        increment = -increment;
    }

    if (player_position_int > max_position) {
        player_position_int = max_position;
    }
    else if (player_position_int < min_position) {
        player_position_int = min_position;
    }
    else {
        player_position_int += increment;
    }
    player.style.left = player_position_int + "px";
}

function update_score() {
    score = document.querySelector(".score");
    score.innerHTML = `<div class="score-text">Score: </div> <span id="score-number">${current_score}</span>`;
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
        const mute_state = localStorage.getItem('audio_mute_state');
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

function init_audio_icon() {
    const path = "images/components/";
    const audio_control_container = document.getElementById("audio-control");
    const audio_element = document.getElementById("audio-element");
    const audio_control_icon = document.createElement('img');
    audio_control_icon.style.width = "80%";
    audio_control_icon.id = "audio-control-icon"

    const mute_state = localStorage.getItem('audio_mute_state');
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
    
    const game_area_height = game_area.clientHeight; // Game area height, add a bit more height so the projectile moves out of bounds
    const game_area_width = game_area.clientWidth; // Game area width
    const asteroid_height = asteroid.clientHeight;
    const asteroid_animation_time = 4000;

    /* Calculate how far to move the asteroid during the animation */
    const distance_to_move = game_area_height + asteroid_height; // Move beyond the game area height plus the asteroid's height
    
    vertical_placement = Math.floor(Math.random() * ((game_area_width - 60) - 1));
    asteroid.style.left = vertical_placement + "px";

    const keyframes = [
        { transform: `translateY(-${distance_to_move}px) rotate(0deg)` }, // Move the asteroid upward beyond the view
        { transform: `translateY(${game_area_height}px) rotate(360deg)` } // Move it down past the bottom
    ];

    const options = {
        duration: asteroid_animation_time, // Animation duration in milliseconds
        fill: "forwards" // Keep the last keyframe after finishing
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
