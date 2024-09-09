
var current_score = 0;
var asteroid_last_placement;
let is_gameloop_running = false;

const key_states = {}; // Currently pressed down keys
const key_cooldowns = {};
const COOLDOWN_TIME = 60;

var Engine = Matter.Engine; // Physics engine
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var game_area = document.getElementById('game-area')
const game_area_height = game_area.clientHeight;
const game_area_width = game_area.clientWidth;

const engine = Engine.create();
const render = Render.create({
    element: game_area,
    engine: engine,
    options: {
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
//var playerBody = Bodies.rectangle(400, 550, 50, 30, {
    //isStatic: true,
    //render: {
        //fillStyle: '#FF0000' // Change this to your desired color in hex format
    //}
//});
//Composite.add(engine.world, playerBody);

// Function to create enemies
function createEnemy() {
    var enemy = Bodies.rectangle(Math.random() * 800, 0, 80, 30, { 
        isStatic: false,
        label: 'enemy'
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
    if (!document.getElementById("projectile")) {
        //const projectile = document.createElement("img");
        //projectile.src = "images/components/projectile.svg";
        //projectile.style.width = "1.5vmin";
        //projectile.id = "projectile";
        //projectile.alt = "Projectile";

        const player = document.getElementById("player");
        const player_computed_style = window.getComputedStyle(player);
        const player_height = parseInt(player_computed_style.height);
        const player_width = parseFloat(player_computed_style.width);
        //const projectile_width = parseFloat(window.getComputedStyle(projectile).width);
        const player_position = parseFloat(player_computed_style.left);
        const x_pos = player_position + (player_width / 2);
        //const y_pos = player_height; // Start on top of the player
        const y_pos = game_area_height - player_height;
        
        // loadSvg("images/components/projectile.svg").then(
        //     var projectile = Bodies.fromVertices(x_pos, y_pos, Matter.Svg.pathToVertices("images/components/projectile.svg"), {
        //         isStatic: false,
        //         label: 'projectile'
        //     });
        // );

        var loadSvg = function(url) {
            return fetch(url)
                .then(function(response) { return response.text(); })
                .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg'); });
        };

        loadSvg("images/components/projectile.svg")
            .then(svgData => {
                console.log(svgData); // Debug the loaded SVG data
                const path = "images/components/projectile.svg";
                const vertices = Matter.Svg.pathToVertices(svgData); // 30 is the scaling factor, adjust as needed

                // const vertexSets = select(svgData, 'path')
                //     .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.4, 0.4); });

                // const projectile = Bodies.fromVertices(x_pos, y_pos, vertexSets, {
                //     isStatic: false,
                //     label: 'projectile'
                // });

                // Composite.add(engine.world, projectile);

                // Matter.Body.setVelocity(projectile, { x: 0, y: 1 }); // Move projectile upward

                // // Remove projectile after a timeout
                // setTimeout(() => {
                //     Composite.remove(engine.world, projectile);
                // }, 2000)
            })
            .catch(error => {
                console.error("Error loading SVG:", error);
            });

        // loadSvg("images/components/projectile.svg")
        //     .then(svgData => {
        //         // Assuming svgData is an SVG string, parse it
        //         const parser = new DOMParser();
        //         const svgDocument = parser.parseFromString(svgData, "image/svg+xml");
        //         const pathElement = svgDocument.querySelector("path");

        //         if (pathElement) {
        //             const path = pathElement.getAttribute("d"); // Get the "d" attribute from the <path>
        //             const vertices = Matter.Svg.pathToVertices(path, 30);
        //         } else {
        //             console.error("No <path> found in SVG.");
        //         }
        //     })
        //     .catch(error => {
        //         console.error("Error loading SVG:", error);
        //     });

                /* var projectile = Bodies.rectangle(x_pos, y_pos, 5, 25, { 
                    isStatic: false,
                    label: 'projectile'
                }); */
            }
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
            Composite.remove(engine.world, bodyA);
            Composite.remove(engine.world, bodyB);
            current_score++; // Increment score
            update_score(); // Update score display
        }
    });
});

// Example function to start enemy creation at intervals
function startEnemySpawn() {
    setInterval(createEnemy, 2000); // Create an enemy every 2 seconds
}

// Call the functions to start the game
//document.body.addEventListener("keydown", function(event) {
    //if (event.key === ' ') { // Spacebar to shoot
        //shootProjectile();
    //}
//});


// Call function to start enemies

// Start the game loop
//requestAnimationFrame(game_loop);

/* Function to handle the initial key event */
const initial_key_eventhandler = function(event) {
    //const excluded_keys = ["Alt", "Control", "Meta", "Escape"];

    //if (excluded_keys.includes(event.key)) {
        //return;
    //}
    if (event.key === "w" || event.key === " " || event.key === "ArrowUp") {
        startEnemySpawn();

	    document.body.removeEventListener("keydown", initial_key_eventhandler);
        forward_event_handler();
        requestAnimationFrame(() => {
            document.body.addEventListener("keydown", key_down_handler);
            document.body.addEventListener("keyup", key_up_handler);
        });
    }
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

    //if ((key_states["w"] || key_states[" "] || key_states["ArrowUp"])
    if ((key_states["w"] || key_states["ArrowUp"])
        && (!key_cooldowns["forward"] || currentTime > key_cooldowns["forward"])) {
        forward_event_handler();
        key_cooldowns["forward"] = currentTime + COOLDOWN_TIME;
    }

    if (key_states[" "]) { // Spacebar to shoot
        shootProjectile();
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
        if (!document.getElementById("projectile")) { // If no projectile is present in the DOM
            const projectile = document.createElement("img");
            projectile.src = "images/components/projectile.svg";
            projectile.style.width = "1.5vmin";
            projectile.id = "projectile";
            projectile.alt = "Projectile";
            game_area.appendChild(projectile);

            const projectile_animation_time = 500;
            const game_area_height = game_area.clientHeight + 100; // Game area height, add extra height for the projectile to move out of bounds

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
                   duration: projectile_animation_time,
                   fill: "forwards"
            };

            projectile.style.visibility = "visible";
            projectile.animate(keyframes, options);

            setTimeout(() => {
                projectile.style.visibility = "hidden";
                projectile.style.animation = "";
                projectile.remove();
                current_score++;
                update_score();
            }, projectile_animation_time)
        }
    }
}

function move_player_horizontally(direction) {
    const game_area = document.getElementById("game-area")
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
