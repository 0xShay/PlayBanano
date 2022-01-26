const Database = require("simplest.db");

const db = new Database({
    path: "./db/users.json"
});

exports.getUserInfo = function(uid) {
    let userInfo = db.get(uid) || {};
    return {
        "balance": userInfo["balance"] || 0
    };
}

exports.add = function(uid, value) {
    let userInfo = this.getUserInfo(uid);
    userInfo["balance"] += value;
    db.set(uid, userInfo);
    return this.getUserInfo(uid);
}

exports.transfer = function(sid, rid, value) {
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