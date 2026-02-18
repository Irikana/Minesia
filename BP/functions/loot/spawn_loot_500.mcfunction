# ========== 核心逻辑 ==========
# 方式1：指定坐标的容器（示例：x=100, y=64, z=200 的箱子）
# execute positioned 100 64 200 if block ~ ~ ~ minecraft:chest run loot insert ~ ~ ~ loot basic_reward_table

# 方式2：指定位置上方的容器（示例：x=100, y=64, z=200 上方1格的木桶）
# execute positioned 100 64 200 if block ~ 1 ~ minecraft:barrel run loot insert ~ 1 ~ loot basic_reward_table

# 先清除容器内物品（容器在使用该函数的命令方块的上方）
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 0 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 1 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 2 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 3 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 4 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 5 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 6 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 7 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 8 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 9 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 10 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 11 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 12 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 13 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 14 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 15 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 16 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 17 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 18 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 19 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 20 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 21 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 22 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 23 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 24 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 25 air
execute if score timer500 loot_timer matches 499 run replaceitem block ~ ~2 ~ slot.container 26 air
# 再生成新的战利品（容器在使用该函数的命令方块的上方）
execute if score timer500 loot_timer matches 500 run loot insert ~ ~1 ~ loot basic_reward_table
# 最后将战利品放入容器

# 该函数适用于命令方块在容器下方的方块的下方的情况