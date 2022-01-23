require("dotenv").config({ path: "../.env" });
const config = require("../config.json");

const { getPublicKey, sendBan, sendBanID, accountInfo, accountBalance, receivePending } = require("../utils/BananoUtils.js");

async function fetchBalance(id) {
    const publicKey = await getPublicKey(id);
    const userBalance = await accountBalance(publicKey);
    return userBalance;
}

for (index = 0; index < 10; index += 1) {
// for (i = 000000000000000000; i < 1000000000000000000; i++) {
    fetchBalance(index).then(res => {
        console.log(index, res);
    });
}
