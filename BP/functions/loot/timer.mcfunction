# 1. 每tick（0.05秒）计时值+1
# scoreboard players add timer loot_timer 1
# scoreboard players add timer500 loot_timer 1
scoreboard players add timer12000 loot_timer 1
# 2. 判断是否达到10秒（20tick=1秒 → 200tick=10秒）
# execute if score timer loot_timer matches 200 run function loot/spawn_loot（不再使用）

# 3. 达到时间后重置计时，实现循环
execute if score timer loot_timer matches 201 run scoreboard players set timer loot_timer 0
execute if score timer500 loot_timer matches 501 run scoreboard players set timer500 loot_timer 0
execute if score timer12000 loot_timer matches 12001 run scoreboard players set timer12000 loot_timer 0