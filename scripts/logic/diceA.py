import random

BET_AMOUNT = 1
GAME_COUNT = 10000

total_wagered = 0
total_won = 0

for i in range(GAME_COUNT):
    total_wagered += BET_AMOUNT
    dice_roll_player = [random.randint(1, 6), random.randint(1, 6)]
    dice_roll_computer = [random.randint(1, 6), random.randint(1, 6)]
    if sum(dice_roll_player) > sum(dice_roll_computer):
        total_won += BET_AMOUNT * 2
    elif sum(dice_roll_player) == sum(dice_roll_computer):
        total_won += BET_AMOUNT * 1

print(1 - (total_won / total_wagered))