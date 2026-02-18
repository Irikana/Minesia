# 套装效果系统与自定义效果系统集成设计

## 文档信息

- **创建日期**: 2026-02-17
- **类型**: 设计讨论记录
- **相关系统**: 套装效果系统、自定义药水效果、自定义事件

---

## 对话记录

### 用户提问

> 项目中的套装效果系统，适用于未来潜在的自定义药水效果和自定义事件吗？如果是请修改docs下的md文档，如果不是请告诉我有没有等价的方式让套装和自定义药水效果或者自定义事件配合（仅仅只是举个例子，比如当手持蜘蛛球时，每隔一段时间在玩家脚底生成蜘蛛网，或者当手持死神镰刀时，获得"濒死"药水效果，每2秒掉落1点生命值）

### 初步分析回答

**结论**：当前的套装效果系统**不直接支持**自定义药水效果和自定义事件，但可以通过**等价的方式**实现你想要的功能。

**当前系统的局限性**：
1. **药水效果**：当前只支持原版药水效果（如 `strength`, `resistance` 等），不支持自定义药水效果
2. **事件逻辑**：当前系统是"被动触发"模式（装备变化时触发），不支持"持续监听+主动执行"的逻辑

**等价实现方式**：
- **方式一**：使用状态标签 + 独立事件系统（推荐）
- **方式二**：扩展动作系统

### 用户的关键洞察

> 那可不可以这样呢？自定义药水效果和自定义事件与套装效果独立，但通过对药水效果和事件本身的修改，伪造成可以被套装系统识别的符号，这样子就避免了污染套装效果的核心代码，又能实现套装效果对自定义药水效果和自定义事件的支持。（设立理念就是自定义药水效果和自定义事件和套装效果的配合重点在于前二者而并非套装效果，套装效果仅提供便捷和特殊的触发方式这样子）

### 对用户洞察的分析

这个思路非常棒！这是一个**反向依赖**的设计模式，让自定义效果系统主动适配套装系统，而不是让套装系统去扩展。这样：

1. **套装系统保持纯净**：只负责添加状态标签
2. **自定义效果系统主动适配**：监听标签并执行逻辑
3. **解耦且灵活**：自定义效果可以独立开发、测试、维护

---

## 设计理念

### 核心洞察

> 自定义药水效果和自定义事件与套装效果的配合重点在于前二者，而并非套装效果。套装效果仅提供便捷和特殊的触发方式。

### 设计原则

- 套装系统**仅提供便捷的触发方式**（装备检测 → 标签添加）
- 自定义效果系统**主动适配套装系统**（监听标签 → 执行逻辑）
- 两者**独立开发、独立维护**，通过标签协议解耦

---

## 架构设计

### 系统角色划分

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

### 标签协议

状态标签是套装系统与自定义效果系统之间的**适配协议**：

| 协议元素 | 说明 |
|----------|------|
| 标签格式 | `{物品或效果名}_active` 或 `{套装名}_set` |
| 标签生命周期 | 由套装系统管理（装备时添加，卸下时移除） |
| 使用方式 | 自定义效果系统通过 `player.hasTag()` 检测 |

### 文件结构

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

---

## 实现示例

### 套装系统侧（触发器）

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

```javascript
// actions.js
export const CONTROLLED_TAGS = [
    "diamond_set",
    "shield_set",
    "spider_ball_active",
    "death_scythe_active",
];
```

### 自定义效果系统侧（监听者）

```javascript
// BP/scripts/custom_effects/effectRegistry.js
export const CUSTOM_EFFECTS = {
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
    },
    death_scythe_active: {
        name: "濒死",
        description: "每2秒受到1点伤害",
        interval: 40,
        onTick: (player) => {
            player.applyDamage(1);
            player.dimension.spawnParticle("minecraft:basic_spell_emitter", player.location);
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

### 主循环集成

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

---

## 设计优势

| 特性 | 说明 |
|------|------|
| **套装系统纯净** | 无需修改核心代码，只负责添加标签 |
| **反向依赖** | 自定义效果系统主动适配，而非套装系统被动扩展 |
| **独立开发** | 两套系统可独立开发、测试、维护 |
| **灵活扩展** | 添加新效果只需在 `effectRegistry.js` 中注册 |
| **协议解耦** | 通过标签协议通信，互不侵入 |

---

## 扩展指南

### 添加新的自定义效果

1. 在 `rules.js` 中定义触发规则（添加状态标签）
2. 在 `actions.js` 的 `CONTROLLED_TAGS` 中注册标签
3. 在 `effectRegistry.js` 中注册效果逻辑

### 支持的效果类型

通过 `onTick` 回调可以实现任意自定义逻辑：

- 生成方块（如蜘蛛网）
- 造成伤害
- 生成粒子效果
- 播放音效
- 修改玩家属性
- 执行命令
- 触发其他游戏机制

---

## 总结

这次设计讨论确立了**反向依赖**的设计模式，让自定义效果系统主动适配套装系统，而不是让套装系统去扩展。这种设计：

1. **保持了套装系统的纯净性**：核心代码无需修改
2. **提供了灵活的扩展能力**：通过标签协议解耦
3. **降低了维护成本**：两套系统独立开发、独立维护
4. **符合单一职责原则**：套装系统只负责触发，自定义效果系统只负责执行

这种设计模式可以推广到其他需要与套装系统集成的功能模块。
