# Minesia 近期更新计划

> 此文件记录近期开发计划和框架搭建工作。

---

## 近期更新计划

继续搭框架，加入魔法值系统，护盾系统。

### 魔法值系统

魔法值就是有些武器攻击或释放技能消耗的东西，增加可玩性。

> 💡 **见解**：魔法值系统可以通过 Script API 的动态属性（Dynamic Properties）来实现。动态属性比计分板更适合存储玩家数据，因为它不会受到计分板刷新的影响，且支持更复杂的数据类型。参考 [Bedrock Wiki Scripting 文档](https://wiki.bedrock.dev/)，可以使用 `player.setDynamicProperty()` 和 `player.getDynamicProperty()` 来管理魔法值。ActionBar 可以显示当前魔法值状态，与体力系统类似。

### 护盾系统

护盾系统就是在攻击事件发生之前优先将伤害转移到其数值的减少，考虑到基岩版没有开放玩家属性接口，不能直接堆血量设计出来的。

> 💡 **见解**：护盾系统可以通过监听 `system.beforeEvents.entityHurt` 事件，在伤害应用前拦截并修改伤害值来实现。这种方式比直接修改玩家属性更加灵活可控。护盾值同样可以使用动态属性存储，并在 ActionBar 中显示护盾状态。参考 [Microsoft Learn 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，`entityHurt` 事件允许在伤害计算前进行处理，可以完全取消伤害或减少伤害值。

---

## 长期更新计划

会加入一些结构，生物群系，新怪物。

我本没打算

> 💡 **见解**：添加自定义结构、生物群系和新怪物可以大大丰富游戏体验。根据 [Bedrock Wiki](https://wiki.bedrock.dev/) 和 [Microsoft Learn 文档](https://learn.microsoft.com/zh-cn/minecraft/creator/)，基岩版支持通过行为包定义自定义生物群系和结构。新怪物可以通过实体定义文件创建，并结合 Script API 实现复杂的 AI 行为。建议优先完成核心系统框架（魔法值、护盾），再逐步扩展内容，避免代码膨胀导致维护困难。

---

## 技术参考

- [Bedrock Wiki](https://wiki.bedrock.dev/) - 基岩版附加包开发文档
- [bedrock.dev](https://bedrock.dev/) - 基岩版官方文档
- [Microsoft Learn - Minecraft Creator](https://learn.microsoft.com/zh-cn/minecraft/creator/) - 微软官方创作者文档
