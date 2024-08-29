var current_score = 0;
var position = 5;
var max_position = 10;
var min_position = 1;
var speed; //Maybe?

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
    /*if (key === "h" || key === "ArrowLeft") {
        position--;
    }*/
}

function forward_event_handler() {
    //refresh_gui();
    const score_element = document.getElementById("score");
    game_area = document.getElementById("game-area");
    if (score_element.style.display === "none") {
        score_element.style.display = "block";
        game_area.style.animation = "moveBackground 0.5s linear infinite";
    }
    else {
        const projectile = document.getElementById("projectile");
        console.log(game_area.style.height);
        const computedStyle = window.getComputedStyle(game_area);
        console.log(computedStyle.height); // Accessing the computed height
        projectile.style.visibility = "visible";
        projectile.style.animation = "shootProjectile 0.5s forwards";

        setTimeout(() => {
            projectile.style.visibility = "hidden";
            projectile.style.animation = ""; // Reset animation
        }, 500); // Match this duration with your animation duration

        current_score++;
        update_score();
    }
}

function update_score() {
    score = document.querySelector(".score");
    score.innerHTML = `<div class="score-text">Score: </div> <span id="score-number">${current_score}</span>`;
}

function update_position() {
    player = document.getElementById("player");
    //player.style.
}

function toggle_audio() {
    const path = "/images/components/"
    const audio_button = document.getElementById("audio-control");
    const audio_control_icon = document.getElementById("audio-control-icon");
    const source = audio_control_icon.src;

    audio_button.style.pointerEvents = 'none';

    audio_control_icon.style.transition = "scale .2s"
    audio_control_icon.style.scale = "1.15";
    setTimeout(() => {
        //audio_control_icon.style.transform = "scale(1.0)"
        audio_control_icon.style.scale = "1.0"
    }, 200);

    setTimeout(() => {
        if (source.endsWith("speaker_active.svg")) {
            audio_control_icon.style.marginBottom = "25px";
            audio_control_icon.src = path + "speaker_muted.svg"; // Set to muted icon
        } else {
            audio_control_icon.style.marginBottom = "0";
            audio_control_icon.src = path + "speaker_active.svg"; // Set to active icon
        }
        audio_button.style.pointerEvents = 'auto';
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
        icon.src = "/images/components/light_mode.svg"
        icon.style.filter = "invert(90%)";
    }
    else {
        body.style.backgroundColor = "white";
        body.style.color = "black";
        score.style.filter = "none";
        audio_control_icon.style.filter = "none";
        icon.src = "/images/components/dark_mode.svg"
        icon.style.filter = "none";
    }
}