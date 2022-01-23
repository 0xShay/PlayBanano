require("dotenv").config({ path: "../.env" });
const config = require("../config.json");

const { getPublicKey, sendBan, sendBanID, accountInfo, accountBalance, receivePending } = require("../utils/BananoUtils.js");

async function fetchBalance(id) {
    const publicKey = await getPublicKey(id);
    const userBalance = await accountBalance(publicKey);
    return userBalance;
}

for (i = 0; i < 10; i += 1) {
// for (i = 000000000000000000; i < 1000000000000000000; i++) {
    fetchBalance(i).then(res => {
        console.log(i, res);
    });
}
