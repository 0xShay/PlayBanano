const Random = require("crypto-random");
const config = require("../config.json");

exports.betTypes = {
    "odd": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
    "even": [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
    "low": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    "high": [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    "red": [1, 3, 5, 7, 9, 12, 14, 16, 18, 21, 23, 25, 27, 28, 30, 32, 34, 36],
    "black": [2, 4, 6, 8, 10, 11, 13, 15, 17, 19, 20, 22, 24, 26, 29, 31, 33, 35]
}

exports.betMultipliers = {
    "odd": 1,
    "even": 1,
    "low": 1,
    "high": 1,
    "red": 1,
    "black": 1
}

exports.rollRoulette = () => {
    return Random.range(0, 36);
}

exports.getColor = (num) => {
    if (this.betTypes["red"].includes(num)) return "red";
    if (this.betTypes["black"].includes(num)) return "black";
    return "green";
}

exports.getParity = (num) => {
    return (num % 2 == 0 ? "even" : "odd");
}

exports.getOutcome = async (bet, wager) => {

    let rolledResult = await this.rollRoulette();
    let response = {
        "success": true,
        "roll": {
            "number": rolledResult,
            "color": this.getColor(rolledResult),
            "parity": this.getParity(rolledResult)
        }
    };

    let betSuccess = (this.betTypes[bet] && this.betTypes[bet].includes(rolledResult)) || rolledResult == bet;
    let betMultiplier = (this.betTypes[bet] && this.betTypes[bet].includes(rolledResult)) ? this.betMultipliers[bet] : 36;

    response["bet"] = {
        "bet": bet,
        "wager": wager,
        "win": betSuccess,
        "payout_rate": betSuccess ? betMultiplier : 0,
        "payout": betSuccess ? (wager * (betMultiplier + 1)) : 0
    };

    return response;

}