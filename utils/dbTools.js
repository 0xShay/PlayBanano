const Database = require("simplest.db");

const db = new Database({
    path: "./db/users.json"
});

exports.getUserInfo = function(uid) {
    let userInfo = db.get(uid) || {};
    return {
        "balance": userInfo["balance"] || 0,
        "totalWagered": userInfo["totalWagered"] || 0,
        "totalWon": userInfo["totalWon"] || 0,
        "totalLost": userInfo["totalLost"] || 0
    };
}

exports.addBalance = function(uid, value) {
    let userInfo = this.getUserInfo(uid);
    userInfo["balance"] += value;
    db.set(uid, userInfo);
    return this.getUserInfo(uid);
}

exports.transferBalance = function(sid, rid, value) {
    let senderInfo = this.getUserInfo(sid);
    let recvInfo = this.getUserInfo(rid);
    senderInfo["balance"] -= value;
    recvInfo["balance"] += value;
    db.set(sid, senderInfo);
    db.set(rid, recvInfo);
    return this.getUserInfo(rid);
}

exports.totalBalance = function(uid) {
    let totalBalance = 0;
    Object.values(JSON.parse(db.toJSON())).forEach(u => {
        totalBalance += (u.balance || 0);
    });
    return totalBalance;
}

exports.addWagered = function(uid, value) {
    let userInfo = this.getUserInfo(uid);
    userInfo["totalWagered"] += value;
    db.set(uid, userInfo);
    return this.getUserInfo(uid);
}

exports.addWon = function(uid, value) {
    let userInfo = this.getUserInfo(uid);
    userInfo["totalWon"] += value;
    db.set(uid, userInfo);
    return this.getUserInfo(uid);
}

exports.addLost = function(uid, value) {
    let userInfo = this.getUserInfo(uid);
    userInfo["totalLost"] += value;
    db.set(uid, userInfo);
    return this.getUserInfo(uid);
}