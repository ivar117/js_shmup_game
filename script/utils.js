function getRandomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function getWholeRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
