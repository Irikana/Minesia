# 附加伤害系统

## 概述

附加伤害系统（Bonus Damage System）是一个用于 Minecraft 基岩版的脚本系统，它为武器添加随机附加伤害机制。该系统的主要目的是通过扩展伤害范围来实现武器平衡，而不是简单地堆叠数值。

### 设计理念

- **基岩版限制**：基岩版没有攻击速度机制，因此通过扩展伤害范围来实现武器差异化
- **随机性**：每次攻击的附加伤害在配置的最小值和最大值之间随机取值
- **集中管理**：所有武器的附加伤害配置集中在一个文件中，方便修改和维护

---

## 文件结构

```
BP/scripts/bonus_damage/
├── config.js           # 武器配置文件（主要修改此文件）
├── bonusDamageMain.js  # 核心逻辑，处理攻击事件
└── loreHandler.js      # Lore描述处理，自动添加伤害范围显示
```

---

## 如何添加新的武器

### 步骤 1：打开配置文件

打开 `BP/scripts/bonus_damage/config.js` 文件。

### 步骤 2：在 `BONUS_DAMAGE_WEAPONS` 数组中添加新武器

```javascript
export const BONUS_DAMAGE_WEAPONS = [
    // 已有武器配置...
    
    // 添加新武器
    {
        id: "minesia_journey:steel_sword",  // 武器的物品ID
        minDamage: 2,                        // 最小附加伤害
        maxDamage: 6,                        // 最大附加伤害
        enabled: true                        // 是否启用
    }
];
```

### 配置参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 武器的物品ID，必须与物品定义中的ID完全一致 |
| `minDamage` | number | 最小附加伤害值，支持小数（如 0.5） |
| `maxDamage` | number | 最大附加伤害值，支持小数 |
| `enabled` | boolean | 是否启用该武器的附加伤害功能 |

### 示例配置

```javascript
export const BONUS_DAMAGE_WEAPONS = [
    // 原版钻石剑 - 1到3点附加伤害
    {
        id: "minecraft:diamond_sword",
        minDamage: 1,
        maxDamage: 3,
        enabled: true
    },
    
    // 原版下界合金剑 - 2到5点附加伤害
    {
        id: "minecraft:netherite_sword",
        minDamage: 2,
        maxDamage: 5,
        enabled: true
    },
    
    // 原版铁剑 - 0.5到2点附加伤害
    {
        id: "minecraft:iron_sword",
        minDamage: 0.5,
        maxDamage: 2,
        enabled: true
    }
];
```

---

## 工作原理

### 1. 伤害计算

当玩家使用配置中的武器攻击实体时：

1. 系统检测攻击事件（`entityHurt` 事件）
2. 检查攻击者是否为玩家
3. 检查主手武器是否在配置列表中
4. 计算随机附加伤害：`randomValue = Math.random() * (max - min) + min`
5. 直接修改目标的生命值组件应用伤害
6. 记录伤害数据供伤害显示系统使用

### 2. Lore 自动添加

系统会自动为配置中的武器添加 Lore 描述：

- **触发时机**：
  - 玩家加入服务器时检查背包
  - 物品掉落时
  - 定期检查所有在线玩家的背包

- **Lore 格式**：`§b+1~3 附加伤害`
  - 颜色代码 `§b`（青色）与原版武器伤害属性显示一致
  - 显示格式：`+最小值~最大值 附加伤害`

### 3. 本地化支持

系统支持多语言 Lore 显示：

- **中文**：`§b+1~3 附加伤害`
- **英文**：`§b+1~3 Bonus Damage`

语言设置通过计分板 `minesia_language` 控制：
- 分数 0 或不存在：使用中文（默认）
- 分数 1：使用英文

### 4. 与伤害显示系统的集成

附加伤害系统会记录每次攻击的伤害数据：

```javascript
export const recentBonusDamage = new Map();
```

伤害显示系统可以读取这些数据来显示完整的伤害信息。

---

## 辅助函数

### `getWeaponConfig(itemId)`

获取指定物品ID的武器配置。

```javascript
import { getWeaponConfig } from "./bonus_damage/config.js";

const config = getWeaponConfig("minecraft:diamond_sword");
// 返回: { id: "minecraft:diamond_sword", minDamage: 1, maxDamage: 3, enabled: true }
```

### `calculateBonusDamage(minDamage, maxDamage)`

计算指定范围内的随机伤害值。

```javascript
import { calculateBonusDamage } from "./bonus_damage/config.js";

const damage = calculateBonusDamage(1, 5);  // 返回 1 到 5 之间的随机值
```

### `formatDamageRange(minDamage, maxDamage)`

格式化伤害范围为字符串。

```javascript
import { formatDamageRange } from "./bonus_damage/config.js";

const range = formatDamageRange(1, 3);   // 返回 "1~3"
const range2 = formatDamageRange(0.5, 2); // 返回 "0.5~2"
```

### `getLoreText(locale)`

获取指定语言的 Lore 文本。

```javascript
import { getLoreText } from "./bonus_damage/config.js";

const zhText = getLoreText("zh_CN");  // 返回: { bonusDamage: "附加伤害" }
const enText = getLoreText("en_US");  // 返回: { bonusDamage: "Bonus Damage" }
```

### `getRecentBonusDamage(playerId)`

获取玩家最近的附加伤害记录。

```javascript
import { getRecentBonusDamage } from "./bonus_damage/bonusDamageMain.js";

const record = getRecentBonusDamage(player.id);
// 返回: { targetId, targetType, baseDamage, bonusDamage, totalDamage, tick, timestamp }
```

---

## 与通用 Lore 系统的关系

附加伤害系统有自己独立的 Lore 处理机制（`loreHandler.js`），与通用 Lore 系统（`lore_system/`）是**独立并存**的关系：

| 系统 | 文件位置 | 处理内容 |
|------|----------|----------|
| 附加伤害 Lore | `bonus_damage/loreHandler.js` | 仅处理附加伤害武器的 Lore |
| 通用 Lore 系统 | `lore_system/` | 处理所有注册处理器的物品 Lore |

两个系统可以同时为同一物品添加不同的 Lore 行，互不干扰。通用 Lore 系统用于其他模块（如套装效果）注册自己的 Lore 处理器。

---

## 与其他系统的集成

该系统在 `main.js` 中初始化：

```javascript
import { initializeBonusDamageSystem } from "./bonus_damage/bonusDamageMain.js";
import { initializeLoreHandler } from "./bonus_damage/loreHandler.js";
import { initializeLoreSystem } from "./lore_system/index.js";

// 在系统启动时调用
initializeBonusDamageSystem();
initializeLoreHandler();      // 附加伤害专用 Lore 处理
initializeLoreSystem();       // 通用 Lore 系统（独立运行）
```

---

## 注意事项

1. **伤害类型**：附加伤害直接修改生命值，不触发伤害免疫
2. **小数支持**：伤害值支持小数（如 0.5），系统会保留一位小数
3. **性能考虑**：系统使用去重机制避免重复处理，定期检查背包的间隔为100游戏刻（5秒）
4. **Lore 更新**：如果武器的 Lore 已包含"附加伤害"或"Bonus Damage"字样，不会重复添加
5. **语言切换**：玩家切换语言后，需要重新进入背包才能更新武器 Lore 的语言

---

## 调试

系统会在控制台输出日志信息：

- 系统初始化：`[BonusDamage] 系统初始化完成`
- 伤害应用：`[BonusDamage] 玩家名 使用 物品ID 造成 X 点附加伤害`
- 错误信息：`[BonusDamage] 处理伤害事件时出错: 错误信息`
