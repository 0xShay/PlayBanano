import random

BET_AMOUNT = 1
GAME_COUNT = 10000

total_wagered = 0
total_won = 0

GAME_LOGIC = {
    "multipliers": [10, 5, 3, 2, 1, 0]
}

for i in range(GAME_COUNT):
    total_wagered += BET_AMOUNT
    target = random.randint(1, 100)
    guessed = False
    round_index = 0
    user_min = 1
    user_max = 100
    while guessed == False:
        if round_index > len(GAME_LOGIC["multipliers"]):
            break
        guess = random.randint(user_min, user_max)
        if guess == target:
            guessed = True
        elif guess < target:
            user_min = guess+1
        elif guess > target:
            user_max = guess-1
        round_index += 1
    total_won += BET_AMOUNT * GAME_LOGIC["multipliers"][round_index-2]

print(1 - (total_won / total_wagered))
print(total_won, total_wagered)