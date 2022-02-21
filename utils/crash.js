const config = require("../config.json");

exports.generateMultiplier = function() {
    i = parseFloat(Math.random().toFixed(3));
    while (i == 1) {
        i = parseFloat(Math.random().toFixed(3));
    };
    i = 0.9/(1-i);
    i = Math.max(i,1.0);
    i = Math.floor(i*100)/100; // multiplier
    return i == 1 ? this.generateMultiplier() : i;
}