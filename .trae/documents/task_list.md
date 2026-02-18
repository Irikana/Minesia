# 任务列表

## 任务一：目录重命名（random_damage → bonus_damage）

### 1.1 文件系统操作
- [ ] 创建新目录 `BP/scripts/bonus_damage/`
- [ ] 移动并重命名 `config.js`
- [ ] 移动并重命名 `randomDamageMain.js` → `bonusDamageMain.js`
- [ ] 移动并重命名 `loreHandler.js`
- [ ] 删除旧目录 `BP/scripts/random_damage/`

### 1.2 代码更新
- [ ] 更新 `config.js` 中的命名（RANDOM_DAMAGE_WEAPONS → BONUS_DAMAGE_WEAPONS）
- [ ] 更新 `bonusDamageMain.js` 中的函数名和日志前缀
- [ ] 更新 `loreHandler.js` 中的导入路径和日志前缀
- [ ] 更新 `main.js` 中的导入路径和函数调用

### 1.3 文档更新
- [ ] 重命名 `random_damage_system.md` → `bonus_damage_system.md`
- [ ] 更新文档中的所有引用和命名

### 1.4 语言文件更新
- [ ] 更新 `zh_CN.lang` 中的本地化键名
- [ ] 更新 `en_US.lang` 中的本地化键名

---

## 任务二：伤害显示系统

### 2.1 创建核心文件
- [ ] 创建 `BP/scripts/damage_display/config.js`
- [ ] 创建 `BP/scripts/damage_display/damageCalculator.js`
- [ ] 创建 `BP/scripts/damage_display/damageDisplayMain.js`

### 2.2 实现伤害计算器
- [ ] 实现伤害追踪 Map
- [ ] 实现附加伤害记录函数
- [ ] 实现伤害获取函数

### 2.3 实现显示系统
- [ ] 实现 ActionBar 显示逻辑
- [ ] 实现显示时长控制（20刻）
- [ ] 实现新攻击覆盖机制
- [ ] 实现自动清除逻辑

### 2.4 集成与初始化
- [ ] 在 `bonusDamageMain.js` 中添加伤害记录
- [ ] 在 `main.js` 中初始化伤害显示系统
- [ ] 添加语言文件条目

### 2.5 文档
- [ ] 创建 `damage_display_system.md` 文档

---

## 执行顺序

1. **阶段一**：目录重命名
   - 先创建新目录和文件
   - 更新代码内容
   - 更新导入引用
   - 删除旧文件

2. **阶段二**：伤害显示系统
   - 创建新目录和文件
   - 实现核心逻辑
   - 集成到现有系统
   - 测试验证

---

## 预计文件变更

| 操作 | 文件路径 |
|------|----------|
| 新建 | `BP/scripts/bonus_damage/config.js` |
| 新建 | `BP/scripts/bonus_damage/bonusDamageMain.js` |
| 新建 | `BP/scripts/bonus_damage/loreHandler.js` |
| 新建 | `BP/scripts/damage_display/config.js` |
| 新建 | `BP/scripts/damage_display/damageCalculator.js` |
| 新建 | `BP/scripts/damage_display/damageDisplayMain.js` |
| 新建 | `BP/docs/bonus_damage_system.md` |
| 新建 | `BP/docs/damage_display_system.md` |
| 修改 | `BP/scripts/main.js` |
| 修改 | `RP/texts/zh_CN.lang` |
| 修改 | `RP/texts/en_US.lang` |
| 删除 | `BP/scripts/random_damage/` (整个目录) |
| 删除 | `BP/docs/random_damage_system.md` |
