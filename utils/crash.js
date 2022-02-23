const Random = require("crypto-random");
const config = require("../config.json");

exports.generateMultiplier = function() {
    i = Random.range(0, 1000) / 1000;
    // i = parseFloat(Math.random().toFixed(3));
    while (i == 1) {
        i = Random.range(0, 1000) / 1000;
    };
    i = 0.9/(1-i);
    i = Math.max(i,1.0);
    i = Math.floor(i*100)/100; // multiplier
    return i == 1 ? this.generateMultiplier() : i;
}