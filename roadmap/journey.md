# Minesia: Journey 创世旅途 - 开发计划

> **项目名称**：创世：旅途（Minesia: Journey）  
> **版本日期**：2026.2.10  
> **项目类型**：Minecraft 基岩版地图（世界模板）+ 附加包（子包形式）  
> **游玩时长**：3-5 小时主线剧情

---

## 📖 世界观设定

### # 概念

《创世：旅途》（Minesia: Journey）是一款 Minecraft 基岩版的地图（世界模板），包含附加包，其内容基于作者对 Minecraft 原版进行的世界观和历史架空构建创作。

### # 主要剧情

《创世：旅途》讲述了一个实验工作者进行"世界实验"（The World Experiment）时由于失误导致误入一个被创造出来的世界，并在其中探险，想办法回到自己的世界中的故事。

#### 剧情背景

- **主角状态**：长期沉迷于实验室而导致精神层面出现问题，多次出现幻觉
- **事故起因**：由于操作不当，将实验样本破坏了
- **修复失败**：尝试修复时不但没有修复成功，反而不小心把实验室搞砸了
- **穿越结果**：昏迷之后再醒来却已经进入到了另一个世界

#### 剧情发展

1. **初遇居民**：主角遇到了几个当地居民
2. **了解世界**：居民告诉他们是通过传送门来到这个世界的，认为这个世界具有很多宝藏，并认为是造物主故意置于此
3. **激发好奇**：主角被激起了好奇心，尝试探索这个世界
4. **探索真相**：在探索过程中逐渐了解这个世界，并意识到世界的真相
5. **返回实验室**：最后通过不断的战斗，收集物品，查阅资料，让自己成功的回到了实验室

### # 游玩模式

- **目标时长**：主线游玩时长在 3 到 5 小时
- **游玩形式**：可重复探索的开放世界
- **游戏模式**：冒险模式
- **架构设计**：采用子包（Subpack）形式作为 Minesia Journey 的内容载体
  - **优势**：便于管理项目内容
  - **灵活性**：玩家可自由选择是否启用 Journey 内容
  - **生存兼容**：不开启子包时可作为纯生存存档使用

---

## 🎮 Journey 专属功能

### 1️⃣ 钩爪系统（Journey 核心移动工具）

#### 剧情定位

- 主角在探索过程中发现的神秘工具，似乎是"造物主"留下的遗迹物品
- 用于在复杂地形中快速移动，探索隐藏区域
- 是返回实验室的关键工具之一

#### 功能描述

可副手装备的工具，装备在副手时点击右键发射出一个实体以某个速度运动，当一段距离或者速度减为 0 之后停止在方块上时，尝试将玩家吸引过去。

> 💡 **技术实现**：通过 Script API 的物品使用事件监听和自定义实体实现
> 
> **核心方案**：
> 1. **副手检测**：`player.getEquipmentSlot("offhand")`
> 2. **发射机制**：监听 `beforeEvents.itemUse` 事件
> 3. **钩爪实体**：自定义投射物实体（类似三叉戟）
> 4. **运动控制**：`entity.setVelocity()` + `system.runInterval` 追踪
> 5. **碰撞检测**：射线检测或实体碰撞事件
> 6. **牵引机制**：`player.setVelocity()` 拉向钩爪位置
> 7. **回收机制**：牵引完成后销毁实体或 Shift 回收

#### Journey 特色

- ✅ **剧情融合**：钩爪作为剧情道具，在特定章节解锁
- ✅ **升级系统**：可升级钩爪（增加射程、牵引速度、回收速度）
- ✅ **视觉特效**：钩爪实体使用自定义纹理，带有"实验科技"风格
- ✅ **音效设计**：发射、命中、牵引都有独特音效，增强沉浸感

#### 开发优先级
⭐⭐⭐⭐⭐（Journey 核心功能）

---

### 2️⃣ 环境氛围系统（Journey 叙事工具）

#### 剧情定位

- 用于渲染"被创造出来的世界"的异常感
- 通过旋转、偏移的方块营造"实验失败后的混乱"氛围
- 在废墟、实验室遗迹等场景中大量使用

#### 功能描述

通过旋转和偏移方块，将它们放到更符合环境的地方，渲染氛围。例如：斜靠的铁门、倒下的栅栏、倾斜的梯子等。

> 💡 **技术实现**：两种方案
> 
> **方案 A：自定义方块 + Block States**（简单旋转）
> - 使用 `minecraft:placement_direction` trait
> - 通过 `minecraft:transformation` 组件旋转
> - 90 度倍数旋转
> 
> **方案 B：伪实体方块**（复杂旋转和偏移）
> - 创建不可见、无敌实体
> - 支持任意角度旋转
> - 支持任意位置偏移

#### Journey 特色

- ✅ **叙事性摆放**：每个旋转方块都有其"故事"（如斜靠的门暗示"有人匆忙逃离"）
- ✅ **实验室风格**：自定义实验室方块（实验台、仪器、管道）的旋转摆放
- ✅ **废墟场景**：大量使用斜靠、倒下的方块营造废墟感
- ✅ **传送门遗迹**：使用旋转方块构建"损坏的传送门"场景
- ✅ **Blockbench 工作流**：所有旋转方块通过 Blockbench 可视化制作

#### 应用场景

| 场景类型 | 氛围元素 |
|---------|---------|
| 🎯 **实验室废墟** | 散落的文件、倒下的仪器、破碎的玻璃 |
| 🎯 **传送门遗迹** | 损坏的传送门框架、偏移的基座 |
| 🎯 **居民营地** | 简陋的帐篷、斜靠的木牌、散落的篝火 |
| 🎯 **隐藏洞穴** | 崩塌的矿道、倾斜的支撑柱 |
| 🎯 **造物主遗迹** | 神秘的几何体、悬浮的方块、异常的排列 |

#### 开发优先级
⭐⭐⭐⭐⭐（Journey 核心叙事工具）

---

### 3️⃣ 粒子效果系统（Journey 视觉增强）

#### 剧情定位

- 增强场景氛围，提升沉浸感
- 表现"被创造世界"的异常物理现象
- 用于关键剧情场景的视觉强化

#### 功能需求：纸屑和纸团满天飞效果

在大街上实现纸屑、纸团、报纸满天飞的效果，营造"实验失败后世界混乱"或"废弃城市"的氛围。

> 💡 **技术实现分析**：
> 
> **方案 A：粒子系统（推荐用于远景和大量效果）**
> 
> **核心实现**：
> 1. **自定义粒子**：创建纸屑形状的粒子纹理
> 2. **粒子发射器**：使用 Script API 的 `spawnParticle()` 方法
> 3. **风力模拟**：通过 Molang 或脚本控制粒子运动方向
> 4. **随机性**：添加随机偏移和旋转，增强自然感
> 
> **示例代码**：
> ```javascript
> // 在指定位置生成纸屑粒子
> import { world } from "@minecraft/server";
> 
> function spawnPaperDebris(location, dimension) {
>   dimension.spawnParticle("minesia:paper_debris", location);
> }
> 
> // 粒子文件 (particles/paper_debris.json)
> {
>   "format_version": "1.10.0",
>   "particle_effect": {
>     "description": {
>       "identifier": "minesia:paper_debris",
>       "basic_render_parameters": {
>         "material": "particles_alpha",
>         "texture": "textures/particles/paper_debris"
>       }
>     },
>     "components": {
>       "minecraft:emitter_rate_instant": {
>         "num_particles": 10
>       },
>       "minecraft:emitter_lifetime_once": {
>         "active_time": 1
>       },
>       "minecraft:particle_lifetime_expression": {
>         "max_lifetime": "Math.random(2, 5)"
>       },
>       "minecraft:particle_initial_speed": "Math.random(0.5, 2)",
>       "minecraft:particle_motion_dynamic": {
>         "linear_acceleration": [0, -0.5, 0], // 重力
>         "linear_drag_coefficient": 0.1 // 空气阻力
>       },
>       "minecraft:particle_appearance_billboard": {
>         "size": ["Math.random(0.2, 0.5)", "Math.random(0.2, 0.5)"],
>         "facing_camera_mode": "rotate_xyz",
>         "uv": {
>           "texture_width": 16,
>           "texture_height": 16,
>           "flipbook": {
>             "base_UV": [0, 0],
>             "size": [16, 16],
>             "step": {
>               "interval": 0.1
>             }
>           }
>         }
>       }
>     }
>   }
> }
> ```
> 
> **优点**：
> - ✅ 性能优秀，可生成大量粒子
> - ✅ 支持自定义纹理和动画
> - ✅ 内置物理模拟（重力、阻力）
> - ✅ 易于控制（数量、方向、速度）
> 
> **缺点**：
> - ⚠️ 粒子无法与方块碰撞（会穿透）
> - ⚠️ 生命周期较短（通常几秒）
> - ⚠️ 无法被玩家交互
> 
> ---
> 
> **方案 B：微型实体（推荐用于近景和交互需求）**
> 
> **核心实现**：
> 1. **创建纸屑实体**：使用超小碰撞箱的实体
> 2. **物理模拟**：添加重力、风力效果
> 3. **碰撞检测**：实体可与方块碰撞并滚动
> 4. **回收机制**：超出范围自动销毁
> 
> **示例代码**：
> ```json
> // BP/entities/minesia:paper_debris_entity.json
> {
>   "minecraft:entity": {
>     "description": {
>       "identifier": "minesia:paper_debris_entity",
>       "is_spawnable": false,
>       "is_summonable": true
>     },
>     "components": {
>       "minecraft:collision_box": {
>         "width": 0.1,
>         "height": 0.05
>       },
>       "minecraft:physics": {
>         "has_gravity": true,
>         "has_collision": true
>       },
>       "minecraft:movement": {
>         "value": 0.01
>       },
>       "minecraft:damage_sensor": {
>         "triggers": [{ "cause": "all", "deals_damage": "no" }]
>       },
>       "minecraft:despawn": {
>         "despawn_from_distance": 32
>       }
>     }
>   }
> }
> ```
> 
> ```javascript
> // 生成带风力的纸屑实体
> function spawnWindBlownPaper(location, dimension, windDirection) {
>   const entity = dimension.spawnEntity("minesia:paper_debris_entity", location);
>   
>   // 施加风力
>   const windVelocity = {
>     x: windDirection.x * Math.random(1, 3),
>     y: Math.random(0.5, 1.5),
>     z: windDirection.z * Math.random(1, 3)
>   };
>   entity.setVelocity(windVelocity);
> }
> ```
> 
> **优点**：
> - ✅ 可与方块碰撞并滚动
> - ✅ 可被玩家踢、推动
> - ✅ 生命周期长（可永久存在）
> - ✅ 更真实的物理效果
> 
> **缺点**：
> - ⚠️ 性能开销比粒子大
> - ⚠️ 需要手动管理实体数量
> - ⚠️ 需要同步客户端
> 
> ---
> 
> **方案 C：混合方案（最佳效果）**
> 
> **核心思路**：
> - **远景**：使用粒子系统（性能优秀）
> - **近景**：使用微型实体（真实物理）
> - **动态切换**：根据玩家距离自动切换
> 
> **实现逻辑**：
> ```javascript
> // 根据距离决定使用粒子还是实体
> function spawnDebrisByDistance(playerLocation, debrisLocation, dimension) {
>   const distance = Math.sqrt(
>     Math.pow(playerLocation.x - debrisLocation.x, 2) +
>     Math.pow(playerLocation.y - debrisLocation.y, 2) +
>     Math.pow(playerLocation.z - debrisLocation.z, 2)
>   );
>   
>   if (distance < 16) {
>     // 近景：使用实体
>     spawnWindBlownPaper(debrisLocation, dimension, windDirection);
>   } else {
>     // 远景：使用粒子
>     dimension.spawnParticle("minesia:paper_debris", debrisLocation);
>   }
> }
> ```
> 
> **优点**：
> - ✅ 兼顾性能和效果
> - ✅ 近景真实，远景高效
> - ✅ 玩家几乎察觉不到切换

#### 技术要点

- ✅ **粒子系统**：基岩版原生支持，性能优秀
- ✅ **自定义粒子**：可定义纹理、大小、速度、生命周期
- ✅ **风力模拟**：通过加速度和阻力系数实现
- ✅ **实体生成**：Script API 完全支持
- ✅ **物理模拟**：实体支持重力、碰撞
- ⚠️ **性能优化**：需要限制同时存在的粒子/实体数量
- ⚠️ **风力系统**：需要自定义全局或区域风力变量

#### 应用场景

| 场景 | 效果描述 | 推荐方案 |
|------|---------|---------|
| 🎯 **废弃大街** | 纸屑、报纸随风滚动 | 混合方案 |
| 🎯 **实验室走廊** | 文件纸张飘落 | 粒子系统 |
| 🎯 **废墟广场** | 纸团堆积，偶尔被风吹起 | 实体 + 粒子 |
| 🎯 **风暴场景** | 大量碎片满天飞 | 粒子系统（大量） |
| 🎯 **安静室内** | 少量纸屑缓慢飘落 | 粒子系统（少量） |

#### 开发建议

1. **先实现粒子系统**：快速验证效果，性能优秀
2. **再添加实体系统**：用于近景和交互需求
3. **最后实现混合方案**：根据距离动态切换
4. **添加配置选项**：允许玩家调整粒子密度（性能考虑）
5. **创建预设库**：不同场景的粒子/实体配置预设

#### 开发优先级
⭐⭐⭐⭐（Journey 重要视觉增强）

---

### 4️⃣ 触发系统（Journey 核心叙事引擎）

#### 剧情定位

- 实现动态剧情触发，根据玩家行为和状态推进故事
- 增强沉浸感，让玩家感觉世界在"回应"自己的行动
- 支持多周目游戏，不同条件触发不同内容

#### 功能需求

**系统 1：区域进入触发**（NPC 吸引目光）
- 当玩家踏入特定区域时，在某个位置播放音频和动画
- 用于 NPC 吸引玩家目光，引导探索方向

**系统 2：区域进入触发**（剧情触发）
- 当玩家踏入特定区域时，触发动画和音频
- 用于触发关键剧情，推进故事发展

**系统 3：视线检测触发**（打量触发）
- 当玩家盯着看（打量）方块、实体或某个方向/区域时，触发动画或音频
- 用于触发特定对话、线索提示、隐藏内容

> 💡 **技术实现分析**：
> 
> ---
> 
> ### **系统 1 & 2：区域进入触发系统**
> 
> **核心实现方案**：
> 
> **方案 A：Script API + 定时检测（推荐）**
> 
> ```javascript
> // scripts/trigger_system.js
> import { system, world } from "@minecraft/server";
> 
> // 区域触发配置
> const triggerZones = [
>   {
>     id: "npc_greeting_zone",
>     center: { x: 100, y: 64, z: 100 },
>     radius: 5,
>     conditions: {
>       chapter: 1,           // 章节条件
>       minLevel: 0,          // 创世等级条件
>       minStamina: 10,       // 体力值条件
>       scoreboard: {         // 计分板条件
>         objective: "quest_progress",
>         minValue: 0
>       }
>     },
>     actions: {
>       playSound: "minesia:npc_greeting",
>       soundLocation: { x: 100, y: 64, z: 105 },
>       playAnimation: "npc_wave",
>       targetEntity: "minesia:npc_researcher",
>       sendMessage: "§e研究员向你挥手致意..."
>     },
>     cooldown: 3000,  // 冷却时间（毫秒）
>     once: false      // 是否只触发一次
>   }
> ];
> 
> // 玩家冷却记录
> const playerCooldowns = new Map();
> 
> // 检测玩家是否在区域内
> function isPlayerInZone(playerLocation, zone) {
>   const distance = Math.sqrt(
>     Math.pow(playerLocation.x - zone.center.x, 2) +
>     Math.pow(playerLocation.y - zone.center.y, 2) +
>     Math.pow(playerLocation.z - zone.center.z, 2)
>   );
>   return distance <= zone.radius;
> }
> 
> // 检测条件是否满足
> function checkConditions(player, conditions) {
>   // 章节检测（通过动态属性）
>   if (conditions.chapter !== undefined) {
>     const currentChapter = player.getDynamicProperty("journey_chapter") || 1;
>     if (currentChapter !== conditions.chapter) return false;
>   }
>   
>   // 创世等级检测
>   if (conditions.minLevel !== undefined) {
>     const level = player.getDynamicProperty("creation_level") || 0;
>     if (level < conditions.minLevel) return false;
>   }
>   
>   // 体力值检测
>   if (conditions.minStamina !== undefined) {
>     const stamina = player.getDynamicProperty("stamina_current") || 100;
>     if (stamina < conditions.minStamina) return false;
>   }
>   
>   // 计分板检测
>   if (conditions.scoreboard) {
>     const objective = world.scoreboard.getObjective(conditions.scoreboard.objective);
>     if (!objective) return false;
>     const score = objective.getScore(player);
>     if (score < conditions.scoreboard.minValue) return false;
>   }
>   
>   return true;
> }
> 
> // 执行触发动作
> function executeActions(player, actions) {
>   // 播放音效
>   if (actions.playSound && actions.soundLocation) {
>     player.dimension.playSound(actions.playSound, actions.soundLocation);
>   }
>   
>   // 播放实体动画
>   if (actions.playAnimation && actions.targetEntity) {
>     const entities = player.dimension.getEntities({
>       type: actions.targetEntity,
>       location: player.location,
>       maxDistance: 20
>     });
>     entities.forEach(entity => {
>       entity.runCommand(`playanimation @s ${actions.playAnimation}`);
>     });
>   }
>   
>   // 播放方块动画（通过命令）
>   if (actions.playBlockAnimation) {
>     player.runCommand(`playanimation @e[type=armor_stand,c=1] ${actions.playBlockAnimation}`);
>   }
>   
>   // 发送消息
>   if (actions.sendMessage) {
>     player.sendMessage(actions.sendMessage);
>   }
>   
>   // 触发命令
>   if (actions.commands) {
>     actions.commands.forEach(cmd => {
>       player.runCommand(cmd);
>     });
>   }
> }
> 
> // 主循环检测
> system.runInterval(() => {
>   for (const player of world.getAllPlayers()) {
>     for (const zone of triggerZones) {
>       // 检测玩家是否在区域内
>       if (!isPlayerInZone(player.location, zone)) continue;
>       
>       // 检测冷却时间
>       const cooldownKey = `${player.id}_${zone.id}`;
>       const lastTrigger = playerCooldowns.get(cooldownKey) || 0;
>       if (Date.now() - lastTrigger < zone.cooldown) continue;
>       
>       // 检测条件
>       if (!checkConditions(player, zone.conditions)) continue;
>       
>       // 执行动作
>       executeActions(player, zone.actions);
>       
>       // 记录冷却
>       playerCooldowns.set(cooldownKey, Date.now());
>       
>       // 如果只触发一次，标记为已完成
>       if (zone.once) {
>         player.setDynamicProperty(`trigger_${zone.id}`, true);
>       }
>     }
>   }
> }, 20); // 每 20 tick（1 秒）检测一次
> ```
> 
> **方案 B：命令方块 + 计分板（经典方案）**
> 
> ```mcfunction
> # 检测玩家是否在区域内
> execute as @a at @s if entity @s[x=100,y=64,z=100,dx=10,dy=10,dz=10] run scoreboard players set @s in_zone 1
> execute as @a at @s unless entity @s[x=100,y=64,z=100,dx=10,dy=10,dz=10] run scoreboard players set @s in_zone 0
> 
> # 检测条件（章节、等级等）
> execute as @a[scores={in_zone=1,chapter=1,creation_level=5..}] at @s run function minesia:trigger_npc_greeting
> 
> # 触发函数
> # functions/trigger_npc_greeting.mcfunction
> playsound minesia:npc_greeting @a 100 64 105
> execute at @e[type=minesia:npc_researcher,c=1] run playanimation @s npc_wave
> tellraw @a {"rawtext":[{"text":"§e研究员向你挥手致意..."}]}
> ```
> 
> **优点**：
> - ✅ 灵活的条件系统（支持动态属性、计分板、玩家状态）
> - ✅ 可配置冷却时间，避免重复触发
> - ✅ 支持一次性触发（剧情关键点）
> - ✅ 可播放音效、实体动画、方块动画
> - ✅ 支持多玩家独立触发
> 
> **缺点**：
> - ⚠️ 需要定时检测（性能开销）
> - ⚠️ 复杂条件需要额外逻辑
> 
> ---
> 
> ### **系统 3：视线检测触发系统**
> 
> **核心实现方案**：
> 
> **方案 A：射线检测（推荐用于方块/实体）**
> 
> ```javascript
> // scripts/gaze_detection.js
> import { system, world } from "@minecraft/server";
> 
> // 视线检测配置
> const gazeTargets = [
>   {
>     id: "mysterious_note",
>     type: "block",  // 或 "entity" 或 "direction"
>     location: { x: 150, y: 70, z: 150 },
>     radius: 3,      // 检测半径
>     gazeTime: 2000, // 需要注视的时间（毫秒）
>     conditions: {
>       chapter: 2,
>       hasItem: "minesia:magnifying_glass"  // 可选：需要特定物品
>     },
>     actions: {
>       playSound: "minesia:whisper",
>       sendMessage: "§7你注意到纸上隐约写着什么...",
>       triggerEvent: "note_revealed"
>     }
>   },
>   {
>     id: "npc_eye_contact",
>     type: "entity",
>     entityType: "minesia:npc_researcher",
>     gazeTime: 1500,
>     conditions: {
>       chapter: 1
>     },
>     actions: {
>       playAnimation: "npc_look_back",
>       sendMessage: "§e研究员似乎注意到了你的目光...",
>       startDialog: "researcher_intro"
>     }
>   },
>   {
>     id: "hidden_door",
>     type: "direction",
>     direction: { x: 1, y: 0, z: 0 },  // 玩家需要看向的方向向量
>     tolerance: 15,  // 角度容差（度）
>     gazeTime: 3000,
>     conditions: {
>       chapter: 3,
>       minLevel: 10
>     },
>     actions: {
>       playSound: "minesia:secret_reveal",
>       setBlock: { location: { x: 200, y: 65, z: 200 }, block: "minecraft:air" },
>       sendMessage: "§a墙壁似乎有机关..."
>     }
>   }
> ];
> 
> // 玩家注视时间记录
> const playerGazeTime = new Map();
> 
> // 获取玩家视线方向向量
> function getPlayerViewDirection(player) {
>   const rotation = player.getRotation();
>   const yaw = rotation.y * (Math.PI / 180);
>   const pitch = rotation.x * (Math.PI / 180);
>   
>   return {
>     x: -Math.sin(yaw) * Math.cos(pitch),
>     y: -Math.sin(pitch),
>     z: Math.cos(yaw) * Math.cos(pitch)
>   };
> }
> 
> // 射线检测（检测玩家是否在看方块/实体）
> function raycastFromPlayer(player, maxDistance = 10) {
>   const viewDir = getPlayerViewDirection(player);
>   const startLoc = player.location;
>   
>   // 从玩家位置发射射线
>   for (let i = 0; i < maxDistance; i += 0.5) {
>     const checkLoc = {
>       x: startLoc.x + viewDir.x * i,
>       y: startLoc.y + viewDir.y * i + 1.62, // 眼睛高度
>       z: startLoc.z + viewDir.z * i
>     };
>     
>     // 检测方块
>     const block = player.dimension.getBlock(checkLoc);
>     if (block && block.typeId !== "minecraft:air") {
>       return { type: "block", location: checkLoc, block: block };
>     }
>     
>     // 检测实体
>     const entities = player.dimension.getEntities({
>       location: checkLoc,
>       maxDistance: 1
>     });
>     if (entities.length > 0) {
>       return { type: "entity", entity: entities[0], location: checkLoc };
>     }
>   }
>   
>   return null;
> }
> 
> // 检测玩家是否在看目标
> function isPlayerLookingAt(player, target) {
>   if (target.type === "block" || target.type === "entity") {
>     const raycastResult = raycastFromPlayer(player);
>     if (!raycastResult) return false;
>     
>     if (target.type === "block") {
>       // 检测方块位置是否匹配
>       const distance = Math.sqrt(
>         Math.pow(raycastResult.location.x - target.location.x, 2) +
>         Math.pow(raycastResult.location.y - target.location.y, 2) +
>         Math.pow(raycastResult.location.z - target.location.z, 2)
>       );
>       return distance <= target.radius;
>     } else if (target.type === "entity") {
>       // 检测实体类型是否匹配
>       return raycastResult.entity && 
>              raycastResult.entity.typeId === target.entityType;
>     }
>   } else if (target.type === "direction") {
>     // 检测玩家视线方向是否匹配
>     const viewDir = getPlayerViewDirection(player);
>     const targetDir = target.direction;
>     
>     // 计算点积（判断方向相似度）
>     const dotProduct = viewDir.x * targetDir.x + 
>                        viewDir.y * targetDir.y + 
>                        viewDir.z * targetDir.z;
>     
>     // 转换为角度
>     const angle = Math.acos(dotProduct) * (180 / Math.PI);
>     return angle <= target.tolerance;
>   }
>   
>   return false;
> }
> 
> // 主循环检测
> system.runInterval(() => {
>   for (const player of world.getAllPlayers()) {
>     for (const target of gazeTargets) {
>       // 检测条件
>       if (!checkConditions(player, target.conditions)) continue;
>       
>       // 检测玩家是否在看目标
>       const isLooking = isPlayerLookingAt(player, target);
>       const gazeKey = `${player.id}_${target.id}`;
>       
>       if (isLooking) {
>         // 增加注视时间
>         const currentTime = playerGazeTime.get(gazeKey) || 0;
>         playerGazeTime.set(gazeKey, currentTime + 50); // 50ms per tick
>         
>         // 检测是否达到触发时间
>         if (currentTime >= target.gazeTime) {
>           executeActions(player, target.actions);
>           playerGazeTime.delete(gazeKey); // 重置
>           
>           // 标记为已完成（一次性触发）
>           if (target.once) {
>             player.setDynamicProperty(`gaze_${target.id}`, true);
>           }
>         }
>       } else {
>         // 重置注视时间
>         playerGazeTime.delete(gazeKey);
>       }
>     }
>   }
> }, 1); // 每 tick 检测一次（精确计时）
> ```
> 
> **方案 B：简化版（仅检测玩家朝向）**
> 
> ```javascript
> // 仅检测玩家旋转角度，不使用射线检测
> function isPlayerLookingAtDirection(player, targetDirection, tolerance = 15) {
>   const rotation = player.getRotation();
>   
>   // 计算目标方向的 yaw 和 pitch
>   const targetYaw = Math.atan2(-targetDirection.x, targetDirection.z) * (180 / Math.PI);
>   const targetPitch = Math.asin(-targetDirection.y) * (180 / Math.PI);
>   
>   // 检测角度差
>   const yawDiff = Math.abs(rotation.y - targetYaw);
>   const pitchDiff = Math.abs(rotation.x - targetPitch);
>   
>   return yawDiff <= tolerance && pitchDiff <= tolerance;
> }
> ```
> 
> **优点**：
> - ✅ 精确的视线检测（射线检测）
> - ✅ 支持方块、实体、方向三种目标类型
> - ✅ 可配置注视时间（避免误触）
> - ✅ 支持复杂条件（章节、等级、物品等）
> - ✅ 沉浸式交互（玩家主动探索）
> 
> **缺点**：
> - ⚠️ 射线检测性能开销较大（需要优化检测频率）
> - ⚠️ 需要精确配置目标位置/方向
> - ⚠️ 多人游戏需要独立追踪每个玩家
> 
> ---
> 
> ### **条件系统详解**
> 
> **支持的动态数据条件**：
> 
> ```javascript
> const conditions = {
>   // 章节条件
>   chapter: 2,                    // 当前章节必须为 2
>   chapterRange: [1, 3],          // 章节在 1-3 之间
>   
>   // 创世等级条件
>   minLevel: 5,                   // 最小等级
>   maxLevel: 10,                  // 最大等级
>   
>   // 体力值条件
>   minStamina: 20,                // 最小体力值
>   maxStamina: 80,                // 最大体力值
>   
>   // 魔法值条件
>   minMana: 50,                   // 最小魔法值
>   
>   // 护盾值条件
>   minShield: 30,                 // 最小护盾值
>   
>   // 计分板条件
>   scoreboard: {
>     objective: "quest_progress",
>     minValue: 10,
>     maxValue: 50
>   },
>   
>   // 物品条件
>   hasItem: "minesia:magnifying_glass",        // 必须持有特定物品
>   hasItemInHand: "minesia:telescope",         // 必须手持特定物品
>   
>   // 动态属性条件
>   dynamicProperty: {
>     key: "trigger_note_revealed",
>     value: false                 // 必须未触发过
>   },
>   
>   // 时间条件
>   timeOfDay: { min: 0, max: 12000 },          // 白天（0-12000 ticks）
>   weather: "clear",                           // 天气必须为晴天
>   
>   // 位置条件
>   dimension: "minecraft:overworld",           // 必须在主世界
>   minDistance: 10,                            // 最小距离
>   maxDistance: 100                            // 最大距离
> };
> ```
> 
> ---
> 
> ### **动画系统支持**
> 
> **实体动画**：
> ```javascript
> // 播放实体动画
> entity.runCommand(`playanimation @s animation.npc_wave`);
> 
> // 或使用 Script API
> entity.playAnimation("animation.npc_wave");
> ```
> 
> **方块动画**（通过盔甲架实体模拟）：
> ```javascript
> // 创建盔甲架作为方块动画载体
> const armorStand = dimension.spawnEntity("minecraft:armor_stand", location);
> armorStand.runCommand(`playanimation @s animation.block_rotate`);
> ```
> 
> **粒子动画**：
> ```javascript
> // 播放粒子效果
> dimension.spawnParticle("minesia:sparkle", location);
> ```
> 
> **音效播放**：
> ```javascript
> // 播放音效
> dimension.playSound("minesia:magic_chime", location);
> 
> // 或对玩家播放
> player.playSound("minesia:whisper");
> ```

#### 技术要点

- ✅ **区域检测**：通过距离计算或坐标范围检测
- ✅ **视线检测**：射线检测或旋转角度检测
- ✅ **条件系统**：支持动态属性、计分板、玩家状态
- ✅ **冷却机制**：避免重复触发
- ✅ **动画支持**：实体动画、方块动画、粒子效果
- ✅ **音效支持**：位置音效、玩家音效
- ⚠️ **性能优化**：合理控制检测频率
- ⚠️ **多人同步**：每个玩家独立追踪状态

#### 应用场景

| 触发类型 | 场景示例 | 推荐方案 |
|---------|---------|---------|
| 🎯 **区域进入** | NPC 主动打招呼 | Script API 定时检测 |
| 🎯 **区域进入** | 触发剧情动画 | Script API 或命令方块 |
| 🎯 **视线检测** | 打量神秘物品触发线索 | 射线检测 |
| 🎯 **视线检测** | 与 NPC 对视触发对话 | 射线检测 |
| 🎯 **视线检测** | 看向特定方向发现隐藏门 | 方向检测 |
| 🎯 **条件触发** | 特定章节/等级解锁内容 | 条件系统 |

#### 开发建议

1. **优先使用 Script API**：灵活性和可维护性更好
2. **合理设置检测频率**：区域检测 1 秒/次，视线检测 1 tick/次
3. **使用配置文件**：将触发器配置存储在 JSON 文件中
4. **添加调试模式**：开发时可显示触发区域边界
5. **性能优化**：限制同时检测的触发器数量

#### 开发优先级
⭐⭐⭐⭐⭐（Journey 核心叙事引擎）

#### 开发难度评估

**整体难度**：⭐⭐⭐⭐（中等偏高）

**分模块难度**：

| 模块 | 难度 | 开发时间 | 技术要求 | 风险评估 |
|------|------|---------|---------|---------|
| **区域检测系统** | ⭐⭐⭐ | 2-3 天 | Script API 基础 | 低 - 技术成熟 |
| **条件系统** | ⭐⭐⭐ | 2-3 天 | 动态属性、计分板 | 低 - 逻辑清晰 |
| **视线检测系统** | ⭐⭐⭐⭐⭐ | 4-5 天 | 射线检测、向量计算 | 中高 - 算法复杂 |
| **动画集成** | ⭐⭐⭐ | 1-2 天 | 实体动画、命令 | 低 - 有现成方案 |
| **音效集成** | ⭐⭐ | 1 天 | 音效播放 | 低 - 简单直接 |
| **配置系统** | ⭐⭐⭐ | 2 天 | JSON 配置、数据管理 | 低 - 常规功能 |
| **性能优化** | ⭐⭐⭐⭐ | 2-3 天 | 检测频率控制、缓存 | 中 - 需要测试 |
| **多人同步** | ⭐⭐⭐⭐ | 2-3 天 | 玩家状态管理 | 中 - 需要测试 |

**总开发时间**：约 14-21 天（2-3 周）

---

**技术难点分析**：

**难点 1：射线检测算法** ⭐⭐⭐⭐⭐
- **问题**：需要精确计算玩家视线方向，并检测是否命中目标
- **解决方案**：
  - 使用 `player.getRotation()` 获取玩家旋转角度
  - 转换为方向向量（涉及三角函数计算）
  - 从玩家位置发射射线，逐步检测碰撞
- **风险**：性能开销较大，需要优化检测频率
- **建议**：优先使用简化版（仅检测朝向），复杂场景再用射线检测

**难点 2：注视时间追踪** ⭐⭐⭐⭐
- **问题**：需要精确追踪玩家注视某个目标的时间
- **解决方案**：
  - 使用 Map 存储每个玩家的注视时间
  - 每 tick 更新注视时间（50ms）
  - 玩家移开视线时重置计时
- **风险**：多人游戏时 Map 数据量大，需要定期清理
- **建议**：限制同时追踪的目标数量

**难点 3：条件系统复杂度** ⭐⭐⭐
- **问题**：需要支持多种条件类型，且条件之间可能有依赖关系
- **解决方案**：
  - 设计灵活的条件配置结构
  - 使用函数式检测，每个条件独立判断
  - 支持条件组合（AND/OR 逻辑）
- **风险**：条件过多时性能下降
- **建议**：使用配置文件管理条件，便于维护

**难点 4：性能优化** ⭐⭐⭐⭐
- **问题**：定时检测会持续消耗性能
- **解决方案**：
  - 区域检测：1 秒/次（20 tick）
  - 视线检测：1 tick/次（但限制检测范围）
  - 使用空间分区（只检测玩家附近的触发器）
  - 缓存条件检测结果
- **风险**：检测频率过低会导致响应延迟
- **建议**：根据实际测试调整检测频率

**难点 5：多人游戏同步** ⭐⭐⭐⭐
- **问题**：每个玩家的触发状态需要独立管理
- **解决方案**：
  - 使用玩家 ID 作为 Map 的 key
  - 每个玩家独立的冷却时间、注视时间
  - 使用动态属性存储玩家特定的触发状态
- **风险**：玩家数量多时内存占用增加
- **建议**：定期清理离线玩家的数据

---

**开发建议**：

**阶段 1：基础实现**（1 周）
- [ ] 实现区域检测系统（距离计算）
- [ ] 实现基础条件系统（章节、等级）
- [ ] 实现音效和消息触发
- [ ] 测试单人游戏场景

**阶段 2：视线检测**（1 周）
- [ ] 实现玩家视线方向计算
- [ ] 实现简化版朝向检测
- [ ] 实现注视时间追踪
- [ ] 测试方块/实体检测

**阶段 3：高级功能**（3-5 天）
- [ ] 实现射线检测（可选）
- [ ] 扩展条件系统（计分板、物品等）
- [ ] 实现实体动画触发
- [ ] 添加配置文件支持

**阶段 4：优化和测试**（2-3 天）
- [ ] 性能优化（检测频率、缓存）
- [ ] 多人游戏测试
- [ ] 边界情况处理
- [ ] 文档编写

---

**风险缓解策略**：

1. **性能风险**：
   - 优先使用简化版方案（朝向检测代替射线检测）
   - 限制同时检测的触发器数量（建议 < 20 个）
   - 使用空间分区，只检测玩家附近的触发器

2. **复杂度风险**：
   - 使用配置文件管理触发器，避免硬编码
   - 提供可视化调试工具（显示触发区域边界）
   - 分阶段实现，先基础后高级

3. **兼容性风险**：
   - 测试不同版本的 Script API
   - 提供降级方案（命令方块作为备选）
   - 记录 API 版本要求

4. **维护风险**：
   - 编写详细的配置文档
   - 提供触发器模板和示例
   - 使用模块化设计，便于扩展

---

**技术要求**：

**必需技能**：
- ✅ JavaScript/TypeScript 基础
- ✅ Minecraft Script API 熟悉
- ✅ 向量数学基础（用于射线检测）
- ✅ JSON 配置管理

**推荐技能**：
- ⭐ 性能优化经验
- ⭐ 多人游戏开发经验
- ⭐ 调试工具开发经验

**学习曲线**：
- Script API 基础：1-2 天
- 射线检测算法：2-3 天
- 条件系统设计：1-2 天
- 性能优化：2-3 天

---

**与现有系统的集成难度**：

| 系统 | 集成难度 | 说明 |
|------|---------|------|
| **体力值系统** | ⭐⭐ | 通过动态属性读取体力值 |
| **魔法值系统** | ⭐⭐ | 通过动态属性读取魔法值 |
| **护盾系统** | ⭐⭐ | 通过动态属性读取护盾值 |
| **章节系统** | ⭐⭐ | 通过动态属性读取当前章节 |
| **创世等级** | ⭐⭐ | 通过动态属性读取等级 |
| **计分板系统** | ⭐⭐⭐ | 需要调用 world.scoreboard API |
| **NPC 系统** | ⭐⭐⭐ | 需要实体动画和对话系统集成 |
| **任务系统** | ⭐⭐⭐ | 需要双向通信（触发器 ↔ 任务系统） |

**集成建议**：
- 创建统一的"玩家数据管理器"，提供统一的数据访问接口
- 触发器系统只负责检测和触发，不直接修改玩家数据
- 使用事件系统解耦各个模块

---

## 📚 章节规划

### 📖 第一章：迷失（约 30-45 分钟）

**剧情**：主角从昏迷中醒来，发现自己身处陌生世界，遇到第一批居民

**核心玩法**：
- 基础移动和生存教学
- 与 NPC 对话，了解世界观
- 探索初始营地

**技术需求**：
- NPC 对话系统（可使用 vanilla NPC 或自定义 UI）
- 基础任务系统
- 环境氛围方块（营地场景）
- 粒子效果（营地篝火烟雾等）

---

### 📖 第二章：探索（约 60-90 分钟）

**剧情**：主角开始探索世界，发现钩爪工具，解锁移动能力

**核心玩法**：
- 解锁钩爪系统
- 探索多个区域（废墟、洞穴、森林）
- 收集资源和线索

**技术需求**：
- ✅ **钩爪系统实现**
- ✅ **环境氛围系统**（废墟场景）
- ✅ **粒子效果系统**（废墟灰尘、飘落物）
- 自定义结构生成
- 线索物品系统（日志、笔记）

---

### 📖 第三章：真相（约 60-90 分钟）

**剧情**：主角发现世界的真相，意识到这是"被创造出来的世界"

**核心玩法**：
- 探索实验室遗迹
- 解读实验日志
- 解锁更多钩爪升级

**技术需求**：
- ✅ **环境氛围系统**（实验室废墟场景）
- ✅ **粒子效果系统**（实验室火花、纸张飘落）
- 自定义生命属性系统（实验生物）
- Boss 战系统（守护者）
- 剧情动画（可使用命令方块 + 实体）

---

### 📖 第四章：归途（约 60-90 分钟）

**剧情**：主角修复传送门，尝试返回自己的世界

**核心玩法**：
- 收集传送门组件
- 防御敌人进攻
- 最终传送门激活

**技术需求**：
- ✅ **钩爪系统**（最终追逐战）
- ✅ **环境氛围系统**（传送门遗迹）
- ✅ **粒子效果系统**（传送门能量特效）
- 传送门机制
- 结局动画

---

## 🏗️ 技术架构

### 子包结构设计

```
Minesia_Journey/
├── manifest.json (子包清单)
├── blocks/ (自定义方块 - 环境氛围)
│   ├── rotated_gate.json
│   ├── leaning_ladder.json
│   └── ruin_block.json
├── entities/ (钩爪实体、NPC、Boss、纸屑实体)
│   ├── grappling_hook.json
│   ├── npc_researcher.json
│   ├── boss_guardian.json
│   └── paper_debris_entity.json
├── items/ (钩爪工具、线索物品)
│   ├── grappling_hook_item.json
│   ├── research_log.json
│   └── portal_fragment.json
├── particles/ (粒子效果)
│   ├── paper_debris.json
│   ├── lab_spark.json
│   └── portal_energy.json
├── scripts/ (Script API)
│   ├── grappling_hook.js (钩爪系统)
│   ├── custom_health.js (自定义生命)
│   ├── particle_system.js (粒子管理)
│   └── quest_system.js (任务系统)
└── models/ (Blockbench 模型)
    ├── blocks/ (旋转方块模型)
    └── entities/ (钩爪实体模型)
```

### 依赖关系

```json
{
  "module_dependencies": [
    {
      "module_name": "@minecraft/server",
      "version": "1.15.0"
    },
    {
      "module_name": "@minecraft/server-ui",
      "version": "1.2.0"
    }
  ],
  "min_engine_version": [1, 20, 20]
}
```

---

## 📅 开发时间表

### 阶段 1：框架搭建（2 周）

- [ ] 子包结构搭建
- [ ] Script API 环境配置
- [ ] 基础方块和物品定义
- [ ] 粒子系统测试

### 阶段 2：核心系统（3 周）

- [ ] ✅ **钩爪系统实现**（含升级系统）
- [ ] ✅ **环境氛围系统**（含 Blockbench 模型库）
- [ ] ✅ **粒子效果系统**（含纸屑效果）
- [ ] NPC 对话系统
- [ ] 任务系统框架

### 阶段 3：内容制作（4 周）

- [ ] 第一章：迷失（场景 + 剧情）
- [ ] 第二章：探索（废墟 + 钩爪教学）
- [ ] 第三章：真相（实验室 + Boss）
- [ ] 第四章：归途（传送门 + 结局）

### 阶段 4：优化测试（2 周）

- [ ] 性能优化
- [ ] Bug 修复
- [ ] 平衡性调整
- [ ] 测试游玩

**预计总开发时间**：11 周（约 3 个月）

---

## 🔗 Journey 与主线关系

```
Minesia 项目
├── 核心系统包（必选）
│   ├── 体力值系统
│   ├── 魔法值系统
│   ├── 护盾系统
│   ├── 饰品栏系统
│   └── 自定义生命属性系统
│
└── Minesia Journey 子包（可选）
    ├── 钩爪系统
    ├── 环境氛围系统
    ├── 粒子效果系统
    ├── 剧情系统
    └── 任务系统
```

### 设计理念

- ✅ **模块化**：Journey 作为可选子包，不影响核心系统
- ✅ **灵活性**：玩家可选择纯生存或剧情模式
- ✅ **可扩展**：未来可添加更多子包（如 Minesia Adventure、Minesia RPG）
- ✅ **技术复用**：Journey 使用核心系统的所有功能（体力、魔法、护盾等）

---

## 📊 功能优先级总结

| 功能 | 优先级 | 开发阶段 | 技术难度 |
|------|--------|---------|---------|
| 钩爪系统 | ⭐⭐⭐⭐⭐ | 阶段 2 | 中等 |
| 环境氛围系统 | ⭐⭐⭐⭐⭐ | 阶段 2 | 中等 |
| 粒子效果系统 | ⭐⭐⭐⭐ | 阶段 2 | 中等偏低 |
| NPC 对话系统 | ⭐⭐⭐⭐ | 阶段 2 | 中等偏低 |
| 任务系统 | ⭐⭐⭐⭐ | 阶段 2 | 中等 |
| 自定义生命属性 | ⭐⭐⭐ | 阶段 3 | 中等 |
| Boss 战系统 | ⭐⭐⭐ | 阶段 3 | 中等偏高 |
| 剧情动画 | ⭐⭐⭐ | 阶段 3 | 中等偏高 |

---

## 🔧 技术参考

- [Bedrock Wiki](https://wiki.bedrock.dev/) - 基岩版附加包开发文档
- [bedrock.dev](https://bedrock.dev/) - 基岩版官方文档
- [Microsoft Learn - Minecraft Creator](https://learn.microsoft.com/zh-cn/minecraft/creator/) - 微软官方创作者文档
- [Blockbench](https://www.blockbench.net/) - 3D 模型编辑器（环境氛围方块制作）

---

## 📝 更新日志

- **2026.2.10** - 创建 Minesia Journey 项目，定义世界观和剧情
- **2026.2.10** - 添加钩爪系统、环境氛围系统、粒子效果系统技术方案
- **2026.2.10** - 完成章节规划和开发时间表
