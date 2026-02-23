# 伤害显示系统

## 概述

伤害显示系统（Damage Display System）是一个用于 Minecraft 基岩版的脚本系统，它在玩家攻击实体时显示造成的伤害信息。

### 设计理念

- **即时反馈**：玩家可以立即看到每次攻击造成的伤害
- **简洁显示**：使用 ActionBar 显示，不干扰正常游戏
- **覆盖机制**：新攻击会覆盖当前显示，确保信息实时更新
- **可扩展性**：预留多种显示模式，方便未来扩展

---

## 文件结构

```
BP/scripts/damage_display/
├── config.js              # 显示配置文件
└── damageDisplayMain.js   # 核心逻辑
```

---

## 显示效果

### 显示位置

使用 ActionBar 显示伤害信息，位于屏幕准星右下角区域。

### 显示格式

**默认模式**（简洁）：
```
§f伤害: 15.0
```

**连击模式**（快速攻击时）：
```
§f伤害: 45.0 (x3)
```

**调试模式**：
```
§f基础: 7.0 | 附加: 8.0 | 总计: 15.0
```

### 显示时长

- 默认持续 40 游戏刻（2秒）
- 新攻击会覆盖当前显示并重置计时器
- 连击时会累计伤害并显示连击次数

---

## 配置选项

打开 `BP/scripts/damage_display/config.js`：

```javascript
export const DAMAGE_DISPLAY_CONFIG = {
    enabled: true,              // 是否启用伤害显示
    displayDuration: 40,        // 显示持续时间（游戏刻）
    comboTimeWindow: 40,        // 连击时间窗口（游戏刻）
    textColor: "§f",            // 文字颜色（白色）
    showBaseDamage: false,      // 是否显示基础伤害
    showBonusDamage: false,     // 是否显示附加伤害
    showTotalDamage: true,      // 是否显示总伤害
    debugMode: false            // 调试模式
};
```

### 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `true` | 是否启用伤害显示系统 |
| `displayDuration` | number | `40` | 显示持续时间（游戏刻），20刻=1秒 |
| `comboTimeWindow` | number | `40` | 连击时间窗口（游戏刻），在此时间内攻击会累计连击 |
| `textColor` | string | `"§f"` | 显示文字的颜色代码 |
| `showBaseDamage` | boolean | `false` | 是否单独显示基础伤害 |
| `showBonusDamage` | boolean | `false` | 是否单独显示附加伤害 |
| `showTotalDamage` | boolean | `true` | 是否显示总伤害 |
| `debugMode` | boolean | `false` | 调试模式，显示详细伤害分解 |

### 显示模式示例

**只显示总伤害**（默认）：
```javascript
showBaseDamage: false,
showBonusDamage: false,
showTotalDamage: true
// 显示: §f伤害: 15.0
```

**显示基础和附加伤害**：
```javascript
showBaseDamage: true,
showBonusDamage: true,
showTotalDamage: true
// 显示: §f基础: 7.0 | 附加: 8.0 | 总计: 15.0
```

**调试模式**：
```javascript
debugMode: true
// 显示: §f基础: 7.0 | 附加: 8.0 | 总计: 15.0
```

---

## 本地化支持

系统支持多语言显示：

| 语言 | 伤害 | 基础 | 附加 | 总计 |
|------|------|------|------|------|
| 中文 | 伤害 | 基础 | 附加 | 总计 |
| 英文 | Damage | Base | Bonus | Total |

语言设置通过计分板 `minesia_language` 控制：
- 分数 0 或不存在：使用中文（默认）
- 分数 1：使用英文

---

## 工作原理

### 伤害追踪流程

```
玩家攻击 → entityHurt 事件触发
    ↓
获取基础伤害（event.damage）
    ↓
获取附加伤害（bonus_damage 系统记录）
    ↓
计算总伤害 = 基础伤害 + 附加伤害
    ↓
显示伤害信息到 ActionBar
    ↓
40刻后自动清除（或被新攻击覆盖）
```

### 连击机制

当玩家在显示时间内进行多次攻击：

1. 累计所有伤害值
2. 记录连击次数
3. 显示累计伤害和连击次数：`§f伤害: 45.0 (x3)`

### 与附加伤害系统的集成

伤害显示系统从附加伤害系统获取附加伤害数据：

```javascript
import { recentBonusDamage } from "../bonus_damage/bonusDamageMain.js";

const bonusDamageRecord = recentBonusDamage.get(attacker.id);
```

---

## 辅助函数

### `getDisplayState(playerId)`

获取玩家当前的显示状态。

```javascript
import { getDisplayState } from "./damage_display/damageDisplayMain.js";

const state = getDisplayState(player.id);
// 返回: { baseDamage, bonusDamage, totalDamage, hitCount, displayText, targetName, lastUpdate }
```

### `clearAllDisplays()`

清除所有玩家的伤害显示。

```javascript
import { clearAllDisplays } from "./damage_display/damageDisplayMain.js";

clearAllDisplays();
```

---

## 与其他系统的集成

该系统在 `main.js` 中初始化：

```javascript
import { initializeDamageDisplaySystem } from "./damage_display/damageDisplayMain.js";

// 在系统启动时调用
initializeDamageDisplaySystem();
```

---

## 未来扩展

系统预留了以下扩展可能性：

1. **暴击标识**：显示暴击标记
2. **伤害类型**：区分物理/魔法/真实伤害
3. **伤害统计**：累计伤害统计
4. **目标信息**：显示目标名称和血量
5. **自定义位置**：使用 JSON UI 实现更精确的位置控制

---

## 注意事项

1. **性能考虑**：系统使用 Map 存储状态，自动清理过期数据
2. **兼容性**：ActionBar 显示可能与某些资源包冲突
3. **精度**：伤害值保留一位小数显示
4. **覆盖**：新攻击会立即覆盖当前显示

---

## 调试

系统会在控制台输出日志信息：

- 系统初始化：`[DamageDisplay] 系统初始化完成`
- 错误信息：`[DamageDisplay] 处理伤害显示时出错: 错误信息`

开启调试模式后，可以在游戏中看到详细的伤害分解信息。
