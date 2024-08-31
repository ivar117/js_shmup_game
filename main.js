var current_score = 0;
var position = 5;
var max_position = 10;
var min_position = 1;
var speed; //Maybe?
var asteroid_last_placement;
// No
// YES?!!!!

document.addEventListener("keydown", e => {
    handle_key_event(e, e.key);
});

function handle_key_event(event, key) {
    switch (key) {
        case "ArrowLeft":
        case "a":
            position--;
            update_position();
            break;
        case "d":
        case "ArrowRight":
            position++;
            update_position();
            break;
        case " ":
        case "w":
        case "ArrowUp":
            event.preventDefault();
            forward_event_handler();
    }
}

function forward_event_handler() {
    //refresh_gui();
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
            setInterval(create_asteroid, 4000);
        }, 1000)
    }
    else { /* Shoot projectile */
        if (!document.getElementById("projectile")) { /* If no projectile is present in the DOM */
            const projectile = document.createElement("img");
            projectile.src = "images/components/projectile.svg";
            projectile.width = 12;
            projectile.id = "projectile";
            projectile.alt = "Projectile";
            game_area.appendChild(projectile);

            const projectile_animation_time = 500;
            const game_area_height = game_area.clientHeight + 100; /* Game area height, add a bit more height so the projectile moves out of bounds */
            const game_area_width = game_area.clientWidth; /* Game area width */
            //console.log(game_area_width);

            /* TODO: use player to calculate initial projectile y position */
            const player = document.getElementById("player");
            //const player_DOMRect = player.getBoundingClientRect();
            //const player_top = player_DOMRect.top
            //const projectile_start_x = playerRect.left + (playerRect.width / 2); // Center X of player
            //console.log(player_top);
            const computedStyle = window.getComputedStyle(player);
            const player_height = parseInt(computedStyle.height);
            //console.log(player_height);

            //projectile.style.top = `${player_top}px`;
            //const projectile_y = parseFloat(projectile.style.top);
            projectile.style.marginBottom = `${player_height+60}px`; /* Start on top of the player */
            //projectile.style.left = `${projectile_start_x}px`;
            //projectile.style.marginBottom = "126px";

            const keyframes = [
                    { transform: "translateY(100%)" },  // Start below the visible area
                    { transform: "translateY(-" + game_area_height + "px)", visibility: "hidden" } // Move across the game area
            ];


            const options = {
                   duration: projectile_animation_time, // Animation duration in milliseconds
                   fill: "forwards" // Keep the last keyframe after finishing
            };

            //projectile.style.top = `${player_top + player.offsetHeight}px`; // Placing projectile below the player
            //projectile.style.left = `${player_DOMRect.left}px`; // Align with player's horizontal position

            //projectile.style.top = `${player_top + player.offsetHeight}px`; // Placing projectile below the player
            //projectile.style.left = `${player_DOMRect.left}px`; // Align with player's horizontal position
            projectile.style.visibility = "visible";
            //projectile.style.animation = keyframes + " 0.5s forwards";
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

function update_score() {
    score = document.querySelector(".score");
    score.innerHTML = `<div class="score-text">Score: </div> <span id="score-number">${current_score}</span>`;
}

function update_position() {
    player = document.getElementById("player");
}

function toggle_audio() {
    const path = "images/components/"
    const audio_button = document.getElementById("audio-control");
    const audio_control_icon = document.getElementById("audio-control-icon");
    const icon_source = audio_control_icon.src;
    const audio_element = document.getElementById("audio-element");

    audio_button.style.pointerEvents = "none";
    audio_control_icon.style.transition = "scale .2s"
    audio_control_icon.style.scale = "1.15";
    setTimeout(() => {
        audio_control_icon.style.scale = "1.0"
    }, 200);

    setTimeout(() => {
        if (icon_source.endsWith("speaker_active.svg")) {
            audio_control_icon.style.marginBottom = "25px";
            audio_control_icon.src = path + "speaker_muted.svg"; // Set to muted icon
            audio_element.muted = true;
        } else {
            audio_control_icon.style.marginBottom = "0";
            audio_control_icon.src = path + "speaker_active.svg"; // Set to active icon
            audio_element.muted = false;
        }
        audio_button.style.pointerEvents = "auto";
    }, 200)
}

function toggle_invert_color() {
    const icon = document.getElementById("invert-colors-icon");
    const score = document.getElementById("score");
    const audio_control_icon = document.getElementById("audio-control-icon");
    const body = document.body;

    console.log(body.style.backgroundColor);
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
    asteroid.style.width = "5%";
    asteroid.id = "asteroid";
    asteroid.alt = "Asteroid";
    game_area.appendChild(asteroid);
    
    const game_area_height = game_area.clientHeight; /* Game area height, add a bit more height so the projectile moves out of bounds */
    const game_area_width = game_area.clientWidth; /* Game area width */
    const asteroid_height = asteroid.clientHeight; // Height of the asteroid image
    const asteroid_animation_time = 5000;

    // Calculate how far to move the asteroid during the animation
    const distance_to_move = game_area_height + asteroid_height; // Move beyond the game area height plus the asteroid's height
    
    console.log("Game Area Width: ", game_area_width);
    vertical_placement = Math.floor(Math.random() * ((game_area_width - 60) - 1));
    console.log(vertical_placement);
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
