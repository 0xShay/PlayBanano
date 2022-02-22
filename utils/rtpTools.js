const Database = require("simplest.db");

const db = new Database({
    path: "./db/rtpStats.json"
});

exports.addWon = function(game, value) {
    let gameInfo = db.get(game) || {};
    gameInfo["totalWon"] ? gameInfo["totalWon"] += value : gameInfo["totalWon"] = value;
    db.set(game, gameInfo);
    return db.get(game) || {};
}

exports.addWagered = function(game, value) {
    let gameInfo = db.get(game) || {};
    gameInfo["totalWagered"] ? gameInfo["totalWagered"] += value : gameInfo["totalWagered"] = value;
    db.set(game, gameInfo);
    return db.get(game) || {};
}

exports.getJSON = function(uid, value) {
    return JSON.parse(db.toJSON());
}