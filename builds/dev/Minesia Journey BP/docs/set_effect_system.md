# 套装效果系统

## 概述

套装效果系统（Set Effect System）是一个用于 Minecraft 基岩版的脚本系统，它实现了两种装备效果机制：

1. **单物品规则**：当玩家在指定槽位装备特定物品时触发效果
2. **套装规则**：当玩家同时装备指定的多件装备时触发套装效果

---

## 文件结构

```
BP/scripts/set_effect/
├── rules.js         # 规则配置文件（主要修改此文件）
├── equipment.js     # 装备槽位映射和工具函数
├── actions.js       # 动作执行器（效果、属性、状态等）
├── set_effects.js   # 套装效果处理逻辑
└── setEffectMain.js # 主循环和状态管理
```

---

## 如何添加新的规则

### 添加单物品规则

打开 `BP/scripts/set_effect/rules.js`，在 `ITEM_RULES` 数组中添加：

```javascript
export const ITEM_RULES = [
    // 已有规则...
    
    // 添加新的单物品规则
    {
        id: "minesia_journey:power_ring",  // 物品ID
        slots: ["mainhand"],                // 触发槽位
        actions: [
            { kind: "effect", type: "strength", amplifier: 1 },
            { kind: "attribute", type: "health", value: 4 }
        ]
    }
];
```

### 添加套装规则

在 `SET_RULES` 数组中添加：

```javascript
export const SET_RULES = [
    // 已有规则...
    
    // 添加新的套装规则
    {
        name: "steel_armor_set",
        required: {
            head: "minesia_journey:steel_helmet",
            chest: "minesia_journey:steel_chestplate",
            legs: "minesia_journey:steel_leggings",
            feet: "minesia_journey:steel_boots"
        },
        actions: [
            { kind: "effect", type: "resistance", amplifier: 1 },
            { kind: "attribute", type: "health", value: 10 },
            { kind: "state", key: "steel_set", value: true }
        ]
    }
];
```

---

## 槽位说明

系统支持以下装备槽位：

| 槽位名称 | 说明 |
|----------|------|
| `mainhand` | 主手 |
| `offhand` | 副手 |
| `head` | 头部（头盔） |
| `chest` | 胸部（胸甲） |
| `legs` | 腿部（护腿） |
| `feet` | 脚部（靴子） |

单物品规则可以指定多个槽位：

```javascript
{
    id: "minecraft:totem_of_undying",
    slots: ["mainhand", "offhand"],  // 主手或副手都可触发
    actions: [
        { kind: "effect", type: "resistance", amplifier: 0 }
    ]
}
```

---

## 动作类型

### 1. 效果（effect）

为玩家添加药水效果。

```javascript
{ kind: "effect", type: "strength", amplifier: 0, duration: 10 }
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 效果类型ID |
| `amplifier` | number | 是 | 效果等级（0为I级，1为II级...） |
| `duration` | number | 否 | 持续时间（游戏刻），默认10 |

**支持的效果类型**（系统控制的效果）：
- `strength` - 力量
- `health_boost` - 生命提升
- `resistance` - 抗性提升
- `speed` - 速度
- `jump_boost` - 跳跃提升
- `regeneration` - 生命恢复
- `fire_resistance` - 防火
- `absorption` - 伤害吸收

### 2. 属性（attribute）

为玩家添加属性加成。

```javascript
{ kind: "attribute", type: "health", value: 8 }
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 属性类型 |
| `value` | number | 是 | 加成数值 |

**支持的属性类型**：
- `health` - 生命值加成

### 3. 属性百分比（attribute_percent）

为玩家添加百分比属性加成。

```javascript
{ kind: "attribute_percent", type: "health", percent: 30 }
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 属性类型 |
| `percent` | number | 是 | 百分比加成 |

### 4. 状态（state）

为玩家添加或移除标签状态。

```javascript
{ kind: "state", key: "diamond_set", value: true }
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | 是 | 标签名称 |
| `value` | boolean | 是 | true=添加标签，false=移除标签 |

状态标签可用于：
- 其他系统检测玩家状态
- 命令方块检测（`@a[tag=diamond_set]`）
- 成就/进度触发条件

### 5. 命令（command）

执行 Minecraft 命令。

```javascript
{ kind: "command", command: "playsound random.levelup @s" }
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `command` | string | 是 | 要执行的命令（不含 `/`） |

---

## 完整示例

### 示例 1：紫水晶碎片主手增益

```javascript
{
    id: "minecraft:amethyst_shard",
    slots: ["mainhand"],
    actions: [
        { kind: "effect", type: "strength", amplifier: 0 },      // 力量 I
        { kind: "attribute", type: "health", value: 8 },        // +8 生命值
        { kind: "state", key: "amethyst_active", value: true }  // 添加状态标签
    ]
}
```

### 示例 2：盾牌副手套装

```javascript
{
    name: "shield_set",
    required: {
        offhand: "minecraft:shield"
    },
    actions: [
        { kind: "attribute", type: "health", value: 8 },
        { kind: "state", key: "shield_set", value: true }
    ]
}
```

### 示例 3：钻石全套

```javascript
{
    name: "diamond_full_set",
    required: {
        head: "minecraft:diamond_helmet",
        chest: "minecraft:diamond_chestplate",
        legs: "minecraft:diamond_leggings",
        feet: "minecraft:diamond_boots"
    },
    actions: [
        { kind: "effect", type: "resistance", amplifier: 1 },   // 抗性提升 II
        { kind: "attribute", type: "health", value: 8 },
        { kind: "state", key: "diamond_set", value: true }
    ]
}
```

### 示例 4：混合套装（部分槽位）

```javascript
{
    name: "ninja_set",
    required: {
        head: "minecraft:leather_helmet",
        feet: "minecraft:leather_boots"
        // 只需要头和脚，不要求胸和腿
    },
    actions: [
        { kind: "effect", type: "speed", amplifier: 1 },
        { kind: "effect", type: "jump_boost", amplifier: 1 }
    ]
}
```

---

## 工作原理

### 主循环

系统每 3 游戏刻检查一次所有在线玩家的装备状态：

1. 获取玩家当前装备状态
2. 与上次记录的状态比较，检测变化
3. 如果装备有变化：
   - 清除所有系统控制的状态和效果
   - 重新计算创世等级生命加成
   - 处理单物品规则
   - 处理套装规则
   - 更新玩家属性效果

### 状态清理

每次装备变化时，系统会自动清理：

- **效果**：所有系统控制的效果会在下次检查时重新应用
- **标签**：`CONTROLLED_TAGS` 中定义的标签会被移除
- **属性**：属性加成会重新计算

### 与创世等级系统的集成

套装效果系统会自动调用创世等级系统计算玩家的等级生命加成：

```javascript
const totalExp = MinesiaLevelSystem.getTotalExperience(player);
const currentLevel = MinesiaLevelSystem.calculateLevel(totalExp);
const levelHealthBonus = MinesiaLevelEventSystem.calculateLevelHealthBonus(currentLevel);
actionsModule.applyLevelHealthBonus(player, levelHealthBonus);
```

---

## 辅助函数

### `collectEquipment(player)`

收集玩家所有装备槽位的物品信息。

```javascript
import { collectEquipment } from "./set_effect/equipment.js";

const equipment = collectEquipment(player);
// 返回: { mainhand: "minecraft:diamond_sword", head: "minecraft:diamond_helmet", ... }
```

### `hasEquippedItem(player, itemId, slotNames)`

检查玩家是否装备了指定物品。

```javascript
import { hasEquippedItem } from "./set_effect/equipment.js";

// 检查任意槽位
const hasDiamond = hasEquippedItem(player, "minecraft:diamond");

// 检查特定槽位
const hasMainhand = hasEquippedItem(player, "minecraft:diamond_sword", ["mainhand"]);
```

---

## 注意事项

1. **效果持续时间**：药水效果默认持续 10 游戏刻（0.5秒），系统会持续刷新
2. **属性累积**：多个规则的生命值加成会累加，然后转换为生命提升效果等级
3. **状态标签**：添加新状态标签时，记得在 `actions.js` 的 `CONTROLLED_TAGS` 数组中添加，以便自动清理
4. **性能优化**：系统使用冷却机制，每 3 刻才处理一次同一玩家

---

## 与自定义药水效果/事件的集成

### 设计理念

套装效果系统采用**反向依赖**的设计模式：

```
┌─────────────────────────────────────────────────────────────┐
│                    套装效果系统                               │
│  角色：触发器提供者 (Trigger Provider)                        │
│  职责：检测装备状态 → 添加/移除状态标签                         │
│  特点：保持纯净，不关心标签被谁使用                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 状态标签（适配协议）
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              自定义效果/事件系统                               │
│  角色：监听者 (Listener)                                      │
│  职责：监听标签 → 执行自定义逻辑                               │
│  特点：主动适配套装系统，不污染核心代码                          │
└─────────────────────────────────────────────────────────────┘
```

**核心理念**：
- 套装系统**仅提供便捷的触发方式**（装备检测 → 标签添加）
- 自定义效果系统**主动适配套装系统**（监听标签 → 执行逻辑）
- 两者**独立开发、独立维护**，通过标签协议解耦

### 标签协议

状态标签是套装系统与自定义效果系统之间的**适配协议**：

| 协议元素 | 说明 |
|----------|------|
| 标签格式 | `{物品或效果名}_active` 或 `{套装名}_set` |
| 标签生命周期 | 由套装系统管理（装备时添加，卸下时移除） |
| 使用方式 | 自定义效果系统通过 `player.hasTag()` 检测 |

### 集成步骤

#### 步骤 1：套装系统定义触发规则

在套装系统中，只需定义状态标签作为触发器：

```javascript
// rules.js
export const ITEM_RULES = [
    {
        id: "minesia_journey:spider_ball",
        slots: ["mainhand"],
        actions: [
            { kind: "state", key: "spider_ball_active", value: true }
        ]
    },
    {
        id: "minesia_journey:death_scythe",
        slots: ["mainhand"],
        actions: [
            { kind: "state", key: "death_scythe_active", value: true }
        ]
    }
];
```

#### 步骤 2：注册受控标签

```javascript
// actions.js
export const CONTROLLED_TAGS = [
    "diamond_set",
    "shield_set",
    "spider_ball_active",
    "death_scythe_active",
];
```

#### 步骤 3：自定义效果系统主动适配

自定义效果系统监听标签并执行逻辑：

```javascript
// BP/scripts/custom_effects/effectRegistry.js
export const CUSTOM_EFFECTS = {
    spider_ball_active: {
        name: "蜘蛛网生成",
        interval: 40,
        onTick: (player) => {
            const loc = player.location;
            const block = player.dimension.getBlock({
                x: Math.floor(loc.x),
                y: Math.floor(loc.y),
                z: Math.floor(loc.z)
            });
            if (block && block.typeId === "minecraft:air") {
                block.setType("minecraft:web");
            }
        }
    },
    death_scythe_active: {
        name: "濒死",
        interval: 40,
        onTick: (player) => {
            player.applyDamage(1);
        }
    }
};
```

```javascript
// BP/scripts/custom_effects/effectProcessor.js
import { system } from "@minecraft/server";
import { CUSTOM_EFFECTS } from "./effectRegistry.js";

const playerLastTick = new Map();

export function processCustomEffects(player) {
    const currentTime = system.currentTick;
    const playerId = player.id;
    
    for (const [tag, effect] of Object.entries(CUSTOM_EFFECTS)) {
        if (!player.hasTag(tag)) continue;
        
        const key = `${playerId}:${tag}`;
        const lastTick = playerLastTick.get(key) || 0;
        
        if (currentTime - lastTick >= effect.interval) {
            effect.onTick(player);
            playerLastTick.set(key, currentTime);
        }
    }
}
```

#### 步骤 4：在主循环中集成

```javascript
// main.js
import { processCustomEffects } from "./custom_effects/effectProcessor.js";

system.runInterval(() => {
    if (!systemReady) return;
    
    for (const player of world.getAllPlayers()) {
        setEffectMain.handleAllPlayersSetEffects();
        processCustomEffects(player);
    }
}, 1);
```

### 完整示例：蜘蛛球

**套装系统侧（触发器）**：

```javascript
// rules.js
{
    id: "minesia_journey:spider_ball",
    slots: ["mainhand"],
    actions: [
        { kind: "state", key: "spider_ball_active", value: true }
    ]
}
```

**自定义效果系统侧（监听者）**：

```javascript
// effectRegistry.js
spider_ball_active: {
    name: "蜘蛛网生成",
    description: "每隔2秒在玩家脚下生成蜘蛛网",
    interval: 40,
    onTick: (player) => {
        const loc = player.location;
        const feetBlock = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y),
            z: Math.floor(loc.z)
        });
        if (feetBlock?.typeId === "minecraft:air") {
            feetBlock.setType("minecraft:web");
        }
    }
}
```

### 完整示例：死神镰刀（濒死效果）

**套装系统侧（触发器）**：

```javascript
// rules.js
{
    id: "minesia_journey:death_scythe",
    slots: ["mainhand"],
    actions: [
        { kind: "state", key: "death_scythe_active", value: true }
    ]
}
```

**自定义效果系统侧（监听者）**：

```javascript
// effectRegistry.js
death_scythe_active: {
    name: "濒死",
    description: "每2秒受到1点伤害",
    interval: 40,
    onTick: (player) => {
        player.applyDamage(1);
        player.dimension.spawnParticle("minecraft:basic_spell_emitter", player.location);
    }
}
```

### 推荐架构

```
BP/scripts/
├── main.js                        # 主循环入口
├── set_effect/                    # 套装效果系统（触发器提供者）
│   ├── rules.js                   # 规则配置
│   ├── actions.js                 # 动作执行
│   └── ...
└── custom_effects/                # 自定义效果系统（监听者）
    ├── effectRegistry.js          # 效果注册表（定义所有自定义效果）
    └── effectProcessor.js         # 效果处理器（监听标签并执行）
```

### 优势

| 特性 | 说明 |
|------|------|
| **套装系统纯净** | 无需修改核心代码，只负责添加标签 |
| **反向依赖** | 自定义效果系统主动适配，而非套装系统被动扩展 |
| **独立开发** | 两套系统可独立开发、测试、维护 |
| **灵活扩展** | 添加新效果只需在 effectRegistry 中注册 |
| **协议解耦** | 通过标签协议通信，互不侵入 |

---

## 调试

系统会在控制台输出日志信息：

- 装备状态变化：`[SetEffectMain] 玩家名: 装备状态变化`
- 物品规则应用：`[SetEffectMain] 玩家名: 应用物品规则 物品ID`
- 错误信息：`[SetEffectMain] 主循环错误: 错误信息`
