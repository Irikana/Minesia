# Minesia 开发路线图

本文档记录 Minesia 项目的功能规划与开发进度。

---

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

---

## 开发中功能

### v0.0.13
- [ ] 镰刀武器配方修正
- [ ] 补充铜镰刀

---

## 规划中功能

### 暴击系统 (Critical Hit System)

**优先级**: 高  
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

| 分析维度 | 评估结果 | 说明 |
|----------|----------|------|
| **技术可行性** | ✅ 高 | 可复用现有随机伤害系统架构，事件监听机制已成熟 |
| **API 支持** | ✅ 支持 | `entityHurt` 事件可获取伤害值，`applyDamage` 可应用额外伤害 |
| **系统集成** | ✅ 良好 | 可与伤害显示系统、Lore 系统无缝集成 |
| **性能影响** | ⚠️ 低风险 | 仅在攻击时触发概率计算，性能开销极小 |
| **兼容性** | ✅ 良好 | 不影响原版下落暴击机制，两者独立并存 |

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

| 限制项 | 说明 |
|--------|------|
| **数据类型** | 支持 `string`、`number`、`boolean`、`Vector3` |
| **存储位置** | 需在 `world_initialize` 事件中注册属性定义 |
| **持久性** | 数据随世界保存，玩家离线后仍保留 |
| **性能** | 读写操作高效，适合频繁访问的数据 |
| **命名空间** | 建议使用 `minesia:` 前缀避免冲突 |

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

---

## 未来规划

### 待定功能
- [ ] 更多武器类型支持
- [ ] 技能系统
- [ ] 成就系统扩展
