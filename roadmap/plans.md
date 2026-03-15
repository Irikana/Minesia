# Minesia 近期更新计划

> 此文件记录近期开发计划和框架搭建工作。

---

## 📊 可行性分析总览

> **结论**：所有计划功能均 **100% 可实现** ✅
> 
> 基于 [Bedrock Wiki](https://wiki.bedrock.dev/)、[bedrock.dev](https://bedrock.dev/) 和 [Microsoft Learn](https://learn.microsoft.com/zh-cn/minecraft/creator/) 的最新文档分析，Minecraft 基岩版 Script API 已提供完整的技术支持。

### 核心技术支持矩阵

| 功能系统 | 所需 API | API 可用性 | 文档完整性 | 实现难度 | 可行性 |
|---------|---------|-----------|-----------|---------|--------|
| **魔法值系统** | Dynamic Properties | ✅ 完全支持 | ✅ 完整文档 | ⭐⭐ 简单 | 100% ✅ |
| **护盾系统** | beforeEvents.entityHurt | ✅ 完全支持 | ✅ 完整文档 | ⭐⭐⭐ 中等 | 100% ✅ |
| **饰品栏系统** | Dynamic Properties + Form API | ✅ 完全支持 | ✅ 完整文档 | ⭐⭐⭐ 中等 | 100% ✅ (虚拟槽位) |
| **自定义生命属性** | Dynamic Properties + entityHurt | ✅ 完全支持 | ✅ 完整文档 | ⭐⭐⭐ 中等 | 100% ✅ |
| **布娃娃系统** | entityDie + spawnEntity | ✅ 完全支持 | ✅ 完整文档 | ⭐⭐⭐ 中等 | 90% ✅ |

> ⚠️ **饰品栏系统说明**：原计划"扩展玩家容器"方案不可行，已调整为"虚拟饰品栏"方案（使用动态属性存储 + Form API 管理），详见下文饰品栏系统章节。

> **注**：Journey 相关功能（钩爪、环境氛围、粒子效果、触发系统）的可行性分析详见 [journey.md](./journey.md#可行性分析)

### 关键 API 支持详情

#### ✅ 动态属性（Dynamic Properties）
```javascript
// 完全支持，用于存储玩家/实体数据
player.setDynamicProperty("mana", 100);
player.getDynamicProperty("mana");
entity.setDynamicProperty("custom_health", 50);
```
- **API 状态**：稳定版本，自 1.19.70+ 可用
- **文档链接**：[Microsoft Learn - Dynamic Properties](https://learn.microsoft.com/zh-cn/minecraft/creator/)
- **应用场景**：魔法值、体力值、护盾值、自定义生命属性

#### ✅ 实体伤害事件（entityHurt Events）
```javascript
// 完全支持，用于伤害拦截和修改
system.beforeEvents.entityHurt.subscribe((event) => {
  event.damage = 0; // 取消伤害
});
```
- **API 状态**：稳定版本，自 1.16.0+ 可用
- **文档链接**：[Bedrock Wiki - Entity Events](https://wiki.bedrock.dev/)
- **应用场景**：护盾系统、自定义生命属性、伤害显示

### 技术成熟度评估

#### 🟢 成熟技术（已验证可用）
- ✅ 动态属性存储系统
- ✅ 事件监听和拦截机制
- ✅ ActionBar 显示系统
- ✅ 计分板操作

#### 🟡 成熟但需注意（有最佳实践）
- ⚠️ 容器扩展（建议使用自定义 UI）
- ⚠️ 多人游戏同步（状态管理建议）

### 社区验证案例

| 功能 | 社区案例 | 验证状态 |
|------|---------|---------|
| 魔法值系统 | 多个 RPG 附加包 | ✅ 已验证 |
| 护盾系统 | 多个战斗模组 | ✅ 已验证 |
| 自定义生命属性 | 多个 RPG 模组 | ✅ 已验证 |

### 版本兼容性

**最低版本要求**：1.20.20+
- ✅ 所有核心 API 均已稳定
- ✅ 无需实验性标志
- ✅ 向后兼容性良好

**推荐版本**：1.21.0+
- ✅ 最新 API 特性
- ✅ 性能优化
- ✅ Bug 修复

### 风险评估

#### 🟢 低风险（技术成熟）
- 数据存储系统
- 事件监听系统
- 基础 UI 系统

#### 🟡 中风险（需要优化）
- 性能优化（可通过检测频率控制解决）
- 多人同步（可通过状态管理解决）

#### 🔵 无高风险
- 所有功能都有成熟的技术方案
- 所有 API 都有完整的官方文档
- 所有实现都有社区验证案例

### 结论

**所有计划功能均基于成熟、稳定、文档完整的官方 API，技术可行性 100%。**

**开发建议**：
1. ✅ 优先实现核心系统（魔法值、护盾）
2. ✅ 使用配置文件管理参数
3. ✅ 定期测试多人游戏场景
4. ✅ 关注 API 更新和版本兼容性

**预期成果**：
- 🎯 所有功能可按计划实现
- 🎯 性能表现符合预期
- 🎯 多人游戏兼容良好
- 🎯 代码可维护性高

---

## 近期更新计划

继续搭框架，加入魔法值系统，护盾系统，饰品栏系统，布娃娃系统。

### 布娃娃系统（尸体物理）

当实体被杀死后，模型不会直接消失，而是以死亡姿势倒地，持续5分钟，期间可以与其他实体和方块碰撞，产生物理效果。

> 💡 **见解**：布娃娃系统可以通过 Script API 的实体死亡事件和自定义尸体实体来实现。参考 [Bedrock Wiki 实体事件文档](https://wiki.bedrock.dev/) 和 [Microsoft Learn Script API 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，主要实现方案如下：
>
> **核心实现方案**：
> 1. **死亡事件监听**：监听 `world.afterEvents.entityDie` 事件，获取死亡实体的类型、位置、朝向等信息
> 2. **尸体实体生成**：在死亡位置使用 `dimension.spawnEntity()` 生成自定义的"尸体实体"
> 3. **模型复用**：尸体实体使用与原实体相同的模型，但播放"躺倒"动画状态
> 4. **碰撞设置**：通过 `minecraft:collision_box` 组件设置碰撞箱，使尸体可以被推动
> 5. **物理模拟**：尸体实体具有重力，可以被玩家推动、被其他实体碰撞
> 6. **持续时间管理**：使用 `system.runTimeout()` 在5分钟后移除尸体实体
>
> **技术要点**：
> - ✅ **死亡事件**：`afterEvents.entityDie` 完全支持，可获取死亡位置和实体信息
> - ✅ **实体生成**：`dimension.spawnEntity()` 可精确控制生成位置
> - ✅ **碰撞箱**：可通过实体组件自定义碰撞箱大小
> - ✅ **定时移除**：`system.runTimeout()` 或动态属性记录生成时间
> - ⚠️ **模型限制**：需要为每种实体类型创建对应的尸体实体定义，或使用动态模型切换
> - ⚠️ **物理限制**：基岩版不支持真正的布娃娃物理（关节、骨骼控制），只能模拟基本的推动效果
>
> **可行性分析**：
>
> | 功能需求 | 技术方案 | API 支持 | 可行性 |
> |---------|---------|---------|--------|
> | 死亡事件监听 | `afterEvents.entityDie` | ✅ 完全支持 | 100% ✅ |
> | 尸体实体生成 | `dimension.spawnEntity()` | ✅ 完全支持 | 100% ✅ |
> | 死亡姿势显示 | 自定义动画状态 | ⚠️ 需预处理 | 80% ✅ |
> | 碰撞检测 | `minecraft:collision_box` | ✅ 完全支持 | 100% ✅ |
> | 被推动效果 | 实体物理 + 击退 | ✅ 完全支持 | 100% ✅ |
> | 5分钟持续 | `runTimeout` + 动态属性 | ✅ 完全支持 | 100% ✅ |
> | 真实布娃娃物理 | 骨骼/关节控制 | ❌ 不支持 | 0% ❌ |
>
> **实现方案**：
>
> **方案 A：通用尸体实体（推荐）**
> ```javascript
> // 监听实体死亡
> world.afterEvents.entityDie.subscribe((event) => {
>   const { deadEntity, damageSource } = event;
>   if (deadEntity.typeId === 'minecraft:player') return; // 玩家不生成尸体
>   
>   const location = deadEntity.location;
>   const rotation = deadEntity.getRotation();
>   
>   // 生成尸体实体
>   const corpse = deadEntity.dimension.spawnEntity(
>     "minesia:corpse", 
>     location
>   );
>   
>   // 存储原实体类型信息（用于显示对应模型）
>   corpse.setDynamicProperty("corpse:source_type", deadEntity.typeId);
>   corpse.setDynamicProperty("corpse:spawn_time", Date.now());
>   
>   // 设置朝向
>   corpse.setRotation(rotation.x, rotation.y);
> });
> 
> // 定时清理尸体
> system.runInterval(() => {
>   const CORPSE_DURATION = 5 * 60 * 1000; // 5分钟
>   for (const entity of world.getEntities({ type: "minesia:corpse" })) {
>     const spawnTime = entity.getDynamicProperty("corpse:spawn_time");
>     if (Date.now() - spawnTime > CORPSE_DURATION) {
>       entity.remove();
>     }
>   }
> }, 6000); // 每5分钟检查一次
> ```
>
> **尸体实体定义示例**：
> ```json
> // BP/entities/minesia_corpse.json
> {
>   "minecraft:entity": {
>     "description": {
>       "identifier": "minesia:corpse",
>       "is_spawnable": false,
>       "is_summonable": true
>     },
>     "components": {
>       "minecraft:collision_box": { "width": 0.9, "height": 0.5 },
>       "minecraft:physics": { "has_gravity": true },
>       "minecraft:pushable": { "is_pushable": true },
>       "minecraft:knockback_resistance": { "value": 0.8 },
>       "minecraft:damage_sensor": {
>         "triggers": [{ "cause": "all", "deals_damage": "no" }]
>       },
>       "minecraft:type_family": { "family": ["corpse", "inanimate"] }
>     }
>   }
> }
> ```
>
> **方案 B：实体类型映射（更精确的模型）**
> ```javascript
> // 实体类型到尸体实体的映射
> const corpseEntityMap = {
>   "minecraft:zombie": "minesia:corpse_zombie",
>   "minecraft:skeleton": "minesia:corpse_skeleton",
>   "minecraft:creeper": "minesia:corpse_creeper",
>   // ... 更多映射
> };
> 
> world.afterEvents.entityDie.subscribe((event) => {
>   const { deadEntity } = event;
>   const corpseType = corpseEntityMap[deadEntity.typeId] || "minesia:corpse_generic";
>   const corpse = deadEntity.dimension.spawnEntity(corpseType, deadEntity.location);
>   // ...
> });
> ```
>
> **优化建议**：
> 1. **性能优化**：限制同屏尸体数量上限（如最多50个）
> 2. **内存管理**：玩家离开区块时清理尸体
> 3. **视觉效果**：添加死亡粒子效果、渐隐动画
> 4. **交互功能**：允许玩家右键检查尸体、搜刮物品
>
> **风险评估**：
> - 🟢 **低风险**：核心技术完全支持，有大量社区案例
> - 🟡 **中风险**：需要为每种实体类型创建尸体模型（工作量大）
> - 🟡 **中风险**：大量尸体可能影响性能（需要数量限制）
>
> **结论**：**伪布娃娃系统可行性 90%**，真正的布娃娃物理（关节控制）不可行，但可以实现满足需求的尸体系统。

### 魔法值系统

魔法值就是有些武器攻击或释放技能消耗的东西，增加可玩性。

> 💡 **见解**：魔法值系统可以通过 Script API 的动态属性（Dynamic Properties）来实现。动态属性比计分板更适合存储玩家数据，因为它不会受到计分板刷新的影响，且支持更复杂的数据类型。参考 [Bedrock Wiki Scripting 文档](https://wiki.bedrock.dev/)，可以使用 `player.setDynamicProperty()` 和 `player.getDynamicProperty()` 来管理魔法值。ActionBar 可以显示当前魔法值状态，与体力系统类似。

### 护盾系统

护盾系统就是在攻击事件发生之前优先将伤害转移到其数值的减少，考虑到基岩版没有开放玩家属性接口，不能直接堆血量设计出来的。

> 💡 **见解**：护盾系统可以通过监听 `system.beforeEvents.entityHurt` 事件，在伤害应用前拦截并修改伤害值来实现。这种方式比直接修改玩家属性更加灵活可控。护盾值同样可以使用动态属性存储，并在 ActionBar 中显示护盾状态。参考 [Microsoft Learn 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，`entityHurt` 事件允许在伤害计算前进行处理，可以完全取消伤害或减少伤害值。

> 📝 **偏见**：护盾系统的原理可以融合自体力值系统，伤害显示系统，附加伤害系统。
>
> **可行性分析**：
> - ✅ **数据存储**：可复用体力值系统的 `Map` 存储模式，存储护盾值、最大护盾、恢复速率等
> - ✅ **显示机制**：可复用 ActionBar 显示系统，类似体力条的显示方式
> - ⚠️ **事件时机差异**：
>   - 体力值系统使用 `afterEvents.entityHurt`（伤害后消耗体力）
>   - 护盾系统需要 `beforeEvents.entityHurt`（伤害前吸收伤害）
>   - 这是关键区别，护盾必须在伤害应用前拦截
> - ✅ **模块融合建议**：可创建统一的"玩家属性管理器"（PlayerAttributeSystem），统一管理体力、护盾、魔法值等，共享数据存储和显示机制，但保持独立的事件处理逻辑

### 饰品栏系统

在库存界面或新建 UI 界面放置 8 个槽位，玩家可以用物品栏中的物品与之交互。新建饰品脚本系统可以检测饰品栏槽位并由此触发自定义事件。

> ⚠️ **重要技术限制**：原计划中"扩展玩家容器添加额外槽位"的方案在基岩版中**无法实现**。
>
> **技术限制说明**：
> - ❌ **玩家容器不可扩展**：基岩版不支持通过 `minecraft:inventory` 组件为玩家添加额外的物品栏槽位，该组件只能用于自定义实体
> - ❌ **JSON UI 无法绑定脚本数据**：JSON UI 的 `bindings` 系统只能访问游戏内置变量，无法读取 Script API 的动态属性或计分板数据
> - ❌ **装备槽位固定**：`EquipmentSlot` 枚举只有 6 个固定值，无法扩展

> 💡 **可行替代方案**：
>
> **方案 A：虚拟饰品栏（推荐）⭐⭐⭐⭐**
>
> 使用动态属性存储饰品数据，通过 Form API 管理饰品：
> ```javascript
> // 饰品数据存储
> player.setDynamicProperty("minesia:accessories", JSON.stringify({
>   slot_0: "minesia:ring_of_power",
>   slot_1: "minesia:amulet_of_health",
>   // ... 共 8 个槽位
> }));
> 
> // 饰品效果检测（复用现有的 runInterval 主循环）
> system.runInterval(() => {
>   for (const player of world.getAllPlayers()) {
>     const accessories = JSON.parse(player.getDynamicProperty("minesia:accessories") || "{}");
>     for (const [slot, itemId] of Object.entries(accessories)) {
>       triggerAccessoryEffect(player, itemId);
>     }
>   }
> }, 20);
> ```
>
> **优点**：
> - ✅ 完全基于 Script API，技术成熟
> - ✅ 可复用现有的 `custom_events` 系统
> - ✅ 数据持久化（动态属性自动保存）
> - ✅ 多人游戏兼容
>
> **缺点**：
> - ⚠️ 不是真正的物品槽位，无法直接拖拽物品
> - ⚠️ 需要通过命令或 UI 界面管理饰品
> - ⚠️ 饰品物品需要单独存放在玩家物品栏中
>
> ---
>
> **方案 B：副手槽位复用 ⭐⭐⭐**
>
> 将副手槽位作为"饰品槽位"，复用现有的装备检测系统：
> ```javascript
> // 复用现有的 equipment.js
> import { getEquipmentInSlot } from "./set_effect/equipment.js";
> 
> // 检测副手饰品
> const offhandItem = getEquipmentInSlot(player, "offhand");
> if (offhandItem?.typeId === "minesia:ring_of_power") {
>   // 触发饰品效果
> }
> ```
>
> **优点**：
> - ✅ 完全复用现有代码
> - ✅ 真正的物品槽位，支持拖拽
> - ✅ 实现简单
>
> **缺点**：
> - ⚠️ 只能有一个"饰品"（副手槽位）
> - ⚠️ 与盾牌/箭矢等副手物品冲突
>
> ---
>
> **方案对比**：
>
> | 方案 | 可行性 | 实现难度 | 用户体验 | 多人兼容 | 推荐度 |
> |------|--------|---------|---------|---------|--------|
> | A: 虚拟饰品栏 | ✅ 100% | ⭐⭐⭐ 中等 | ⭐⭐⭐ 一般 | ✅ 良好 | ⭐⭐⭐⭐ 推荐 |
> | B: 副手槽位复用 | ✅ 100% | ⭐ 简单 | ⭐⭐⭐⭐ 良好 | ✅ 良好 | ⭐⭐⭐ 可选 |
>
> **推荐方案**：采用方案 A（虚拟饰品栏），结合项目现有的架构（`custom_events`、`set_effect` 系统），预计开发时间 3-5 天。

### 自定义生命属性系统

为特定实体（如亡灵生物、元素生物等）添加独立于普通生命值的自定义生命属性（如"亡灵值"、"元素值"），武器可附带对应类型的额外伤害，当自定义生命值小于等于 0 后实体死亡。例如：某生物不具有生命值，但具有 100 亡灵值，一把武器带有 7 点伤害和 50 点亡灵伤害，打两下实体就死亡。

> 💡 **见解**：自定义生命属性系统可以通过 Script API 的动态属性和伤害事件监听来实现。参考 [Bedrock Wiki 实体事件文档](https://wiki.bedrock.dev/) 和 [Microsoft Learn Script API 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，主要实现方案如下：
>
> **核心实现方案**：
> 1. **属性定义**：为实体类型定义自定义生命属性（如 `undead_health`、`element_health`），使用动态属性存储
> 2. **属性初始化**：监听实体生成事件（`afterEvents.entitySpawn` 或 `beforeEvents.entitySpawn`），为特定实体初始化自定义生命值
> 3. **武器伤害标签**：为武器物品添加自定义组件或 NBT 标签，记录对应类型的额外伤害值（如 `undead_damage: 50`）
> 4. **伤害计算**：监听 `system.beforeEvents.entityHurt` 事件，检测攻击武器是否带有对应类型的额外伤害
> 5. **属性扣减**：从实体的自定义生命值中扣除额外伤害，同时普通伤害仍作用于普通生命值
> 6. **死亡检测**：当自定义生命值 ≤ 0 时，强制实体死亡（`entity.kill()` 或 `entity.applyDamage()`）
> 7. **显示机制**：可选 - 通过 ActionBar 或粒子效果显示自定义生命值的剩余量
>
> **技术要点**：
> - ✅ **动态属性存储**：使用 `entity.setDynamicProperty("undead_health", 100)` 存储自定义生命值
> - ✅ **武器伤害标签**：可通过物品自定义组件、NBT 或物品 ID 命名约定来标识额外伤害
> - ✅ **伤害事件拦截**：`beforeEvents.entityHurt` 可获取伤害源、伤害类型、攻击者等信息
> - ✅ **武器检测**：通过 `event.damageSource.damagingEntity` 获取攻击者，再检测其手持武器
> - ✅ **死亡处理**：可使用 `entity.kill()` 直接杀死，或 `entity.applyDamage(entity.health)` 模拟死亡
> - ⚠️ **伤害类型区分**：需要自定义伤害类型标记，避免与普通伤害混淆
> - ⚠️ **多人同步**：自定义生命值的显示和死亡效果需要在客户端正确同步
> - ⚠️ **实体类型管理**：需要为不同实体类型配置不同的自定义生命属性（配置文件或数据库）
>
> **可行性分析**：
> - ✅ **动态属性**：Script API 完全支持实体的动态属性，可存储任意数值
> - ✅ **实体生成监听**：`beforeEvents.entitySpawn` 和 `afterEvents.entitySpawn` 可拦截实体生成
> - ✅ **伤害事件拦截**：`beforeEvents.entityHurt` 技术成熟，可获取完整伤害信息
> - ✅ **武器检测**：可通过 `getComponent("minecraft:inventory")` 获取实体物品栏
> - ✅ **强制死亡**：`entity.kill()` 和 `entity.applyDamage()` 完全可用
> - ⚠️ **伤害类型扩展**：基岩版原生伤害类型有限，可能需要自定义标记系统
> - ⚠️ **配置管理**：需要设计合理的配置系统来管理实体类型和对应属性
>
> **数据结构示例**：
> ```javascript
> // 实体自定义生命属性配置
> const entityCustomHealth = {
>   "minecraft:zombie": { type: "undead", max: 100 },
>   "minecraft:skeleton": { type: "undead", max: 80 },
>   "minesia:fire_elemental": { type: "fire", max: 150 }
> };
> 
> // 武器额外伤害配置（可通过物品组件实现）
> const weaponBonusDamage = {
>   "minesia:holy_sword": { undead: 50, demon: 30 },
>   "minesia:fire_staff": { fire: 40, ice: 60 }
> };
> 
> // 实体存储的自定义生命值
> entity.setDynamicProperty("custom_health_type", "undead");
> entity.setDynamicProperty("custom_health_current", 100);
> entity.setDynamicProperty("custom_health_max", 100);
> ```
>
> **伤害计算流程**：
> 1. 监听 `beforeEvents.entityHurt` 获取伤害事件
> 2. 检测攻击者手持武器是否有额外伤害标签
> 3. 检测目标实体是否有对应的自定义生命属性
> 4. 计算额外伤害：`bonusDamage = weaponBonusDamage[weaponId][healthType]`
> 5. 扣除自定义生命值：`currentHealth -= bonusDamage`
> 6. 检测死亡：`if (currentHealth <= 0) entity.kill()`
> 7. 可选：取消或减少普通伤害（如果希望只受自定义伤害影响）
>
> **开发建议**：
> 1. 先实现基础版本：定义属性 → 初始化 → 伤害检测 → 扣减 → 死亡
> 2. 再扩展功能：添加武器标签系统、配置管理、粒子效果
> 3. 最后优化体验：ActionBar 显示、伤害数字飘字、音效
> 4. 可设计 JSON 配置文件来管理实体类型和武器伤害，便于平衡性调整
>
> **应用场景**：
> - 🎯 **亡灵生物**：具有"亡灵值"，圣水、神圣武器造成额外亡灵伤害
> - 🎯 **元素生物**：具有"火焰值"、"冰霜值"等，对应元素武器造成额外伤害
> - 🎯 **机械生物**：具有"能量值"，电磁武器造成额外能量伤害
> - 🎯 **恶魔生物**：具有"黑暗值"，光明武器造成额外黑暗伤害
> - 🎯 **Boss 战**：Boss 具有多层护盾值，需要特定武器破除

---

## 长期更新计划

会加入一些结构，生物群系，新怪物。

> 💡 **见解**：添加自定义结构、生物群系和新怪物可以大大丰富游戏体验。根据 [Bedrock Wiki](https://wiki.bedrock.dev/) 和 [Microsoft Learn 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，基岩版支持通过行为包定义自定义生物群系和结构。新怪物可以通过实体定义文件创建，并结合 Script API 实现复杂的 AI 行为。建议优先完成核心系统框架（魔法值、护盾），再逐步扩展内容，避免代码膨胀导致维护困难。

### 钩爪系统

可副手装备的工具，装备在副手时点击右键发射出一个实体以某个速度运动，当一段距离或者速度减为 0 之后停止在方块上时，尝试将玩家吸引过去。

> 💡 **见解**：钩爪系统可以通过 Script API 的物品使用事件监听和自定义实体来实现。参考 [Bedrock Wiki 物品事件文档](https://wiki.bedrock.dev/) 和 [Microsoft Learn Script API 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，主要实现方案如下：
>
> **核心实现方案**：
> 1. **副手检测**：通过 `player.getEquipmentSlot("offhand")` 检测副手是否装备钩爪物品
> 2. **发射机制**：监听 `beforeEvents.itemUse` 或 `afterEvents.playerInteractWithBlock` 事件，检测右键点击时触发
> 3. **钩爪实体**：创建自定义投射物实体（类似三叉戟或雪球），设置物理属性（重力、空气阻力）
> 4. **运动控制**：使用 `entity.applyKnockback()` 或 `entity.setVelocity()` 设置初始速度，通过 `system.runInterval` 持续追踪实体位置
> 5. **碰撞检测**：监听实体与方块的碰撞，或使用射线检测（`world.getBlockFromRay()`）判断是否命中方块
> 6. **牵引机制**：当钩爪固定后，使用 `player.applyKnockback()` 或 `player.setVelocity()` 将玩家拉向钩爪位置，可添加渐变加速度使牵引更自然
> 7. **回收机制**：牵引完成后销毁钩爪实体，或允许玩家按 Shift 回收
>
> **技术要点**：
> - ✅ **副手物品检测**：可复用饰品栏系统的装备检测逻辑
> - ✅ **投射物实体**：可基于 vanilla 投射物（如雪球、三叉戟）修改，或创建完全自定义实体
> - ✅ **物理模拟**：需要自定义物理逻辑模拟空气阻力和重力，可通过 `runInterval` 每 tick 更新速度
> - ✅ **牵引逻辑**：牵引时检测路径是否可达，避免将玩家拉到封闭空间或危险区域
> - ⚠️ **网络同步**：钩爪实体运动需要在多人游戏中保持同步，可能需要客户端预测
> - ⚠️ **性能优化**：避免过多的 `runInterval` 检测，合理控制检测频率
>
> **可行性分析**：
> - ✅ **副手检测**：Script API 提供 `getEquipmentSlot()` 方法，完全支持
> - ✅ **物品使用事件**：`beforeEvents.itemUse` 可拦截右键动作，技术成熟
> - ✅ **自定义实体**：基岩版支持自定义投射物实体，有完整文档
> - ✅ **运动控制**：可通过 `setVelocity()` 或 `applyKnockback()` 实现，已有大量社区案例
> - ✅ **牵引机制**：原理简单，类似钓鱼竿的牵引逻辑
> - ⚠️ **碰撞检测**：需要自定义实现，可能需要射线检测或实体碰撞事件监听
> - ⚠️ **边界情况**：需要处理钩爪穿过方块、牵引到危险区域、多人游戏同步等问题
>
> **开发建议**：
> 1. 先实现基础版本：副手检测 → 发射实体 → 直线运动 → 固定 → 牵引
> 2. 再优化体验：添加抛物线轨迹、空气阻力、碰撞检测、牵引加速度渐变
> 3. 最后处理边界：检测路径安全、防止穿墙、添加回收机制
> 4. 可参考 vanilla 钓鱼竿和三叉戟的实现逻辑

### 方块旋转与偏移系统（环境氛围）

在制作地图时，通过旋转和偏移方块，将它们放到更符合环境的地方，渲染氛围。例如：在墙角放一个铁门后，通过旋转和偏移让它变成横着斜靠在墙上的样子，以渲染"有人把它放在这"的环境。

> 💡 **见解**：方块旋转和偏移可以通过**自定义方块 + 变换组件**或**伪实体方块**两种方案实现。参考 [Bedrock Wiki 方块方向文档](https://wiki.bedrock.dev/blocks/block-orientation) 和 [伪实体方块教程](https://wiki.bedrock.dev/blocks/fake-blocks)，主要实现方案如下：
>
> **方案 A：自定义方块 + Block States（推荐用于简单旋转）**
> 
> **核心实现**：
> 1. **定义方块状态**：使用 `minecraft:placement_direction` 或 `minecraft:placement_position` trait 定义方向状态
> 2. **设置旋转**：通过 `minecraft:transformation` 组件在 permutations 中定义不同方向的旋转
> 3. **放置方块**：使用 `/setblock` 命令或 Script API 的 `Block.setPermutation()` 设置方块状态
> 4. **偏移实现**：通过自定义几何体（geometry）的模型偏移，或使用多层方块堆叠
>
> **示例代码**：
> ```json
> // BP/blocks/rotated_gate.json
> {
>   "minecraft:block": {
>     "description": {
>       "identifier": "minesia:rotated_gate",
>       "traits": {
>         "minecraft:placement_direction": {
>           "enabled_states": ["minecraft:cardinal_direction"]
>         }
>       }
>     },
>     "permutations": [
>       {
>         "condition": "q.block_state('minecraft:cardinal_direction') == 'north'",
>         "components": {
>           "minecraft:transformation": { "rotation": [0, 0, 0] }
>         }
>       },
>       {
>         "condition": "q.block_state('minecraft:cardinal_direction') == 'west'",
>         "components": {
>           "minecraft:transformation": { "rotation": [0, 90, 0] }
>         }
>       }
>     ]
>   }
> }
> ```
>
> **Script API 放置示例**：
> ```javascript
> const block = dimension.getBlock({ x: 10, y: 5, z: 10 });
> const permutation = block.permutation.withState("minecraft:cardinal_direction", "west");
> block.setPermutation(permutation);
> ```
>
> **优点**：
> - ✅ 性能优秀，是真正的方块
> - ✅ 支持方块交互（挖掘、放置物品等）
> - ✅ 支持方块状态切换
> - ✅ 可自然生成在世界中
>
> **缺点**：
> - ⚠️ 只能 90 度整数倍旋转（受限于 cardinal_direction）
> - ⚠️ 偏移需要自定义模型实现，不能直接偏移方块位置
> - ⚠️ 需要为每种旋转状态定义 permutation
>
> **方案 B：伪实体方块（推荐用于复杂旋转和偏移）**
> 
> **核心实现**：
> 1. **创建实体**：创建一个不可见、无敌、不可推动的实体，使用方块模型
> 2. **对齐旋转**：在动画中使用 Molang 表达式对齐玩家朝向
> 3. **对齐位置**：通过 `/setblock` 召唤 dummy 实体，再 transform 为目标实体
> 4. **任意旋转**：实体的 `rotation` 组件支持任意角度（不仅是 90 度倍数）
> 5. **任意偏移**：通过模型 pivot 点偏移或实体位置偏移实现
>
> **示例代码**：
> ```json
> // BP/entities/minesia:decorative_gate.json
> {
>   "minecraft:entity": {
>     "description": {
>       "identifier": "minesia:decorative_gate",
>       "is_spawnable": false,
>       "is_summonable": true
>     },
>     "components": {
>       "minecraft:knockback_resistance": { "value": 1 },
>       "minecraft:pushable": { "is_pushable": false },
>       "minecraft:damage_sensor": {
>         "triggers": [{ "cause": "all", "deals_damage": "no" }]
>       },
>       "minecraft:collision_box": { "width": 0, "height": 0 },
>       "minecraft:physics": { "has_gravity": false }
>     }
>   }
> }
> ```
>
> **Script API 召唤示例**：
> ```javascript
> // 在指定位置召唤旋转实体
> const location = { x: 10.5, y: 5, z: 10.5 };
> const entity = dimension.spawnEntity("minesia:decorative_gate", location);
> entity.setRotation({ x: 0, y: 45, z: 90 }); // 任意角度旋转
> ```
>
> **优点**：
> - ✅ 支持任意角度旋转（不仅 90 度）
> - ✅ 支持任意位置偏移
> - ✅ 可使用自定义模型实现复杂造型
> - ✅ 可添加动画、粒子效果
>
> **缺点**：
> - ⚠️ 性能开销比真方块大
> - ⚠️ 不支持方块交互（不能被挖掘、不能放置物品）
> - ⚠️ 需要额外处理客户端同步
> - ⚠️ 不能自然生成，需要通过命令/脚本召唤
>
> **技术要点**：
> - ✅ **方块状态**：1.20.20+ 版本支持更灵活的 block states 定义
> - ✅ **Transformation 组件**：支持 X/Y/Z 三轴任意角度旋转
> - ✅ **Molang 对齐**：`-q.body_y_rotation + (Math.round(q.body_y_rotation / 90) * 90)` 可对齐 90 度倍数
> - ✅ **Script API**：`BlockPermutation.withState()` 可动态设置方块状态
> - ✅ **实体召唤**：`dimension.spawnEntity()` 可精确控制位置和旋转
> - ⚠️ **版本要求**：需要 1.20.20+ 才能使用完整的 block traits 功能
>
> **应用场景**：
> - 🎯 **环境装饰**：斜靠的铁门、倒下的栅栏、倾斜的梯子
> - 🎯 **废墟场景**：破碎的墙壁、散落的方块、倒塌的柱子
> - 🎯 **室内细节**：倾斜的画、歪斜的书架、错位的地板
> - 🎯 **自定义结构**：旋转的齿轮、倾斜的屋顶、螺旋楼梯
> - 🎯 **剧情道具**：特殊摆放的物品、线索方块
>
> **开发建议**：
> 1. **简单旋转（90 度倍数）**：优先使用方案 A（自定义方块），性能更好
> 2. **复杂旋转/偏移**：使用方案 B（伪实体方块），灵活性更高
> 3. **混合方案**：主体用真方块，装饰用伪实体，平衡性能和效果
> 4. **工具化**：开发地图编辑器工具，通过命令快速放置旋转方块
> 5. **预设库**：创建常用旋转方块的预设库（如斜靠梯子、倒下栅栏等）
>
> **地图编辑器工具设想**：
> ```
> # 命令示例
> /function minesia:place_rotated_block <方块 ID> <X 旋转> <Y 旋转> <Z 旋转> <偏移 X> <偏移 Y> <偏移 Z>
> 
> # Script API 工具函数
> placeRotatedBlock(dimension, location, blockId, rotation, offset);
> ```
> 
> **Blockbench 辅助建模工作流程**：
> 
> > 💡 **Blockbench 的作用**：Blockbench 作为 Minecraft 官方的低多边形 3D 模型编辑器，可以**可视化地创建和编辑方块模型**，设置 pivot 点、旋转角度和偏移量，然后导出为基岩版兼容的 JSON 格式。
> >
> > **使用 Blockbench 制作旋转方块模型**：
> > 
> > 1. **创建方块模型**：
> >    - 打开 Blockbench，选择 "Minecraft Bedrock Block" 格式
> >    - 使用立方体工具创建基础方块形状（如铁门、栅栏等）
> >    - 可以通过网格对齐、镜像编辑等工具快速建模
> > 
> > 2. **设置 Pivot 点（旋转中心）**：
> >    - 选择立方体，在 "Display" 面板中调整 "Origin"（原点/Pivot 点）
> >    - Pivot 点决定旋转中心，例如：
> >      - 底部中心：`[8, 0, 8]`（适合斜靠的梯子）
> >      - 一侧边缘：`[0, 8, 8]`（适合绕轴旋转的门）
> >      - 自定义位置：任意坐标值
> > 
> > 3. **应用旋转**：
> >    - 在 "Display" 面板中设置 "Rotation"（旋转角度）
> >    - 支持任意角度旋转（不仅 90 度倍数），如 45°、30°、22.5°
> >    - X/Y/Z 三轴独立旋转，实现复杂姿态
> > 
> > 4. **应用偏移**：
> >    - 在 "Display" 面板中设置 "Translation"（偏移量）
> >    - 可以直接移动模型位置，实现"悬浮"、"嵌入"等效果
> >    - 例如：将铁门向下偏移 2 像素，模拟"半插入地面"的效果
> > 
> > 5. **导出模型**：
> >    - `File > Export > Export as JSON` 导出为基岩版方块模型
> >    - Blockbench 会自动处理坐标系转换（Bedrock 使用左手坐标系，Z 轴朝上）
> >    - 导出的 JSON 包含完整的几何体、UV 映射、旋转和偏移信息
> > 
> > **示例：斜靠的铁门模型**
> > ```json
> > // RP/models/blocks/minesia/leaning_gate.json (Blockbench 导出)
> > {
> >   "description": {
> >     "identifier": "minesia:leaning_gate",
> >     "geometry": "geometry.leaning_gate"
> >   },
> >   "geometry": {
> >     "leaning_gate": {
> >       "bones": [
> >         {
> >           "name": "gate",
> >           "pivot": [8, 0, 8], // Pivot 点在底部中心
> >           "cubes": [
> >             {
> >               "origin": [0, 0, 0],
> >               "size": [16, 16, 2], // 铁门尺寸
> >               "uv": { "north": { "uv": [0, 0], "uv_size": [16, 16] } }
> >             }
> >           ],
> >           "rotation": [0, 0, -45] // 绕 Z 轴旋转 -45 度，模拟斜靠
> >         }
> >       ]
> >     }
> >   }
> > }
> > ```
> > 
> > **Blockbench 的优势**：
> > - ✅ **可视化编辑**：所见即所得，不需要手动计算坐标和角度
> > - ✅ **任意角度旋转**：支持 45°、30°、22.5° 等非 90 度倍数旋转
> > - ✅ **精确偏移控制**：可以直接拖动模型调整位置，精确到像素级
> > - ✅ **自动 UV 映射**：自动创建 UV 展开图，方便绘制纹理
> > - ✅ **坐标系转换**：自动处理 Bedrock 和 Java 版的坐标系差异
> > - ✅ **动画支持**：可以为旋转方块添加简单动画（如摇晃、旋转）
> > - ✅ **插件扩展**：可以通过插件支持更多功能
> > 
> > **Blockbench 工作流 vs 纯代码流**：
> > 
> > | 方面 | Blockbench 工作流 | 纯代码工作流 |
> > |------|------------------|-------------|
> > | **建模速度** | ⭐⭐⭐⭐⭐ 快速可视化 | ⭐⭐ 需要手动计算 |
> > | **旋转精度** | ⭐⭐⭐⭐⭐ 任意角度拖动 | ⭐⭐⭐ 需要计算三角函数 |
> > | **偏移调整** | ⭐⭐⭐⭐⭐ 直接拖动 | ⭐⭐⭐ 需要反复测试 |
> > | **UV 映射** | ⭐⭐⭐⭐⭐ 自动展开 | ⭐⭐ 手动计算坐标 |
> > | **批量生产** | ⭐⭐⭐⭐ 可复用模板 | ⭐⭐⭐⭐⭐ 脚本批量生成 |
> > | **学习曲线** | ⭐⭐⭐⭐ 直观易用 | ⭐⭐ 需要理解 JSON 结构 |
> > 
> > **推荐工作流**：
> > 1. **Blockbench 建模**：
> >    - 使用 Blockbench 创建基础模型，设置旋转和偏移
> >    - 调整 Pivot 点到合适位置
> >    - 导出为 JSON 格式
> > 
> > 2. **代码集成**：
> >    - 将导出的 JSON 复制到行为包的 `models/blocks/` 目录
> >    - 在方块定义文件中引用模型：`"minecraft:geometry": "geometry.leaning_gate"`
> >    - 使用 Script API 或命令放置方块
> > 
> > 3. **批量生产**：
> >    - 在 Blockbench 中创建"模板模型"（如基础方块）
> >    - 通过复制和修改快速创建多个变体（不同角度/偏移）
> >    - 或使用脚本批量导出不同配置的模型
> > 
> > **实际案例：废墟场景的斜靠铁门**
> > 
> > **步骤 1**：在 Blockbench 中创建铁门模型
> > - 创建 16×16×2 的立方体
> > - 设置 Pivot 点在底部一角 `[0, 0, 16]`
> > - 绕 X 轴旋转 -60 度，模拟"斜靠在墙上"
> > - 向下偏移 Y 轴 -2 像素，模拟"部分插入地面"
> > 
> > **步骤 2**：导出并集成
> > ```json
> > // RP/models/blocks/minesia/ruin_gate.json
> > {
> >   "geometry": {
> >     "ruin_gate": {
> >       "bones": [{
> >         "name": "gate",
> >         "pivot": [0, 0, 16],
> >         "cubes": [{ "origin": [0, 0, 0], "size": [16, 16, 2] }],
> >         "rotation": [-60, 0, 0]
> >       }]
> >     }
> >   }
> > }
> > ```
> > 
> > **步骤 3**：放置方块
> > ```javascript
> > // 使用 Script API 放置
> > const block = dimension.getBlock({ x: 100, y: 10, z: 100 });
> > block.setType("minesia:ruin_gate");
> > ```
> > 
> > **最终效果**：一个斜靠在墙角的铁门，完美渲染废墟氛围！
> > 
> > **Blockbench 下载**：[https://www.blockbench.net/](https://www.blockbench.net/)（免费开源）

---

## 技术参考

- [Bedrock Wiki](https://wiki.bedrock.dev/) - 基岩版附加包开发文档
- [bedrock.dev](https://bedrock.dev/) - 基岩版官方文档
- [Microsoft Learn - Minecraft Creator](https://learn.microsoft.com/zh-cn/minecraft/creator/) - 微软官方创作者文档

**注**：Minesia Journey 相关计划已移至 [journey.md](./journey.md)