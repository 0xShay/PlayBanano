const Discord = require(`discord.js`);
const config = require(`../config.json`);

let cardNumbers = [`A`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `J`, `Q`, `K`];
let cardSuits = [`hearts`, `spades`, `diamonds`, `clubs`];

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
        chosenCard = this.pickCard();
    }
    return chosenCard;
}

exports.drawCard = function(gameState, dp) {
    let chosenCard = this.pickCardExclusive(gameState.pickedCards);
    gameState.pickedCards.push(chosenCard);
    gameState[dp].hand.push(chosenCard);
    let cardValue = parseInt(chosenCard[0]) || (chosenCard[0] == `A` ? (gameState[dp].value + 11 > 21 ? 1 : 11) : 10);
    gameState[dp].value += cardValue;
    return gameState;
}

exports.startGame = function() {
    let gameState = {
        pickedCards: [],
        dealer: {
            hand: [],
            value: 0
        },
        player: {
            hand: [],
            value: 0
        },
        result: "ONGOING"
    };

    gameState = this.drawCard(gameState, "dealer");
    gameState = this.drawCard(gameState, "player");
    gameState = this.drawCard(gameState, "player");

    if (gameState.player.value >= 21) gameState = this.checkForWin(gameState);

    return gameState;
}

exports.hit = function(gameState) {
    gameState = this.drawCard(gameState, "player");
    if (gameState.player.value >= 21) gameState = this.checkForWin(gameState);
    return gameState;
}

exports.stand = function(gameState) {
    while (gameState.dealer.value < 17) {
        gameState = this.drawCard(gameState, "dealer");
    };
    gameState = this.checkForWin(gameState);
    return gameState;
}

exports.checkForWin = function(gameState) {
    let dealerValue = gameState.dealer.value;
    let playerValue = gameState.player.value;
    // -1 = loss
    // 0 = draw
    // 1 = win
    if (playerValue <= 21 && dealerValue > 21) {
        gameState.result = "PLAYER_WIN";
    } else if (playerValue > 21 && dealerValue <= 21) {
        gameState.result = "DEALER_WIN";
    } else if (playerValue == dealerValue) {
        gameState.result = "PUSH";
    } else if (playerValue <= 21 && dealerValue <= 21) {
        // closest to 21 wins
        gameState.result = (21 - playerValue < 21 - dealerValue) ? "PLAYER_WIN" : "DEALER_WIN";
    } else if (playerValue >= 21 && dealerValue >= 21) {
        // closest to 21 wins
        gameState.result = (playerValue - 21 < dealerValue - 21) ? "PLAYER_WIN" : "DEALER_WIN";
    }
    return gameState;
}