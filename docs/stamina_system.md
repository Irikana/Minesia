# 体力值系统

## 概述

体力值系统（Stamina System）为玩家添加了一个体力值状态，奔跑、跳跃、攻击、游泳等行为都会消耗体力值。当体力值耗尽时，玩家会获得缓慢和挖掘疲劳效果。体力值可以通过静止不动或在疲劳状态下缓慢恢复。

---

## 文件结构

```
BP/scripts/stamina/
├── config.js       # 配置文件（主要修改此文件）
└── staminaMain.js  # 核心逻辑
```

---

## 配置说明

打开 `BP/scripts/stamina/config.js` 可修改以下参数：

### 基础设置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 是否启用体力值系统 |
| `maxStamina` | `100` | 最大体力值 |
| `initialStamina` | `100` | 初始体力值 |

### 显示设置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `displayDuration` | `60` | 体力条显示持续时间（tick） |

### 恢复设置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `recoveryDelay` | `40` | 停止消耗后开始恢复的延迟（tick） |
| `recoveryRate` | `0.5` | 正常恢复速率（每tick） |
| `exhaustionThreshold` | `10` | 疲劳阈值 |
| `exhaustionRecoveryRate` | `0.3` | 疲劳状态恢复速率 |

### 消耗设置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `consumption.sprint` | `0.15` | 奔跑消耗（每tick） |
| `consumption.jump` | `3` | 跳跃消耗（每次） |
| `consumption.attack` | `2` | 攻击消耗（每次） |
| `consumption.swim` | `0.1` | 游泳消耗（每tick） |

### 疲劳效果设置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `effects.slowness.amplifier` | `2` | 缓慢效果等级 |
| `effects.slowness.duration` | `40` | 缓慢效果持续时间 |
| `effects.mining_fatigue.amplifier` | `1` | 挖掘疲劳等级 |
| `effects.mining_fatigue.duration` | `40` | 挖掘疲劳持续时间 |

---

## API 接口

### 基础查询方法

```javascript
import { StaminaSystem } from "./stamina/staminaMain.js";

// 获取当前体力值
StaminaSystem.getStamina(player)

// 获取最大体力值（含加成）
StaminaSystem.getMaxStamina(player)

// 获取体力百分比 (0-1)
StaminaSystem.getStaminaPercentage(player)

// 检查是否处于疲劳状态
StaminaSystem.isExhausted(player)

// 检查是否正在恢复
StaminaSystem.isRecovering(player)
```

### 体力值操作方法

```javascript
// 设置体力值
StaminaSystem.setStamina(player, 50)

// 消耗体力值
StaminaSystem.consumeStamina(player, 10)

// 恢复体力值
StaminaSystem.recoverStamina(player, 20)

// 完全恢复体力
StaminaSystem.fullRestore(player)

// 强制耗尽体力
StaminaSystem.forceExhaust(player)
```

### 倍率与加成方法

```javascript
// 设置消耗倍率（0.5 = 消耗减半）
StaminaSystem.setConsumptionMultiplier(player, 0.5)

// 设置恢复倍率（2.0 = 恢复加倍）
StaminaSystem.setRecoveryMultiplier(player, 2.0)

// 设置最大体力值加成
StaminaSystem.setMaxStaminaBonus(player, 50)
```

### 修饰符系统（推荐用于套装效果）

```javascript
// 添加消耗修饰符（可叠加，用于套装效果）
StaminaSystem.addConsumptionModifier(player, "套装ID", 0.8)

// 移除消耗修饰符
StaminaSystem.removeConsumptionModifier(player, "套装ID")

// 添加恢复修饰符
StaminaSystem.addRecoveryModifier(player, "套装ID", 1.5)

// 移除恢复修饰符
StaminaSystem.removeRecoveryModifier(player, "套装ID")
```

---

## ScriptEvent 命令

玩家可使用以下命令与体力值系统交互：

| 命令 | 说明 |
|------|------|
| `/scriptevent minesia:stamina_info` | 显示当前体力值信息 |
| `/scriptevent minesia:stamina_restore` | 完全恢复体力值 |
| `/scriptevent minesia:stamina_exhaust` | 强制耗尽体力值 |
| `/scriptevent minesia:stamina_set <数值>` | 设置体力值为指定值 |
| `/scriptevent minesia:stamina_consume <数值>` | 消耗指定体力值 |
| `/scriptevent minesia:stamina_recover <数值>` | 恢复指定体力值 |
| `/scriptevent minesia:stamina_max_bonus <数值>` | 设置最大体力值加成 |
| `/scriptevent minesia:stamina_consumption_mult <数值>` | 设置消耗倍率 |
| `/scriptevent minesia:stamina_recovery_mult <数值>` | 设置恢复倍率 |

---

## 与套装效果系统集成

### 设计理念

体力值系统与套装效果系统采用**反向依赖**的设计模式：

```
┌─────────────────────────────────────────────────────────────┐
│                    套装效果系统                              │
│  角色：触发器提供者 (Trigger Provider)                       │
│  职责：检测装备状态 → 添加/移除状态标签                       │
│  特点：保持纯净，不关心标签被谁使用                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 状态标签（适配协议）
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    体力值系统                                │
│  角色：监听者 (Listener)                                     │
│  职责：监听标签 → 执行体力值相关逻辑                          │
│  特点：主动适配套装系统，不污染核心代码                        │
└─────────────────────────────────────────────────────────────┘
```

**核心优势**：
- 套装系统**保持纯净**：无需修改核心代码
- 体力值系统**主动适配**：监听标签并执行逻辑
- 两套系统**独立开发、独立维护**

### 文件结构

```
BP/scripts/stamina/
├── config.js                    # 配置文件
├── staminaMain.js               # 核心逻辑
└── staminaSetEffectAdapter.js   # 套装效果适配器（监听者）
```

### 使用方式

#### 步骤 1：套装系统定义触发规则

在 `BP/scripts/set_effect/rules.js` 中定义状态标签：

```javascript
export const SET_RULES = [
    {
        name: "endurance_set",
        required: {
            head: "minesia:endurance_helmet",
            chest: "minesia:endurance_chestplate",
            legs: "minesia:endurance_leggings",
            feet: "minesia:endurance_boots"
        },
        actions: [
            { kind: "effect", type: "resistance", amplifier: 0 },
            { kind: "state", key: "endurance_set", value: true }
        ]
    }
];
```

#### 步骤 2：注册受控标签

在 `BP/scripts/set_effect/actions.js` 中添加标签：

```javascript
export const CONTROLLED_TAGS = [
    "diamond_set",
    "shield_set",
    "steel_set",
    "endurance_set",  // 添加新标签
];
```

#### 步骤 3：体力值系统注册效果

在 `BP/scripts/stamina/staminaSetEffectAdapter.js` 中注册效果：

```javascript
const STAMINA_SET_EFFECTS = {
    "endurance_set": {
        name: "耐力套装",
        description: "最大体力+50，消耗减少30%，恢复增加50%",
        onEquip: (player) => {
            StaminaSystem.addConsumptionModifier(player, "endurance_set", 0.7);
            StaminaSystem.addRecoveryModifier(player, "endurance_set", 1.5);
            StaminaSystem.setMaxStaminaBonus(player, 50);
        },
        onUnequip: (player) => {
            StaminaSystem.removeConsumptionModifier(player, "endurance_set");
            StaminaSystem.removeRecoveryModifier(player, "endurance_set");
            StaminaSystem.setMaxStaminaBonus(player, 0);
        }
    }
};
```

### 预置效果

适配器已预置以下效果：

| 标签 | 效果 |
|------|------|
| `endurance_set` | 最大体力+50，消耗-30%，恢复+50% |
| `agility_set` | 体力消耗-50% |
| `heavy_armor_set` | 体力消耗+50%，恢复-30% |
| `stamina_ring_active` | 体力恢复+100% |
| `endurance_ring_active` | 最大体力+30，消耗-20% |

### 动态注册效果

可以在运行时动态注册新的体力值套装效果：

```javascript
import { registerStaminaSetEffect } from "./stamina/staminaSetEffectAdapter.js";

registerStaminaSetEffect("custom_stamina_set", {
    name: "自定义体力套装",
    description: "自定义效果描述",
    onEquip: (player) => {
        StaminaSystem.setMaxStaminaBonus(player, 100);
    },
    onUnequip: (player) => {
        StaminaSystem.setMaxStaminaBonus(player, 0);
    }
});
```

---

## 完整示例

### 示例 1：耐力套装

```javascript
// rules.js
export const SET_RULES = [
    {
        name: "endurance_set",
        required: {
            head: "minesia:endurance_helmet",
            chest: "minesia:endurance_chestplate",
            legs: "minesia:endurance_leggings",
            feet: "minesia:endurance_boots"
        },
        actions: [
            { kind: "effect", type: "resistance", amplifier: 0 },
            { kind: "stamina_max_bonus", value: 50 },
            { kind: "stamina_consumption_mult", id: "endurance_set", value: 0.7 },
            { kind: "stamina_recovery_mult", id: "endurance_set", value: 1.5 },
            { kind: "state", key: "endurance_set", value: true }
        ]
    }
];
```

### 示例 2：敏捷戒指

```javascript
// rules.js
export const ITEM_RULES = [
    {
        id: "minesia:agility_ring",
        slots: ["offhand"],
        actions: [
            { kind: "stamina_consumption_mult", id: "agility_ring", value: 0.5 },
            { kind: "effect", type: "speed", amplifier: 0 },
            { kind: "state", key: "agility_ring_active", value: true }
        ]
    }
];
```

### 示例 3：重甲惩罚

```javascript
// rules.js
export const SET_RULES = [
    {
        name: "heavy_armor_set",
        required: {
            head: "minesia:heavy_helmet",
            chest: "minesia:heavy_chestplate",
            legs: "minesia:heavy_leggings",
            feet: "minesia:heavy_boots"
        },
        actions: [
            { kind: "effect", type: "resistance", amplifier: 2 },
            { kind: "stamina_consumption_mult", id: "heavy_armor", value: 1.5 },
            { kind: "stamina_recovery_mult", id: "heavy_armor", value: 0.7 },
            { kind: "state", key: "heavy_armor_set", value: true }
        ]
    }
];
```

---

## 显示优先级

体力值系统与其他系统的显示优先级：

| 优先级 | 系统 | 说明 |
|--------|------|------|
| 1（最高） | 伤害显示 | 攻击时显示伤害信息 |
| 2 | 体力值 | 消耗/恢复时显示体力条 |
| 3（最低） | 创世等级 | 默认显示等级进度条 |

体力值条只在**消耗或恢复时**显示，使用 ActionBar 实现：
- 绿色：体力 > 50%
- 黄色：体力 25% ~ 50%
- 红色：体力 < 25%

---

## 注意事项

1. **修饰符叠加**：多个修饰符会相乘叠加，例如 0.8 × 0.8 = 0.64
2. **体力值范围**：体力值始终在 0 ~ 最大体力值之间
3. **疲劳恢复**：疲劳状态下恢复速度更慢，需要等待体力恢复到阈值以上才能解除
4. **性能优化**：系统每 tick 更新一次，已优化为批量处理

---

## 调试

系统会在控制台输出日志信息：

- 初始化：`[Stamina] 体力值系统初始化完成`
- 错误信息：`[Stamina] 应用疲劳效果失败: 错误信息`
