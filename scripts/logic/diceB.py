import random

BET_AMOUNT = 1
GAME_COUNT = 10000

total_wagered = 0
total_won = 0

for i in range(GAME_COUNT):
    total_wagered += BET_AMOUNT
    bet_on = 3
    dice_roll = random.randint(1, 6)
    if dice_roll == bet_on:
        total_won += (BET_AMOUNT * 5)

print(1 - (total_won / total_wagered))