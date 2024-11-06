/*
**** Functions to draw the background galaxy in the canvas ****
*/

function animateElementOnGameCanvas(htmlElement, animationTime, keyframes, timeBeforeRemove) {
    gameCanvas.appendChild(htmlElement);

    // If no keyframes arg, generate a basic vertical animation keyframes
    if (keyframes === undefined) {
        const htmlElementHeight = htmlElement.clientHeight;
        const distanceToMove = gameCanvasHeight + htmlElementHeight;

        keyframes = [
            { transform: `translateY(-${distanceToMove}px)` },
            { transform: `translateY(${gameCanvasHeight}px)` }
        ];
    }

    const options = {
        duration: animationTime, // Really determines the speed
        fill: "forwards"
    };

    htmlElement.animate(keyframes, options);

    if (timeBeforeRemove === undefined) {
        timeBeforeRemove = animationTime;
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            htmlElement.remove();
            resolve();
        }, timeBeforeRemove);
    });
}

function createAsteroid(animationTime) {
    const asteroid = document.createElement("img");

    const asteroidObject = {
        src: "images/components/asteroid.png",
        class: "asteroid",
        alt: "Asteroid"
    };

    asteroid.src = asteroidObject.src;
    asteroid.className = asteroidObject.class;
    asteroid.alt = asteroidObject.alt;

    const placementX = getRandomNumberBetween(40, gameCanvasWidth - 80);
    asteroid.style.left = placementX + "px";

    const asteroidHeight = asteroid.clientHeight;
    const distanceToMove = gameCanvasHeight + asteroidHeight; // Move beyond the game area height plus the asteroid's height

    const degreesToRotate = getRandomNumberBetween(0.8, 1.2) * 360;
    const keyframes = [
        { transform: `translateY(-${distanceToMove}px) rotate(0deg)` }, // Asteroid starts upward beyond the view
        { transform: `translateY(${gameCanvasHeight}px) rotate(${degreesToRotate}deg)` } // Move it down past the bottom
    ];

    animateElementOnGameCanvas(asteroid, animationTime, keyframes)
}

function randomPlanetsAnimate(quarter, animationTime) {
    // Why use a real backend when you can just do this ;)
    const planetNames = ["planetRed", "planetOcean", "planetRing"];
    const planetNameIndex = getWholeRandomNumberBetween(0, planetNames.length-1);
    const planetName = planetNames[planetNameIndex];

    const planetObject = {
        src: "images/components/planets/" + planetName + ".png",
        class: "planet",
        width: 70,
        alt: "Planet"
    };

    const planet = document.createElement("img");
    planet.src = planetObject.src;
    planet.className = planetObject.class;
    planet.width = planetObject.width;
    planet.alt = planetObject.alt;

    gameCanvasFirstQuarter = (gameCanvasWidth - 60) / 4;

    const placementX1 = Math.floor(Math.random() * gameCanvasFirstQuarter);
    const placementX2 = Math.floor((gameCanvasWidth - 60) - Math.random() * gameCanvasFirstQuarter);
    let placementX = (quarter === 1) ? placementX1 : placementX2;
    planet.style.left = placementX + "px";

    animateElementOnGameCanvas(planet, animationTime);
}
