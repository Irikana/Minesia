# Create scoreboard objective for loot timer
scoreboard objectives add loot_timer dummy

# Initialize virtual players 'timer'
scoreboard players add timer loot_timer 0
scoreboard players add timer500 loot_timer 0
scoreboard players add timer12000 loot_timer 0
#  12000 ticks = 10 minutes
# scoreboard players set timer loot_timer 0
# 上面这行代码本来应该存在，但在tick.json中已经调用了load.mcfunction，所以这里可以省略，并用add代替set