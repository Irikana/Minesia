# 规格说明：目录重命名与伤害显示系统

## 项目概述

本次更新包含两个主要任务：
1. 将 `random_damage` 目录重命名为 `bonus_damage`
2. 实现攻击伤害显示系统（Damage Display System）

---

## 任务一：目录重命名

### 背景
用户认为 `bonus_damage` 比 `random_damage` 更能准确描述系统功能。

### 重命名内容

| 原路径 | 新路径 |
|--------|--------|
| `BP/scripts/random_damage/` | `BP/scripts/bonus_damage/` |
| `BP/docs/random_damage_system.md` | `BP/docs/bonus_damage_system.md` |

### 需要更新的文件

1. **main.js** - 更新导入路径
2. **语言文件** - 更新本地化键名（可选，保持向后兼容）
3. **文档** - 更新文档内容和文件名

### 命名规范更新

| 原名称 | 新名称 |
|--------|--------|
| `RANDOM_DAMAGE_WEAPONS` | `BONUS_DAMAGE_WEAPONS` |
| `initializeRandomDamageSystem` | `initializeBonusDamageSystem` |
| `initializeLoreHandler` | 保持不变 |
| `[RandomDamage]` 日志前缀 | `[BonusDamage]` |

---

## 任务二：伤害显示系统

### 功能描述

在玩家攻击实体时，在屏幕准星右下角显示该次攻击造成的伤害数值。

### 显示规格

| 属性 | 值 |
|------|-----|
| 显示位置 | 准星右下角（使用 ActionBar 实现） |
| 显示颜色 | 白色 `§f` |
| 显示时长 | 20 游戏刻（1秒） |
| 覆盖机制 | 新攻击会覆盖当前显示 |
| 显示格式 | `§f伤害: 15` |

### 显示内容

**当前版本**：
- 基础伤害（原版武器伤害）
- 附加伤害（bonus_damage 系统造成的伤害）
- 总伤害 = 基础伤害 + 附加伤害

**未来扩展预留**：
- 暴击标识
- 伤害类型（物理/魔法/真实伤害）
- 连击计数
- 伤害统计

### 技术实现

#### 文件结构

```
BP/scripts/damage_display/
├── config.js           # 显示配置（颜色、持续时间等）
├── damageDisplayMain.js # 核心逻辑
└── damageCalculator.js # 伤害计算器
```

#### 核心逻辑

1. **监听事件**：`world.afterEvents.entityHurt`
2. **伤害追踪**：使用 Map 存储每个玩家的伤害显示状态
3. **显示更新**：使用 ActionBar 显示伤害信息
4. **自动清除**：使用 `system.runTimeout` 在指定时间后清除显示

#### 伤害计算流程

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
20刻后自动清除（或被新攻击覆盖）
```

### 配置选项

```javascript
export const DAMAGE_DISPLAY_CONFIG = {
    enabled: true,
    displayDuration: 20,        // 显示持续时间（游戏刻）
    textColor: "§f",            // 文字颜色
    showBaseDamage: true,       // 是否显示基础伤害
    showBonusDamage: true,      // 是否显示附加伤害
    showTotalDamage: true,      // 是否显示总伤害
    debugMode: false            // 调试模式
};
```

### 显示格式示例

**简洁模式**（默认）：
```
§f伤害: 15
```

**详细模式**（可选，未来扩展）：
```
§f伤害: 12 + 3 (附加)
```

**调试模式**：
```
§f基础: 12 | 附加: 3 | 总计: 15
```

### 与 bonus_damage 系统的集成

伤害显示系统需要与 bonus_damage 系统协同工作：

1. bonus_damage 系统在应用附加伤害时，记录伤害值
2. 伤害显示系统读取记录的附加伤害值
3. 两者共享伤害数据

#### 数据共享方案

使用全局 Map 存储最近的附加伤害：

```javascript
// 在 bonus_damage 系统中
export const recentBonusDamage = new Map(); // playerId -> { targetId, damage, tick }

// 在伤害显示系统中读取
import { recentBonusDamage } from "../bonus_damage/randomDamageMain.js";
```

---

## 兼容性考虑

1. **向后兼容**：保留原有的本地化键名，添加新的键名
2. **性能优化**：使用 Map 进行状态管理，避免频繁创建对象
3. **错误处理**：所有操作都应有 try-catch 保护

---

## 文件变更清单

### 新建文件
- `BP/scripts/damage_display/config.js`
- `BP/scripts/damage_display/damageDisplayMain.js`
- `BP/scripts/damage_display/damageCalculator.js`
- `BP/docs/damage_display_system.md`

### 重命名文件
- `BP/scripts/random_damage/` → `BP/scripts/bonus_damage/`
- `BP/docs/random_damage_system.md` → `BP/docs/bonus_damage_system.md`

### 修改文件
- `BP/scripts/main.js` - 更新导入路径
- `BP/scripts/bonus_damage/*.js` - 更新命名和导出
- `RP/texts/zh_CN.lang` - 更新本地化键名
- `RP/texts/en_US.lang` - 更新本地化键名
