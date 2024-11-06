/*
**** Functions to draw the background galaxy in the canvas ****
*/

const starsMaxAmount = 100; // How many stars to be on the canvas at once
let starsCurrentAmount; // Amount of stars currently on the canvas

const starsObject = { // Star filenames without extension and chances of a star appearing
    star_white: ["starWhite", 0.85],
    star_yellow: ["starYellow", 0.05],
    star_blue: ["starBlue", 0.05],
    star_pink: ["starPink", 0.025],
    star_red: ["starRed", 0.025]
};

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

function getRandomStar(stars_object) {
    const randomNum = Math.random(); // Number between 0-1
    let cumulativeProbability = 0;

    for (const [key, value] of Object.entries(stars_object)) {
        cumulativeProbability += value[1]; // Add the probability of the current star
        if (randomNum <= cumulativeProbability) {
            return value[0]; // Return the star type if randomNum falls within the cumulative probability
        }
    }
    return null; // In case an object with improper structure was given
}

function starPositionIsValid(starPosition, existingPositions, starsMinDistance) {
    for (const pos of existingPositions) {
        const distance = Math.sqrt(Math.pow(starPosition.x - pos.x, 2) + Math.pow(starPosition.y - pos.y, 2));
        if (distance < starsMinDistance) {
            return false; // Too close to another star
        }
    }
    return true; // Valid position
}

function drawStarOnCanvas(starFilename, starPosition) {
    const star = document.createElement("img");
    star.src = "images/components/stars/" + starFilename + ".png";
    star.style.width = getRandomNumberBetween(0.4, 1.0) * 15 + "px";
    star.style.left = starPosition.x + "px";
    star.style.top = starPosition.y + "px";
    star.className = "star";
    star.alt = "Star";

    gameCanvas.appendChild(star);

    return star;
}

function populateStars() {
    const existingPositions = [];
    const starsMinDistance = 20;

    for (starsCurrentAmount = 0; starsCurrentAmount < starsMaxAmount; starsCurrentAmount++) {
        let starPosition;
        let validPositionFound = false;

        while (!validPositionFound) {
            starPosition = {
                x: getRandomNumberBetween(0, gameCanvasWidth),
                y: getRandomNumberBetween(0, gameCanvasHeight)
            };

            validPositionFound = starPositionIsValid(starPosition, existingPositions, starsMinDistance);

            // Store the position
            existingPositions.push(starPosition);
        }

        const starName = getRandomStar(starsObject);
        drawStarOnCanvas(starName, starPosition);
    }
}

function animateStarFromTop(animationTime) {
    const existingPositions = [];
    const starsMinDistance = 20;
    let starPosition;
    let validPositionFound = false;

    while (!validPositionFound) {
        starPosition = {
            x: getRandomNumberBetween(0, gameCanvasWidth),
            y: 0,
        };

        validPositionFound = starPositionIsValid(starPosition, existingPositions, starsMinDistance);

        // Store the position
        existingPositions.push(starPosition);
    }

    const starName = getRandomStar(starsObject);
    const star = drawStarOnCanvas(starName, starPosition);
    starsCurrentAmount++;

    const timeBeforeRemove = animationTime;

    const keyframes = [
        { transform: `translateY(0)` },
        { transform: `translateY(${gameCanvasHeight}px)` }
    ];

    animateElementOnGameCanvas(star, animationTime, keyframes, timeBeforeRemove).then(() => {
        starsCurrentAmount--;
        if (starsCurrentAmount < starsMaxAmount) {
            requestAnimationFrame(() => {
                animateStarFromTop(animationTime); //triggers animation loop
            })
        }
    });
}

populateStars()

// Only runs at startup
function initStarsAnimation(baseAnimationTime) {
    const stars = gameCanvas.querySelectorAll(".star")

    stars.forEach((star) => {
        const starYPos = parseInt(getComputedStyle(star).top);
        const distanceToMove = gameCanvasHeight - starYPos;

        const timeProportion = distanceToMove / gameCanvasHeight;

        const timeBeforeRemove = baseAnimationTime * timeProportion;

        const animationTime = baseAnimationTime;

        const keyframes = [
            { transform: `translateY(0)` },
            { transform: `translateY(${gameCanvasHeight}px)` }
        ];

        animateElementOnGameCanvas(star, animationTime, keyframes, timeBeforeRemove).then(() => {
            starsCurrentAmount--;
            animateStarFromTop(baseAnimationTime);
        })
    })
}
