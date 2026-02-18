# 检查列表

## 阶段一：目录重命名检查

### 文件系统检查
- [ ] 确认 `BP/scripts/bonus_damage/` 目录已创建
- [ ] 确认 `BP/scripts/random_damage/` 目录已删除
- [ ] 确认所有文件已正确移动

### 代码检查
- [ ] `config.js` 中 `BONUS_DAMAGE_WEAPONS` 常量已定义
- [ ] `bonusDamageMain.js` 中 `initializeBonusDamageSystem` 函数已导出
- [ ] `loreHandler.js` 中导入路径已更新为 `./config.js`
- [ ] `main.js` 中导入路径已更新为 `./bonus_damage/bonusDamageMain.js`
- [ ] `main.js` 中函数调用已更新为 `initializeBonusDamageSystem()`

### 日志检查
- [ ] 所有日志前缀已从 `[RandomDamage]` 更新为 `[BonusDamage]`

### 文档检查
- [ ] `bonus_damage_system.md` 文件已创建
- [ ] `random_damage_system.md` 文件已删除
- [ ] 文档内容中所有命名已更新

### 语言文件检查
- [ ] `zh_CN.lang` 中本地化键名已更新
- [ ] `en_US.lang` 中本地化键名已更新

---

## 阶段二：伤害显示系统检查

### 文件系统检查
- [ ] `BP/scripts/damage_display/` 目录已创建
- [ ] `config.js` 文件已创建
- [ ] `damageCalculator.js` 文件已创建
- [ ] `damageDisplayMain.js` 文件已创建

### 功能检查
- [ ] 攻击实体时 ActionBar 显示伤害
- [ ] 显示颜色为白色 `§f`
- [ ] 显示持续时间为 20 游戏刻
- [ ] 新攻击能覆盖当前显示
- [ ] 显示格式正确

### 集成检查
- [ ] `bonusDamageMain.js` 中记录附加伤害
- [ ] `main.js` 中初始化伤害显示系统
- [ ] 两个系统数据共享正常

### 语言文件检查
- [ ] `zh_CN.lang` 中添加伤害显示相关条目
- [ ] `en_US.lang` 中添加伤害显示相关条目

### 文档检查
- [ ] `damage_display_system.md` 文件已创建
- [ ] 文档内容完整

---

## 最终验证

### 编译检查
- [ ] 无语法错误
- [ ] 无导入错误
- [ ] 无运行时错误

### 功能测试
- [ ] 附加伤害系统正常工作
- [ ] Lore 正确显示
- [ ] 伤害显示正常工作
- [ ] 语言切换正常

### 性能检查
- [ ] 无内存泄漏
- [ ] 无重复事件订阅
- [ ] 定时器正确清理

---

## 回滚计划

如果出现问题，按以下步骤回滚：

1. 恢复 `random_damage` 目录
2. 恢复 `main.js` 中的导入
3. 删除 `damage_display` 目录
4. 恢复语言文件
