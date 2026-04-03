# Minesia 开发路线图

本文档记录 Minesia 项目的功能规划与开发进度。

***

## 已完成功能

### 核心系统

- [x] 随机伤害系统 (Random Damage System)
- [x] 体力值系统 (Stamina System)
- [x] 套装效果系统 (Set Effect System)
- [x] Lore 描述系统 (Lore System)
- [x] 伤害显示系统 (Damage Display System)
- [x] Minesia 等级系统 (Minesia Level System)
- [x] 调试管理系统 (Debug Manager)
- [x] 自定义事件系统 (Custom Events System)

***

## 开发中功能

### v0.0.13

- [ ] 镰刀武器配方修正
- [ ] 补充铜镰刀

***

## 规划中功能

### 暴击系统 (Critical Hit System)

**优先级**: 高\
**预计版本**: v0.0.14+

#### 功能描述

游戏中的暴击行为是下落时攻击触发，而且不支持不带weapon的附加包所定义的武器。现新增暴击行为系统：

- 玩家攻击时有机会触发暴击
- 当暴击行为触发时，额外对目标造成当前伤害的 50% 伤害
- 暴击行为受暴击率控制
- 玩家初始默认拥有 0% 暴击率
- 暴击率可修改（通过装备、效果等）
- **不与原版下落暴击叠加伤害**（独立计算）
- **触发时播放原版暴击声音和粒子效果**

#### 可行性分析

| 分析维度       | 评估结果   | 说明                                          |
| ---------- | ------ | ------------------------------------------- |
| **技术可行性**  | ✅ 高    | 可复用现有随机伤害系统架构，事件监听机制已成熟                     |
| **API 支持** | ✅ 支持   | `entityHurt` 事件可获取伤害值，`applyDamage` 可应用额外伤害 |
| **系统集成**   | ✅ 良好   | 可与伤害显示系统、Lore 系统无缝集成                        |
| **性能影响**   | ⚠️ 低风险 | 仅在攻击时触发概率计算，性能开销极小                          |
| **兼容性**    | ✅ 良好   | 不影响原版下落暴击机制，两者独立并存                          |

#### 技术方案

```
BP/scripts/critical_hit/
├── config.js              # 暴击率配置（武器、装备加成等）
├── criticalHitMain.js     # 核心逻辑，处理暴击判定
└── criticalHitLoreHandler.js  # Lore 描述处理
```

**核心实现要点**：

1. **暴击率存储**：使用动态属性 (Dynamic Properties) 存储玩家暴击率
   - 属性 ID: `minesia:critical_rate`
   - 数据类型: `number` (0-100 表示百分比)
   - 参考现有实现: [staminaMain.js:515-553](file:///g:/PClite/mcbe_addons_p/bridge/projects/Minesia/BP/scripts/stamina/staminaMain.js#L515-L553)
2. **暴击判定**：在 `entityHurt` 事件中，计算总暴击率后进行概率判定
3. **伤害计算**：暴击伤害 = 基础伤害 × 1.5（额外 50%）
4. **视觉与音效反馈**：
   - 粒子效果: `minecraft:critical_hit_emitter`
   - 声音效果: `random.orb` (原版暴击音效)
   - API 调用:
     ```javascript
     dimension.spawnParticle("minecraft:critical_hit_emitter", target.location);
     player.playSound("random.orb");
     ```
5. **显示反馈**：通过伤害显示系统展示暴击效果（如特殊颜色或标记）

#### 动态属性限制说明

| 限制项      | 说明                                       |
| -------- | ---------------------------------------- |
| **数据类型** | 支持 `string`、`number`、`boolean`、`Vector3` |
| **存储位置** | 需在 `world_initialize` 事件中注册属性定义          |
| **持久性**  | 数据随世界保存，玩家离线后仍保留                         |
| **性能**   | 读写操作高效，适合频繁访问的数据                         |
| **命名空间** | 建议使用 `minesia:` 前缀避免冲突                   |

#### 依赖系统

- 随机伤害系统 (`scripts/random_damage`)
- 伤害显示系统 (`scripts/damage_display`)
- Lore 系统 (`scripts/lore_system`)

#### 开发任务

- [ ] 创建暴击系统目录结构
- [ ] 实现暴击率配置模块
- [ ] 注册动态属性 `minesia:critical_rate`
- [ ] 实现暴击判定核心逻辑
- [ ] 实现暴击粒子效果 (`minecraft:critical_hit_emitter`)
- [ ] 实现暴击音效 (`random.orb`)
- [ ] 集成伤害显示系统（暴击特效）
- [ ] 实现 Lore 描述处理器
- [ ] 添加武器/装备暴击率加成配置
- [ ] 测试与调试

***

## 未来规划

### 属性面板与 HUD 系统 (Attribute Panel & HUD System)

**优先级**: 中\
**预计版本**: v0.0.15+

#### 功能描述

利用废弃但保留的 Lore 系统实现属性面板功能，同时对 HUD 进行改造，实现更灵活的槽位管理。

##### 属性面板设计

- 创建一个名为"属性"的特殊物品
- Lore 显示各种属性的数值、加成等信息
- 锁定在热栏特定位置（从第 9 个槽位往前数）
- 支持多种属性面板类型：数值、技能、职业、主线任务、支线任务等

##### HUD 槽位规划

| 槽位范围 | 用途 | 说明 |
|---------|------|------|
| 第 1-4 槽位 | 快捷栏 | 在 HUD 显示，可快速切换，用于放置武器、食物等常用物品 |
| 第 5-9 槽位 | 特殊物品栏 | 不在 HUD 显示，从背包打开查看，用于放置属性、数值、技能、职业、任务等 |

##### 核心特性

1. **槽位锁定**：特殊物品（属性面板等）锁定在指定槽位，无法移动
2. **HUD 精简**：只显示第 1-4 槽位，隐藏第 5-9 槽位
3. **背包交互**：第 5-9 槽位需要打开背包才能查看和操作
4. **Lore 动态更新**：属性面板的 Lore 根据玩家当前属性动态更新

#### 可行性分析

| 分析维度 | 评估结果 | 说明 |
|---------|---------|------|
| **技术可行性** | ⚠️ 中等 | 需要探索 HUD 隐藏/自定义的 API 支持程度 |
| **API 支持** | ⚠️ 部分支持 | Script API v2.0.0 提供了热栏事件，但 HUD 自定义可能有限制 |
| **系统集成** | ✅ 良好 | 可复用现有 Lore 系统框架 |
| **性能影响** | ✅ 低风险 | 仅在属性变化时更新 Lore |

#### 技术方案

```
BP/scripts/attribute_panel/
├── config.js              # 属性面板配置
├── attributePanelMain.js  # 核心逻辑，处理槽位锁定和面板管理
├── attributeCalculator.js # 属性计算（整合现有系统）
└── slotManager.js         # 槽位管理，处理 HUD 显示逻辑
```

**核心实现要点**：

1. **热栏槽位监听**：使用 `PlayerHotbarSelectedSlotChangeAfterEvent` 监听槽位变化
2. **物品锁定**：通过脚本阻止玩家移动特殊物品
3. **Lore 动态更新**：利用 `PlayerInventoryItemChangeAfterEvent` 触发 Lore 更新
4. **HUD 控制**：探索是否可以通过客户端资源包或 Molang 查询实现 HUD 隐藏

#### 相关 API 支持（Script API v2.0.0+）

| API | 版本 | 用途 |
|-----|------|------|
| `PlayerHotbarSelectedSlotChangeAfterEvent` | 1.21.100 | 监听热栏选中槽位变化 |
| `PlayerInventoryItemChangeAfterEvent` | 1.21.100 | 监听物品栏物品变化 |
| `Container.find` APIs | 1.21.100 | 搜索容器内容 |
| `server-ui` improvements | 1.21.90 | 表单格式化（Section Headers, Labels, Tooltips） |
| `Input APIs` | 1.21.60 | 检测玩家输入模式 |

#### 技术限制说明

> ⚠️ **注意**：当前 Script API 对 HUD 自定义的支持有限，可能需要：
> - 通过资源包修改 HUD 材质/布局
> - 使用 Molang 查询（如 `query.touch_only_affects_hotbar`）配合客户端资源
> - 或采用替代方案（如通过 UI 表单展示属性面板）

#### 依赖系统

- Lore 系统 (`scripts/lore_system`)
- Minesia 等级系统 (`scripts/minesia_level`)
- 套装效果系统 (`scripts/set_effect`)
- 暴击系统 (`scripts/critical_hit`)

#### 开发任务

- [ ] 调研 HUD 自定义的可行方案
- [ ] 设计属性面板物品结构
- [ ] 实现槽位锁定逻辑
- [ ] 实现属性计算与整合
- [ ] 实现 Lore 动态更新
- [ ] 实现 HUD 精简显示（或替代方案）
- [ ] 测试与调试

***

### 待定功能

- [ ] 更多武器类型支持
- [ ] 技能系统
- [ ] 成就系统扩展

