const Discord = require(`discord.js`);
const config = require(`../config.json`);

function formatNum(num) { return num.toFixed(2); }

let cardNumbers = [`A`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `J`, `Q`, `K`];
let cardSuits = [`hearts`, `spades`, `diamonds`, `clubs`];
let cardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

let standardDeck = [];
cardSuits.forEach(suit => {
    cardNumbers.forEach(num => { standardDeck.push([ num, suit ]) })
});

exports.pickCard = function() {
    return standardDeck[Math.floor(Math.random() * standardDeck.length)];
}

exports.pickCardExclusive = function(pickedCards) {
    let chosenCard = undefined;
    while (chosenCard == undefined || pickedCards.includes(chosenCard)) {
        chosenCard = exports.pickCard();
    }
    return chosenCard;
}

exports.startGame = function() {

    let pickedCards = [];
    let dealerHand = [];
    let playerHand = [];

    for (i = 0; i < 2; i++) {
        let chosenCard = exports.pickCardExclusive(pickedCards);
        pickedCards.push(chosenCard);
        dealerHand.push(chosenCard);
    };
    
    for (i = 0; i < 2; i++) {
        let chosenCard = exports.pickCardExclusive(pickedCards);
        pickedCards.push(chosenCard);
        playerHand.push(chosenCard);
    };

    let gameState = {
        pickedCards: pickedCards,
        dealerHand: dealerHand,
        playerHand: playerHand
    };

    return gameState;

}

exports.playerWin = function(playerValue, dealerValue) {
    if (playerValue > 21 && dealerValue <= 21) {
        return -1;
    }
    if (dealerValue > 21 && playerValue <= 21) {
        return 1;
    }
    if (playerValue == dealerValue) {
        return 0;
    }
    if (playerValue <= 21 && dealerValue <= 21) {
        // closest to 21 wins
        return (21 - playerValue < 21 - dealerValue) ? 1 : -1;
    }
    if (playerValue >= 21 && dealerValue >= 21) {
        // closest to 21 wins
        return (playerValue - 21 < dealerValue - 21) ? 1 : -1;
    }
}

exports.calculateValue = function(hand) {
    let total = 0;
    hand.sort((a, b) => {
        if (a[0] == `A`) return 0;
        if (b[0] == `A`) return -1;
    }).forEach(card => {
        if (card == `A`) {
            if (total + 11 > 21) {
                total += 1
            } else {
                total += 11
            }
        } else {
            total += cardValues[cardNumbers.indexOf(card[0])];
        }
    });
    return total;
} 

exports.generateEmbedDesc = function(gameObject, gameEnded=false, betAmount=0) {
    
    let playerTotal = exports.calculateValue(gameObject.playerHand);
    let dealerTotal = exports.calculateValue(gameObject.dealerHand);

    if (gameEnded) {

        let didPlayerWin = exports.playerWin(playerTotal, dealerTotal);

        let embedString = [
            `**Your hand:**\n${exports.generateCardString(gameObject.playerHand)}`,
            // `-----------------`,
            `total = ${playerTotal}`,
            ``,
            `**Dealer's hand:**\n${exports.generateCardString(gameObject.dealerHand)}`,
            // `-----------------`,
            `total = ${dealerTotal}`,
            ``
        ];

        if (didPlayerWin == 1) {
            embedString.push(`🤑 **You won ${formatNum(betAmount)}, congrats!**`);
        } else if (didPlayerWin == 0) {
            embedString.push(`😐 **You tied and got your wager back.**`);
        } else {
            embedString.push(`😢 **You lost ${formatNum(betAmount)}...**`);
        }

        return embedString.join(`\n`);

    } else {

        let i_init = 0;
        let i_target = 1;
        // let i_target = Math.floor(gameObject.dealerHand.length / 2);

        let dealerHandCensored = [];

        gameObject.dealerHand.forEach(c => {
            if (i_init < i_target) {
                dealerHandCensored.push(c);
            } else {
                dealerHandCensored.push(`back`);
            }
            i_init++;
        });

        return [
            `**Your hand:**\n${exports.generateCardString(gameObject.playerHand)}`,
            // `-----------------`,
            `total = ${playerTotal}`,
            ``,
            `**Dealer's hand:**\n${exports.generateCardString(gameObject.dealerHand, true)}`,
            // `-----------------`,
            `total = ?`,
            ``,
            `React with 🟢 to hit or 🔴 to stand.`,
        ].join(`\n`)

    }
    
}

exports.playerHit = function(gameObject) {
    // add card to player, see if card should be added to dealer
    while (exports.calculateValue(gameObject.dealerHand) <= 16) {
        let dealerCard = exports.pickCardExclusive(gameObject.pickedCards);
        gameObject.pickedCards.push(dealerCard);
        gameObject.dealerHand.push(dealerCard);
    }
    let hitCard = exports.pickCardExclusive(gameObject.pickedCards);
    gameObject.pickedCards.push(hitCard);
    gameObject.playerHand.push(hitCard);
    return gameObject;
}

exports.playerStand = function(gameObject) {
    // see if card should be added to dealer
    while (exports.calculateValue(gameObject.dealerHand) <= 16) {
        let dealerCard = exports.pickCardExclusive(gameObject.pickedCards);
        gameObject.pickedCards.push(dealerCard);
        gameObject.dealerHand.push(dealerCard);
    }
    return gameObject;
}

exports.resolveEmoji = function(card) {
    
    let cardColor = [`hearts`, `diamonds`].includes(card[1]) ? `red` : `black`;

    // top half emoji
    let emojiNum = config["card-emojis"]["ranks"][cardColor][card[0]];
    let emojiSuit = config["card-emojis"]["suits"][card[1]];

    return [emojiNum, emojiSuit];

}

exports.generateCardString = function(cards, dealer=false) {
    let list_line1 = [];
    let list_line2 = [];
    cards.forEach(c => {
        if (dealer && cards.indexOf(c) != 0) {
            list_line1.push(config["card-emojis"]["blank"]["top"]);
            list_line2.push(config["card-emojis"]["blank"]["bottom"]);
        } else {
            let cardEmoji = exports.resolveEmoji(c);
            list_line1.push(cardEmoji[0]);
            list_line2.push(cardEmoji[1]);
        }
    })
    return list_line1.join(` `) + `\n` + list_line2.join(` `);
}