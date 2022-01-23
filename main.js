require("dotenv").config({ path: ".env" });
const config = require("./config.json");

const Discord = require("discord.js");
const QRCode = require("qrcode");
const axios = require("axios");
const BigNumber = require("bignumber.js");

let commandCooldown = new Set();

const { getPublicKey, sendBan, sendBanID, accountInfo, accountBalance, receivePending } = require("./utils/BananoUtils.js");

let housePublicKey;

getPublicKey(0).then(res => housePublicKey = res);

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MEMBERS
    ]
});

const unitsToRaw = (units) => {
    return (BigNumber(units).times(BigNumber("1e29"))).toNumber();
};

const rawToUnits = (raw) => {
    return Math.floor((BigNumber(raw).div(BigNumber("1e27"))).toNumber()) / 1e2;
};

const percentageMul = (int0, percent) => {
    return (BigNumber(int0).times(BigNumber(percent))).toNumber();
};

const defaultEmbed = () => {
    return new Discord.MessageEmbed()
        .setColor(config["embed-color"]);
};

const txHashLink = (hash) => {
    return ""
}

client.on("ready", () => {
    console.log("Logged in: " + client.user.tag);
})

client.on("messageCreate", async (message) => {

    if (!message.content.toLowerCase().startsWith(config["prefix"])) return;
    const args = message.content.toLowerCase().substring(config["prefix"].length).split(" ");
    

    const userPublicKey = await getPublicKey(message.author.id);

    if (commandCooldown.has(message.author.id)) {
        return;
        // return message.reply("You are on a command cooldown. (5s)")
    } else {
        commandCooldown.add(message.author.id);
        setTimeout(() => {
            commandCooldown.delete(message.author.id);
        }, config["command-cooldown"]);
    }

    console.log("[ " + (new Date()).toLocaleTimeString() + " ]", message.author.tag, args);

    if (args[1] == "all") {
        const userBalance = await accountBalance(userPublicKey);
        args[1] = Math.floor(BigNumber(userBalance.balance).div(BigNumber("1e27")).toNumber()) / 1e2;
    }
    
    if (args[1] == "half") {
        const userBalance = await accountBalance(userPublicKey);
        args[1] = Math.floor(BigNumber(userBalance.balance).div(BigNumber("1e27")).toNumber()) / 1e2 / 2;
    }

    if (["help"].includes(args[0])) {
        return message.reply([
            `**Commands list**`,
            `\`${config["prefix"]}balance\` - Check your balance`,
            `\`${config["prefix"]}deposit\` - Get your deposit address`,
            `\`${config["prefix"]}send [@user] [amount]\` - Send [amount] BAN to [@user]`,
            `\`${config["prefix"]}donate [amount]\` - Donate [amount] BAN to the casino`,
            `\`${config["prefix"]}coinflip [amount] [heads/tails]\` - Bet [amount] BAN on a coinflip's outcome`,
            `\`${config["prefix"]}roulette [amount] [odd/even/low/high/red/black/#]\` - Bet [amount] BAN on a roulette's outcome`,
            ``,
            `*Minimum bet:* \`${config["min-bet"]} BAN\``,
            `*Minimum payment/withdrawal:* \`${config["min-pay"]} BAN\``,
            `*House edge:* \`${config["house-edge"] * 100}%\``
        ].join(`\n`));
    }

    if (["balance", "bal", "wallet"].includes(args[0])) {
        const userBalance = await accountBalance(userPublicKey);
        if (BigNumber(userBalance.receivable || userBalance.pending).isGreaterThan(BigNumber(0))) {
            await receivePending(message.author.id);
        };
        return message.reply(`You have **${rawToUnits(BigNumber(userBalance.balance).plus(BigNumber(userBalance.pending))).toFixed(2)} BAN**`);
    }

    if (["deposit"].includes(args[0])) {
        QRCode.toDataURL(userPublicKey, function (err, url) {
            const depositEmbed = defaultEmbed()
            .setDescription(`**${userPublicKey}**`)
            .setImage(`https://quickchart.io/qr?text=${userPublicKey}.png&dark=${config["qr-code-dark"].substring(1)}&light=${config["qr-code-light"].substring(1)}`)
            message.reply({ embeds: [depositEmbed] })
            if (process.env["APP_MODE"] == "TESTING") {
                message.channel.send("**NOTE: we are in the testing period, do not send BAN to the address above. <@293405833231073280> will give you 5 BAN to test with. Any extra sent to the address will be counted as a donation.**");
            } else {
                return message.channel.send(userPublicKey);
            }
        });
    }

    if (["withdraw"].includes(args[0])) {
        if (process.env["APP_MODE"] == "TESTING") return message.reply("Withdrawals are disabled during testing.");
        let payAmount = parseFloat(args[1]);
        let recvPublicKey = args[2];
        if (!payAmount || !recvPublicKey) return message.reply(`Command syntax: \`${config["prefix"]}${args[0]} [amount] [address]\``);
        if (payAmount < config["min-pay"]) return message.reply(`Minimum withdrawal: **${config["min-pay"]} BAN**`);
        const userBalance = await accountBalance(userPublicKey);
        if (BigNumber(userBalance.balance).isLessThan(BigNumber(unitsToRaw(payAmount)))) return message.reply("You don't have enough Banano to do that.");
        const recvAccount = await accountInfo(recvPublicKey);
        if (recvAccount.error) return message.reply("Invalid BAN address.");
        const txHash = await sendBan(recvPublicKey, unitsToRaw(payAmount), message.author.id);
        message.reply(`Withdrawn **${Math.floor(payAmount * 1e2) / 1e2} BAN** to \`${recvPublicKey}\`\n\`-${Math.floor(payAmount * 1e2) / 1e2} BAN (${txHash})\``);
    }

    if (["send"].includes(args[0])) {
        let payAmount;
        let recvUser;
        if (message.type === "REPLY") {
            const ogMessage = await message.fetchReference();
            recvUser = ogMessage.author;
            payAmount = parseFloat(args[1]);
        } else {
            payAmount = parseFloat(args[1]);
            recvUser = message.mentions.users.first();
        };
        if (!recvUser || !payAmount) return message.reply(`Command syntax: \`${config["prefix"]}${args[0]} [amount] [@user]\``);
        if (payAmount < config["min-bet"]) return message.reply(`Minimum payment: **${config["min-pay"]} BAN**`);
        if (recvUser.id == message.author.id) return message.reply(`You can't tip yourself!`);
        const userBalance = await accountBalance(userPublicKey);
        if (BigNumber(userBalance.balance).isLessThan(BigNumber(unitsToRaw(payAmount)))) return message.reply("You don't have enough Banano to do that.");
        const txHash = await sendBanID(recvUser.id, unitsToRaw(payAmount), message.author.id);
        await receivePending(recvUser.id);
        message.reply(`Sent **${Math.floor(payAmount * 1e2) / 1e2} BAN** to ${recvUser}\n\`-${Math.floor(payAmount * 1e2) / 1e2} BAN (${txHash})\``);
    }

    if (["donate"].includes(args[0])) {
        const payAmount = parseFloat(args[1]);
        if (!payAmount) return message.reply(`Command syntax: \`${config["prefix"]}${args[0]} [amount]\``);
        if (payAmount < config["min-pay"]) return message.reply(`Minimum payment: **${config["min-pay"]} BAN**`);
        const userBalance = await accountBalance(userPublicKey);
        if (BigNumber(userBalance.balance).isLessThan(BigNumber(unitsToRaw(payAmount)))) return message.reply("You don't have enough Banano to do that.");
        const txHash = await sendBan(housePublicKey, unitsToRaw(payAmount), message.author.id);
        await receivePending(0);
        message.reply(`Donated **${Math.floor(payAmount * 1e2) / 1e2} BAN** to the house: \`-${Math.floor(payAmount * 1e2) / 1e2} BAN (${txHash})\``);
    }

    if (["coinflip", "cf", "coin", "flip"].includes(args[0])) {
        const betAmount = parseFloat(args[1]);
        let betOn = ["heads", "tails", "h", "t"].includes(args[2]) ? args[2] : false;
        if (!betAmount || !betOn) return message.reply(`Command syntax: \`${config["prefix"]}${args[0]} [amount] [heads/tails]\``);
        if (betAmount < config["min-bet"]) return message.reply(`Minimum bet: **${config["min-bet"]} BAN**`);
        if (betOn == "h") betOn = "heads";
        if (betOn == "t") betOn = "tails";
        const userBalance = await accountBalance(userPublicKey);
        if (BigNumber(userBalance.balance).isLessThan(BigNumber(unitsToRaw(betAmount)))) return message.reply("You don't have enough Banano to do that.");
        if (Math.random() >= (0.5 * (1+config["house-edge"]))) {
            const txHash = await sendBan(userPublicKey, unitsToRaw(betAmount), 0);
            // const txHash = await sendBan(userPublicKey, percentageMul(unitsToRaw(betAmount), 1-config["house-edge"]), 0);
            await receivePending(message.author.id);
            return message.reply(`The coin landed on ${betOn} - congrats!\n\`+${betAmount.toFixed(2)} BAN (${txHash})\``);
        } else {
            const txHash = await sendBan(housePublicKey, unitsToRaw(betAmount), message.author.id);
            await receivePending(0);
            return message.reply(`The coin landed on ${betOn == "heads" ? "tails" : "heads"}...\n\`-${betAmount.toFixed(2)} BAN (${txHash})\``);
        }
    }

    if (["roulette"].includes(args[0])) {
        if (message.author.id != "293405833231073280") return message.reply("This command is under maintenance ;)");
        const betAmount = parseFloat(args[1]);
        let betOn = (["odd", "even", "low", "high", "red", "black"].includes(args[2]) || (parseInt(args[2]) && parseInt(args[2]) >= 0 && parseInt(args[2]) <= 36)) ? args[2] : false;
        if (!betAmount || !betOn) return message.reply(`Command syntax: \`${config["prefix"]}${args[0]} [amount] [odd/even/low/high/red/black/#]\``);
        if (betAmount < config["min-bet"]) return message.reply(`Minimum bet: **${config["min-bet"]} BAN**`);
        const userBalance = await accountBalance(userPublicKey);
        if (BigNumber(userBalance.balance).isLessThan(BigNumber(unitsToRaw(betAmount)))) return message.reply("You don't have enough Banano to do that.");
        const txHash0 = await sendBanID(0, unitsToRaw(betAmount), message.author.id);
        await axios.get(`https://www.roulette.rip/api/play?bet=${betOn}&wager=${BigNumber(unitsToRaw(betAmount)).toNumber().toLocaleString(undefined, { style: "decimal", useGrouping: false })}`)
        .then(async rouletteResult => {
            console.log(rouletteResult.data);
            if (rouletteResult.data["bet"]["win"] && rouletteResult.data["roll"]["number"] != 0) {
                    const txHash1 = await sendBanID(message.author.id, parseInt(rouletteResult.data["bet"]["payout"]), 0);
                    message.reply(`The wheel landed on a **:${rouletteResult.data["roll"]["color"].toLowerCase()}_circle: ${rouletteResult.data["roll"]["number"]}**\n\nCongrats, you won **${BigNumber(rawToUnits(parseInt(rouletteResult.data["bet"]["payout"]))).toFixed(2)} BAN**!\n\`+${BigNumber(rawToUnits(parseInt(rouletteResult.data["bet"]["payout"]))).toFixed(2)} BAN (${txHash1})\``);
                } else {
                    message.reply(`The wheel landed on a **:${rouletteResult.data["roll"]["color"].toLowerCase()}_circle: ${rouletteResult.data["roll"]["number"]}**\n\nYou lost...\n\`-${betAmount.toFixed(2)} BAN (${txHash0})\``);
                }
            }).catch(console.error);
    }

})

client.login(process.env["BOT_TOKEN"]);