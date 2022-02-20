const config = require("../config.json");

exports.generateMultiplier = function() {
    i = Math.random();
    i = 0.9/(1-i);
    i = Math.max(i,1.0);
    i = Math.floor(i*100)/100; // multiplier
    return i == 1 ? this.generateMultiplier() : i;
}