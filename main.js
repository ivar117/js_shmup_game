var current_score;
var position = 5;
var max_position = 10;
var min_position = 1;
var speed;

document.addEventListener("keydown", e => {
    handle_key_event(e.key);
});

function handle_key_event(key) {
    switch (key) {
        case "h":
        case "LeftArrow":
        case "a":
            position--;
            update_position();
            break;
        case "l":
        case "d":
        case "RightArrow":
            position++;
            update_position();
            break;
        case "Space":
        case "w":
        case "UpArrow":
        case "k":
            shoot_projectile();
    }
    /*if (key === "h" || key === "ArrowLeft") {
        position--;
    }*/
}

function shoot_projectile() {
    refresh_gui();
}

function update_score() {
    score_element = document.querySelector(".score");
    score_element.innerText = current_score;
}

function update_position() {
    character = document.querySelector(".game-area .character");
    character.style.
}

function refresh_gui() { //Behövs det ens eller uppdaterar det konstant?
    game_area = document.querySelector(".game-area");
}

function init() {
    game_area = document.querySelector(".game-area");
}