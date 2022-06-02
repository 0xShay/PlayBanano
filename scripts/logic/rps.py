import random

BET_AMOUNT = 1
GAME_COUNT = 1000000

total_wagered = 0
total_won = 0

GAME_LOGIC = {
    "r": { "r": 0, "p": -1, "s": 1 },
    "p": { "r": 1, "p": 0, "s": -1 },
    "s": { "r": -1, "p": 1, "s": 0 }
}

for i in range(GAME_COUNT):
    total_wagered += BET_AMOUNT
    user_move = ["r", "p", "s"][random.randint(0, 2)]
    computer_move = ["r", "p", "s"][random.randint(0, 2)]
    if GAME_LOGIC[user_move][computer_move] == 1:
        total_won += BET_AMOUNT * 1.9
    elif GAME_LOGIC[user_move][computer_move] == 0:
        total_won += BET_AMOUNT * 0.9
    elif GAME_LOGIC[user_move][computer_move] == -1:
        pass

print(1 - (total_won / total_wagered))