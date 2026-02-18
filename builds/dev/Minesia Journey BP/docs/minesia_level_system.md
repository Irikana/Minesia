# 创世等级系统

## 概述

创世等级系统（Minesia Level System）是一个独立的玩家等级系统，与 Minecraft 原版经验系统分离。玩家通过获取原版经验来提升创世等级，获得各种奖励和属性加成。

### 设计理念

- **独立等级**：不依赖原版等级上限，最高支持 50 级
- **经验追踪**：记录玩家累计获得的所有经验值
- **奖励系统**：每级升级都有对应的货币奖励
- **生命加成**：特定等级里程碑提供永久生命值加成
- **UI 显示**：在屏幕上方显示等级进度条

---

## 文件结构

```
BP/scripts/minesia_level/
├── level_system.js        # 核心等级计算和显示逻辑
├── minesiaLevelEvent.js   # 升级事件和奖励处理
└── minesiaLevelMain.js    # 主循环和计分板管理
```

---

## 等级经验表

系统使用固定的经验表，最高 50 级：

```javascript
static LEVEL_EXP = [
    0,      // 0级（起始）
    100,    // 1级
    250,    // 2级
    450,    // 3级
    700,    // 4级
    1000,   // 5级
    // ... 更多等级
    115000  // 50级（最高）
];
```

等级计算逻辑：玩家总经验 >= 某级所需经验时，达到该等级。

---

## 如何修改等级奖励

### 修改货币奖励

打开 `BP/scripts/minesia_level/minesiaLevelEvent.js`，找到 `LEVEL_REWARDS` 对象：

```javascript
static LEVEL_REWARDS = {
    1: {
        woodCoin: 50,
        message: "minesia.level.event.level1"
    },
    2: {
        woodCoin: 60,
        message: "minesia.level.event.level2"
    },
    3: {
        woodCoin: 80,
        stoneCoin: 10,
        message: "minesia.level.event.level3"
    },
    10: {
        silverCoin: 30,
        goldCoin: 5,
        message: "minesia.level.event.level10"
    },
    20: {
        diamondCoin: 12,
        emeraldCoin: 1,
        message: "minesia.level.event.level20"
    },
    50: {
        emeraldCoin: 150,
        message: "minesia.level.event.level50"
    }
    // ... 1-50级都有对应奖励
};
```

### 奖励参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `woodCoin` | number | 木币数量 |
| `stoneCoin` | number | 石币数量 |
| `silverCoin` | number | 银币数量 |
| `goldCoin` | number | 金币数量 |
| `diamondCoin` | number | 钻石币数量 |
| `emeraldCoin` | number | 绿宝石币数量 |
| `message` | string | 升级提示的语言文件键 |

### 添加新等级奖励

```javascript
static LEVEL_REWARDS = {
    // 已有奖励...
    
    // 添加新等级奖励
    51: {
        emeraldCoin: 200,
        message: "minesia.level.event.level51"
    }
};
```

**注意**：添加新等级奖励时，需要同时：
1. 更新 `LEVEL_EXP` 数组添加对应等级的经验需求
2. 在语言文件中添加对应的提示文本

---

## 生命值加成

### 里程碑奖励

特定等级提供永久生命值加成：

```javascript
static LEVEL_HEALTH_REWARDS = {
    1: 4,   // 1级：+4 生命值（2颗心）
    5: 4,   // 5级：+4 生命值
    10: 4,  // 10级：+4 生命值
    15: 4,  // 15级：+4 生命值
    20: 4,  // 20级：+4 生命值
    25: 4,  // 25级：+4 生命值
    30: 4,  // 30级：+4 生命值
    35: 4,  // 35级：+4 生命值
    40: 4,  // 40级：+4 生命值
    45: 4   // 45级：+4 生命值
};
```

### 计算总加成

```javascript
static calculateLevelHealthBonus(level) {
    let totalBonus = 0;
    for (const [rewardLevel, bonus] of Object.entries(this.LEVEL_HEALTH_REWARDS)) {
        if (level >= parseInt(rewardLevel)) {
            totalBonus += bonus;
        }
    }
    return totalBonus;
}
```

例如：玩家达到 15 级，总生命加成 = 4+4+4+4 = 16（8颗心）

### 修改生命加成

```javascript
static LEVEL_HEALTH_REWARDS = {
    1: 4,
    5: 4,
    10: 8,   // 修改为 +8 生命值
    20: 10,  // 新增 20 级奖励
    // ...
};
```

---

## 计分板系统

系统使用两个计分板追踪玩家数据：

| 计分板ID | 显示名称 | 用途 |
|----------|----------|------|
| `minesia_level` | Minesia Level | 存储玩家当前等级 |
| `minesia_exp` | Minesia Exp | 存储玩家累计总经验 |

### 奖励追踪计分板

每个等级都有一个独立的计分板追踪奖励是否已领取：

```
minesia_reward_1   // 1级奖励追踪
minesia_reward_2   // 2级奖励追踪
...
minesia_reward_50  // 50级奖励追踪
```

玩家获得奖励后，对应计分板分数设为 1。

---

## UI 显示

### 进度条格式

系统在屏幕上方（ActionBar）显示等级进度：

- **未满级**：`§bMinesia Lv.15 §f████████████░░░░░░░░`
- **满级**：`§bMinesia Lv.50 §6Max Level`

### 进度条组成

- 颜色代码 `§b`（青色）：等级标题
- 颜色代码 `§f`（白色）：进度条填充部分
- 颜色代码 `§6`（金色）：满级标识
- 进度条长度：20 字符

### 暂停显示

升级奖励提示时会暂停进度条显示：

```javascript
MinesiaLevelSystem.pauseLevelDisplay(player, 10000);  // 暂停10秒
```

---

## 命令系统

### 查看等级信息

```
/scriptevent minesia:level_info
```

输出示例：
```
=== Minesia Level Info ===
Level: 15
Experience: 450/6750
Progress: ████████░░░░░░░░░░░░ 40.0%
Total Experience: 5200
```

### 查看统计数据

```
/scriptevent minesia:stats
```

输出示例：
```
=== Minesia Level Stats ===
Total Experience Gained: 5200
Level Ups: 15
Play Time: 2h 30m
```

---

## 工作原理

### 经验追踪流程

1. **获取原版经验**：系统定期读取玩家的原版总经验
2. **计算增量**：比较当前经验与上次记录的经验，计算增量
3. **累加创世经验**：将增量累加到创世总经验
4. **计算等级**：根据总经验计算当前等级
5. **检测升级**：如果等级提升，触发升级事件
6. **更新计分板**：同步等级和经验到计分板

### 主循环

```javascript
export function updateMinesiaSystem() {
    const players = world.getPlayers();
    const updates = updatePlayerLevels(players);
    if (updates.length > 0) {
        batchUpdateScoreboard(updates);
    }
    // 清理离线玩家数据
    if (Math.random() < 0.01) {
        cleanupOfflinePlayers();
    }
}
```

### 升级事件处理

```javascript
static handleLevelUp(player, oldLevel, newLevel) {
    // 播放升级音效
    this.playLevelUpSound(player);
    
    // 处理每一级的奖励
    for (let level = oldLevel + 1; level <= newLevel; level++) {
        this.handleSpecificLevelReward(player, level);
    }
}
```

---

## 与其他系统的集成

### 与套装效果系统的集成

套装效果系统会自动获取玩家的创世等级生命加成：

```javascript
const totalExp = MinesiaLevelSystem.getTotalExperience(player);
const currentLevel = MinesiaLevelSystem.calculateLevel(totalExp);
const levelHealthBonus = MinesiaLevelEventSystem.calculateLevelHealthBonus(currentLevel);
actionsModule.applyLevelHealthBonus(player, levelHealthBonus);
```

### 在 main.js 中的初始化

```javascript
import { initializeScoreboard, updateMinesiaSystem } from "./minesia_level/minesiaLevelMain.js";
import { MinesiaLevelEventSystem } from "./minesia_level/minesiaLevelEvent.js";

// 初始化计分板
initializeScoreboard();

// 初始化奖励追踪计分板
MinesiaLevelEventSystem.initializeRewardsScoreboard();

// 在主循环中调用
system.runInterval(() => {
    updateMinesiaSystem();
}, 1);
```

---

## 辅助函数

### `getTotalExperience(player)`

获取玩家的创世总经验。

```javascript
import { MinesiaLevelSystem } from "./minesia_level/level_system.js";

const totalExp = MinesiaLevelSystem.getTotalExperience(player);
```

### `calculateLevel(exp)`

根据总经验计算等级。

```javascript
const level = MinesiaLevelSystem.calculateLevel(5200);  // 返回对应等级
```

### `getLevelProgress(player)`

获取玩家等级进度详情。

```javascript
const progress = MinesiaLevelSystem.getLevelProgress(player);
// 返回: { level, totalExp, expInCurrentLevel, expNeeded, progress, nextLevelExp }
```

### `showLevelProgress(player)`

向玩家显示等级信息。

```javascript
MinesiaLevelSystem.showLevelProgress(player);
```

---

## 语言文件

在 `RP/texts/` 目录下的语言文件中添加：

**zh_CN.lang**:
```
minesia.level.title=创世等级
minesia.level.level_up=恭喜！你的等级已提升至 %s 级！
minesia.level.total_exp=累计获得经验
minesia.level.level_ups=升级次数
minesia.level.play_time=游戏时长
minesia.level.experience=经验
minesia.level.progress=进度
minesia.level.total_experience=总经验
minesia.level.max_level=满级
minesia.level.health_bonus=生命值上限提升！
minesia.level.event.level1=恭喜达到1级！获得新手礼包！
# ... 更多等级提示
```

**en_US.lang**:
```
minesia.level.title=Minesia Level
minesia.level.level_up=Congratulations! Your level has been upgraded to level %s!
minesia.level.total_exp=Total Experience Gained
minesia.level.level_ups=Level Ups
minesia.level.play_time=Play Time
minesia.level.experience=Experience
minesia.level.progress=Progress
minesia.level.total_experience=Total Experience
minesia.level.max_level=Max Level
minesia.level.health_bonus=Max Health Increased!
minesia.level.event.level1=Congratulations on reaching Level 1! Here's your starter pack!
# ... more level messages
```

---

## 注意事项

1. **经验来源**：创世经验来自原版经验获取（挖矿、击杀、繁殖等）
2. **奖励唯一性**：每个等级的奖励只能领取一次，即使降级再升级也不会重复发放
3. **数据持久化**：玩家数据存储在计分板中，世界卸载后依然保留
4. **性能优化**：系统使用 Map 存储玩家状态，定期清理离线玩家数据

---

## 调试

系统会在控制台输出日志信息：

- 计分板初始化：`[Minesia] 计分板 minesia_level 初始化成功`
- 等级提升：`[Minesia] 玩家 玩家名 等级提升: 旧等级 -> 新等级`
- 奖励发放：`[Minesia] 标记玩家 玩家名 已获得 X 级奖励`
- 错误信息：`[Minesia] 系统更新错误: 错误信息`

---

## 扩展指南

### 添加新的货币类型

1. 在 `LEVEL_REWARDS` 中添加新货币字段
2. 在 `handleSpecificLevelReward` 方法中添加处理逻辑

```javascript
if (reward.rubyCoin) {
    this.giveItem(player, "minesia_journey:ruby_coin", reward.rubyCoin);
}
```

### 添加新的里程碑奖励

除了生命值加成，可以添加其他类型的里程碑奖励：

```javascript
static LEVEL_SKILL_REWARDS = {
    10: "unlock_skill_1",
    20: "unlock_skill_2",
    30: "unlock_skill_3"
};
```
