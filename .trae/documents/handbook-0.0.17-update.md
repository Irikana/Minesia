# 0.0.17 更新计划：handbook 落地 + 0.0.16 差异校对 + 更新日志重写

## Context（背景）

`docs/handbook.txt`（日期 2026.7.8）列出一批待落地改动：随机伤害取整、武器副手效果仅限副手、删除自定义 NPC 限购、武器匠降价、镰刀配方改形、10 把武器数值/事件调整、3 把新武器、深蓝（darkblue）套装、班戈之盾饰品。

同时当前 manifest 已是 0.0.17，`changelogs/zh_CN/0.0.17.plan.md` 已记录 HUD/语言/修复等改动（0.0.16 之后的已实施改动）。本任务需：

1. 把 handbook 内容落地到游戏；
2. 以 `builds/Minesia 0.0.16.mcaddon` 快照为基线，对比当前 BP/RP 找差异；
3. 以差异为准重写 0.0.17 更新日志（净变原则）。

关键事实（已核实）：

* 伤害数值不在物品 JSON，而在 [config.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/random_damage/config.js)（`RANDOM_DAMAGE_WEAPONS`）；耐久在物品 JSON `max_durability`。

* 副手/背包第一行双激活来自 [setEffectMain.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/set_effect/setEffectMain.js) `processItemRules`（97-105 行对 `slots:["offhand"]` 规则额外扫饰品栏 9-17）。

* 暴击系统 [critical\_hit](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/critical_hit/config.js)：`weaponCriticalBonuses`/`equipmentCriticalBonuses` 控制暴击率，全局 `criticalDamageMultiplier:1.5`，无每玩家暴击伤害加成接口。

* 自定义 NPC 交易 [victor\_trade.json](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/trading/victor_trade.json) / `ryaman_trade.json`，每条带 `max_uses:4`（即限购）；武器匠村民 [weapon\_smith\_trades.json](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/trading/weapon_smith_trades.json) 仅有沙漠镰刀 25 金。

* darkblue 仅有 RP 纹理（剑/4 盔甲/镐斧锹锄/锭/矛），无 BP 物品、无矿石、无 lang。

* 联网核实：MCBE 1.21.130（2025-12）已加入原版长矛（木/石/铜/铁/金/钻石/下界合金）。原版铜矛存在 → 按用户指示 **跳过 copper\_spear**（项目无对应文件，无需删除）。darkblue\_spear 作为自定义材料矛仍实现（简单 hand\_equipped，无法复刻原版长矛 jab/charge/reach 机制）。

* 随机伤害 .5 取整：用户选四舍五入（7.5→8，10.5→11）。

* 环境无 git；0.0.16 基线用 `builds/Minesia 0.0.16.mcaddon`（zip）解压对比。

## 纹理现状（已核实，纹理均已存在）

经查阅 `RP/textures/items/` 与 `RP/textures/block/`，下列新内容纹理均已存在，无需占位：

* `proof_of_strength.png`、`god_of_leaves.png`、`shield_of_bange.png`（在 `textures/items/`）

* `darkblue_ore.png`、`darkblue_block.png`、`deepslate_darkblue_ore.png`（在 `textures/block/`）

* darkblue 全套物品纹（剑/4 盔甲/镐斧锹锄/锭/矛）在 `textures/items/`，盔甲模型纹 `darkblue_1/2.png` 在 `textures/models/armor/`

**copper\_spear 跳过产生的纹理清理**：因原版 1.21.130 已有铜矛，按用户指示不实现 copper\_spear，需删除已存在的 `RP/textures/items/copper_spear.png` 与 `copper_spear_in_hand.png`。

> 实现时只需在 `item_texture.json` / `terrain_texture.json` 注册这些已有纹理的引用。

***

## Part A：handbook 落地

### A1. 全局改动

**A1.1 随机伤害取整** — [config.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/random_damage/config.js)

* `calculateRandomDamage` 改为整数：`Math.floor(min + Math.random()*(max-min+1))`（min==max 仍返回 min）。

* 3 把 .5 武器四舍五入：铜镰刀 6\~7.5→6\~8、石镰刀 6\~7.5→6\~8、钻石镰刀 8\~10.5→8\~11。

* 同步 [zh\_CN.lang](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/RP/texts/zh_CN.lang) / en\_US.lang 显示：`+6~7.5`→`+6~8`（铜/石镰刀）、`+8~10.5`→`+8~11`（钻石镰刀）。`formatDamageRange` 因全整数可保持。

**A1.2 武器副手效果仅限副手** — [rules.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/set_effect/rules.js) + [setEffectMain.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/set_effect/setEffectMain.js)

* 给 `flamie`、`ender_pearl_sword` 两条 ITEM\_RULES 加 `offhandOnly: true`。

* `processItemRules` 内 `if (rule.slots.includes("offhand"))` 分支改为 `if (rule.slots.includes("offhand") && !rule.offhandOnly)`，跳过饰品栏扫描。（饰品类规则保持原行为。）

* lang：flamie、ender\_pearl\_sword 描述中"副手或背包第一行时"→"副手时"（饰品类不改）。

**A1.3 删除自定义 NPC 限购** — [victor\_trade.json](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/trading/victor_trade.json)、`BP/trading/ryaman_trade.json`

* 移除每条 trade 的 `max_uses` 字段（=无限）。仅限自定义 NPC，村民交易不动。

**A1.4 武器匠降价（略高于 Victor）** — [weapon\_smith\_trades.json](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/trading/weapon_smith_trades.json)

* 沙漠镰刀 25 金 → 6 金（Victor 4 金 + 2）。

* 新增霜刃贸易：4 金（handbook 明确）。原版系武器（钻石剑/斧 12-18 金）不动。

### A2. 镰刀配方改形（8 把可合成镰刀）

新形状（O=空，A=材料，I=木棍）：

```
 AA
A I
 I
```

pattern: `[" AA","A I"," I "]`。改 [BP/recipes/](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/recipes) 下 wooden/stone/iron/copper/golden/diamond/netherite/steel\_scythe.json（desert\_scythe 无配方，跳过）。

### A3. 武器调整（10 把）

每把改：config.js 伤害、物品 JSON 耐久（如需）、effect 文件事件、lang 描述/伤害显示。

| 武器                   | 伤害           | 耐久        | 自定义事件改动                                          |
| -------------------- | ------------ | --------- | ------------------------------------------------ |
| desert\_walker       | 4\~7→5\~8    | 1400      | 缓慢I 1s→3s（20→60 tick）                            |
| desert\_snow         | 4\~7→5\~9    | —         | 不变                                               |
| flamie               | 4\~7→5\~8    | —         | 副手着火 2s→5s（`isOffhandEquipped?5:5`）              |
| the\_forest          | —            | —         | 中毒 3s→6s（60→120 tick）；恢复体力 2→5                   |
| ender\_pearl\_sword  | 5\~7→5\~8    | —         | 不变                                               |
| duty\_ice            | 5\~8→6\~9    | 280→691   | 效果时长 10s→5s（200→100 tick）；描述展开药水效果与时间            |
| white\_golden\_sword | 7\~9→4\~7    | 1400      | 重写：50% 概率，0.5s 内 2 段额外 1\~2 物理伤害，事件消耗 1 耐久       |
| frost\_edge          | —            | 1000→867  | 不变；新增武器匠 4 金 + Victor 2 金贸易                      |
| tina                 | 8\~13→10\~15 | 2000→1984 | 不变                                               |
| black\_dagger        | —            | 150       | 重写：每 3 次攻击必暴击 1 次；攻击 30% 凋零II 6s（amp1, 120 tick） |

实现细节：

* white\_golden\_sword：重写 [whiteGoldenSwordEffect.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/custom_events/item_events/whiteGoldenSwordEffect.js)。50% 触发 → 用 `system.runTimeout` 分 2 段（每段间隔约 5 tick=0.25s，共 0.5s），每段 `target.applyDamage(1~2,{cause:"entityAttack",damagingEntity:attacker})`；触发时主手武器耐久 +1。需注意 `isCurrentlyApplyingCriticalDamage` 防重入。

* black\_dagger：重写 [blackDaggerEffect.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/custom_events/item_events/blackDaggerEffect.js)。维护每玩家攻击计数 Map，每第 3 次调用 [applyCriticalHit](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/critical_hit/criticalHitMain.js)（需 export 并传入 baseDamage）；凋零 30%/6s。lang 描述同步。

* 所有 effect 文件内的 `description` 字段与 lang 一并更新。

### A4. 新武器（2 把；copper\_spear 跳过）

**proof\_of\_strength（力量的证明）**：伤害 5，耐久 894，事件=攻击额外造成 `(当前体力/最大体力)*10` 物理伤害，描述"只干体力活。"，Victor 3 金。

* 新建 BP/items/proof\_of\_strength.json（group specialWeapons）、RP/items/proof\_of\_strength.json（纹理 `textures/items/proof_of_strength` 已存在）、lang、item\_texture.json 注册 `minesia:proof_of_strength`。

* config.js 加 `{id:"minesia:proof_of_strength",minDamage:5,maxDamage:5}`。

* 新建 proofOfStrengthEffect.js + weaponEffectConfig.js 注册（onAttack 取 `StaminaSystem` 读 `getCurrentStamina`/`getMaxStamina`，applyDamage 额外伤害）。

* victor\_trade.json 加 3 金币→proof\_of\_strength。

**god\_of\_leaves（树叶之神）**：伤害 2\~5，耐久 459，事件=树叶飞向目标实时位置，0.5s 内 3 段 1\~3 物理伤害，冷却 2s，描述"疯狂地蔓延生长。"，配方（任何树叶 L + 木棍 I，shape `[" L ","LLL"," I "]`）。

* 新建 BP/items/god\_of\_leaves.json、RP/items/god\_of\_leaves.json（纹理 `textures/items/god_of_leaves` 已存在）、lang、item\_texture.json 注册 `minesia:god_of_leaves`。

* config.js 加 2\~5。

* 新建 godOfLeavesEffect.js + 注册（每玩家冷却 Map 40 tick；触发时 3 段 `system.runTimeout` 间隔 \~5 tick，每段 1\~3 伤害 + spawnParticle 树叶粒子）。

* BP/recipes/god\_of\_leaves.json：shaped，L 用 `minecraft:leaves`（或 `item_tag:'minecraft:leaves'`，按 Bedrock 支持方式）；占位先用 `minecraft:oak_leaves`，后续可换 tag。

* 树叶配方产出需在合成器可合成。

### A5. darkblue 深蓝全套

纹理已齐（剑/4 盔甲/镐斧锹锄/锭/矛）。新建 BP 物品 + 矿石 + 生成 + 配方 + lang + 套装规则。数值定位：钻石与下界合金之间。

* **矿石、方块与锭**（纹理均已存在于 `textures/block/`，统一后路径 `textures/blocks/`）：

  * BP/blocks/darkblue\_ore.json（石头变体矿石，`minecraft:destructible_by_mining` 钻石镐等级，掉落 darkblue 原矿或直接锭），纹 `darkblue_ore`。

  * BP/blocks/deepslate\_darkblue\_ore.json（深板岩变体矿石，同上掉落），纹 `deepslate_darkblue_ore`。

  * BP/blocks/darkblue\_block.json（存储方块，9 锭合成，仿钻石块），纹 `darkblue_block`。

  * 矿石生成：BP/features/darkblue\_ore.feature.json + BP/feature\_rules/darkblue\_ore.rule.json（石头变体，主世界 y=-50\~0，概率与铁相当）；deepslate 变体同范围或略深（-64\~-16），参考原版铁/钻石矿双变体规则。

  * BP/items/darkblue\_ingot.json（冶炼 darkblue 原矿→锭：BP/recipes/darkblue\_ingot\_furnace.json）。

* **武器/工具**（耐久 \~1800，介于钻石 1561 与下界合金 2031）：

  * darkblue\_sword：7\~9 伤害（config.js 加条目），耐久 1800。

  * darkblue\_spear：4\~6 伤害（参考原版钻石矛 4 / 下界合金矛 5），耐久 1800，简单 hand\_equipped（无原版长矛机制）。

  * darkblue\_pickaxe/axe/shovel/hoe：耐久 1800，挖掘速度介于钻石与下界合金。

* **盔甲**（4 件，防御/耐久介于钻石与下界合金）：

  * darkblue\_helmet/chestplate/leggings/boots.json，复用 steel 盔甲 attachable 模式（如需 attachable 文件，参考 [steel\_\*.json](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/builds/dist/Minesia%20RP/attachables)）。

* **配方**：剑/工具/盔甲由 darkblue\_ingot 合成（形状同原版对应物品）；darkblue\_spear 用 `[" I","IA"]` 或镰刀矛形（A=darkblue\_ingot,I=木棍）。

* **RP**：item\_texture.json 注册各 darkblue\_\* 物品纹（剑/4 盔甲/4 工具/锭/矛，纹已存在）；terrain\_texture.json（当前为空）注册 3 个方块纹 `textures/blocks/darkblue_ore|darkblue_block|deepslate_darkblue_ore`；blocks.json 加 3 方块材质映射；attachables 加 darkblue 盔甲（用 `textures/models/armor/darkblue_1|2`）。

* **lang**：zh\_CN/en\_US 加全部 darkblue\_\* 名称与描述（剑描述含套装加成说明，仿 steel 盔甲 lang 行 13-16）。

* **套装加成** — [rules.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/set_effect/rules.js) `SET_RULES` 加：

  ```
  darkblue_full_set: required{head/chest/legs/feet: minesia:darkblue_*},
  actions:[{kind:"attribute",type:"health",value:4},{kind:"attribute_percent",type:"stamina",percent:50}]
  ```

  （+4 生命经 healthBoostManager→1 级 health\_boost=+4HP；+50% 体力→+50 体力。）

* **暴击/随机伤害**：darkblue\_sword、darkblue\_spear 进 config.js（7\~9 / 4\~6）。

### A6. shield\_of\_bange 班戈之盾（饰品）

+20 最大体力、+10% 暴击率、+25% 暴击伤害；副手时免疫弓/弩弹射物伤害；描述"班戈曾是一名无畏冲锋的战士。"；Victor 40 银币。

* 新建 BP/items/shield\_of\_bange.json（group accessories）、RP/items/shield\_of\_bange.json（纹理 `textures/items/shield_of_bange` 已存在）、lang、item\_texture.json 注册 `minesia:shield_of_bange`。

* [rules.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/set_effect/rules.js) ITEM\_RULES 加：`shield_of_bange` slots:\["offhand"], actions:\[{attribute\_percent stamina 20}]。

* [critical\_hit/config.js](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/critical_hit/config.js)：`equipmentCriticalBonuses["minesia:shield_of_bange"]=10`。

* **暴击伤害 +25%**：扩展暴击系统。config 加 `equipmentCriticalDamageBonuses:{"minesia:shield_of_bange":25}`；criticalHitMain.js 加 `getTotalCriticalDamageMultiplier(player)`（基础 1.5 + 装备/饰品暴击伤害加成/100）；`applyCriticalHit` 用该倍数替代全局 1.5 计算额外伤害。

* **弹射物免疫**：在 main.js（或新 shieldOfBangeMain.js）订阅 `world.afterEvents.entityHurt`，若 target 为玩家、damage cause 为 `projectile`（箭/弩）、副手为 shield\_of\_bange，则 `health.setCurrentValue(原血量)` 回血补偿（稳定 API 无 beforeEvents 可取消，用回血法；flag 限制）。

* victor\_trade.json 加 40 银币→shield\_of\_bange。

### A7. 纹理目录统一（按示例包规范）

当前 `RP/textures/` 子目录存在单复数紊乱，按原版示例包规范统一（`blocks`/`items` 复数，`entity` 单数）：

* `textures/block/` → `textures/blocks/`：移动 `darkblue_ore.png`、`darkblue_block.png`、`deepslate_darkblue_ore.png`（3 文件）。无 JSON 引用 `textures/block/`（terrain\_texture.json 当前为空），移动后新注册用 `textures/blocks/...`。

* `textures/entities/` → `textures/entity/`：移动 `zombies/flesh_zombie.png` → `entity/zombies/flesh_zombie.png`（1 文件，当前无 JSON 引用，孤儿纹）。victor/ryaman 已在 `entity/`，无需动。

* 删除 copper\_spear 纹理（A4 跳过）：`textures/items/copper_spear.png`、`copper_spear_in_hand.png`。

* `items/`、`models/armor/`、`ui/`、`particles/` 已符合规范，不动。

* 校验：grep 全仓 `textures/block/` 与 `textures/entities/` 确认无残留引用；清理 `.bridge` 闪电缓存会自动重建。

***

## Part B：对比 0.0.16 找差异

1. PowerShell `Expand-Archive` 解压 `builds/Minesia 0.0.16.mcaddon` 到临时目录（如 `builds/_0.0.16_extract/`）。
2. 列差异：

   * 新增文件（BP/RP 自 0.0.16 后新增，如 scripts/hud\_bridge/、scripts/language.js、ui/minesia\_hud.json、color\_grading/、subpacks Desktop Better 等——对应现有 plan 已记的改动）。

   * 删除文件。

   * 修改文件（重点：trading/、items/、scripts/、texts/）。
3. 用差异清单**校验**更新日志是否遗漏或多余（净变原则：0.0.16→0.0.17 间发现并修复的同一版本 bug 不记）。

> 注：解压+对比在执行阶段做，此处仅列方法。对比结果用于 Part C 校验。

***

## Part C：重写 0.0.17 更新日志

[0.0.17.plan.md](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/changelogs/zh_CN/0.0.17.plan.md) 重写为：

* 日期改为 `2026.7.8`（北京时间） 。（意见：暂时不用改）

* **新增内容**：保留现有（属性面板设置页/语言模块/HUD 系统/HUD 桥接）；追加——新武器 proof\_of\_strength、god\_of\_leaves；深蓝套装（矿石/锭/剑/4 盔甲/4 工具/矛 + 套装加成）；班戈之盾饰品；HUD 模块描述按 memory 修订为 3 独立 data\_control（dataL/dataE/dataS）。

* **优化改进**：保留现有；追加——随机伤害只取整数；武器副手效果仅限副手；删除自定义 NPC 限购；武器匠降价并新增霜刃贸易；镰刀配方改形；10 把武器数值/事件调整；**统一纹理子目录命名以符合示例包规范（`block`→`blocks`、`entities`→`entity`）并清理无用 copper\_spear 纹理**。

* **修复**：保留现有；按 memory 修订 HUD 静态填充修复描述、套装体力加成覆盖修复、创造模式 actionbar 体力修复。

* 英文版 `changelogs/en_US/0.0.17.md` 同步（build 规范：发布时创建）。

* 严格用 Part B 差异校验，删去 plan 中与实际差异不符的条目。

***

## 验证

* 静态：检查 JSON 语法、lang 键无重复、item\_texture/blocks 引用存在。

* 脚本：`main.js` 加载新 effect 文件无报错；暴击系统扩展后旧武器暴击率不变。

* 游戏内（用户验证）：新武器/深蓝套装可合成与生效；班戈之盾弹射物免疫；武器匠/NFC 贸易价格与限购；HUD 与体力行为不回归。

* 0.0.16 对比清单与 changelog 一一对应。

## 待确认/风险

1. shield\_of\_bange 弹射物免疫用回血法（稳定 API 无 beforeEvents 可取消）；如版本支持 `world.beforeEvents.entityHurt` 可改取消。
2. god\_of\_leaves 配方树叶用 item tag。
3. darkblue\_spear 无法复刻原版长矛 jab/charge/reach（自定义物品限制）；铜矛直接用原版（1.21.130+）。
4. Part B 解压对比在执行阶段进行；如 mcaddon 内 BP/RP 与源码结构差异大，以源码为准。
5. darkblue 矿石双变体（石头/深板岩）生成 y 区间细节按原版铁/钻石矿规则类比，若需严格只生成 y=-50\~0 单变体可调整。

