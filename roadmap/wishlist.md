# Minesia 长期期望清单

> 此文件记录长期待办、期望功能和未来想法。
> 当遇到技术限制或暂时无法实现的功能时，记录在此以便后续跟进。

---

## UI/显示系统

### 1. 自定义字体图标系统
**状态**: 待研究  
**优先级**: 中  
**创建日期**: 2026-02-25

**描述**:
通过自定义字体文件实现自定义图标显示在ActionBar中。

**技术方案**:
1. 创建自定义字体纹理图（PNG格式）
2. 将自定义图标绘制在特定字符位置
3. 在资源包中注册字体文件
4. 在ActionBar文本中使用对应字符显示图标

**当前限制**:
- Bedrock Edition的字体系统与Java Edition不同
- 需要验证Bedrock是否支持自定义字体覆盖
- ActionBar可能不支持自定义字体渲染

**参考资料**:
- [Minecraft Wiki - Font](https://minecraft.fandom.com/wiki/Resource_pack#Fonts)
- [Bedrock Wiki - JSON UI](https://wiki.bedrock.dev/json-ui/json-ui-documentation)

**关联文件**:
- `BP/scripts/stamina/staminaMain.js` - 体力条显示
- `BP/scripts/damage_display/damageDisplayMain.js` - 伤害显示
- `BP/scripts/minesia_level/level_system.js` - 等级显示

---

### 2. 动态进度条纹理
**状态**: 技术限制  
**优先级**: 高  
**创建日期**: 2026-02-25

**描述**:
使用JSON UI的`clip_ratio`实现真正的动态进度条纹理显示。

**期望效果**:
- 体力条使用自定义纹理，根据体力值动态裁剪显示
- 创世等级进度条使用自定义纹理
- 伤害显示使用动态效果

**当前限制**:
- JSON UI无法读取脚本API的数据
- JSON UI无法读取计分板分数值
- 只能绑定游戏内置变量（如`#exp_progress`）

**可行替代方案**:
- 借用原版经验条显示（但会影响游戏行为）
- 继续使用ActionBar文本显示

---

## 其他期望功能

*（后续添加更多期望功能）*

---

## 格式说明

每个期望功能应包含：
- **状态**: 待研究/技术限制/计划中/进行中
- **优先级**: 高/中/低
- **创建日期**: YYYY-MM-DD
- **描述**: 功能描述
- **技术方案**: 可能的实现方式
- **当前限制**: 无法实现的原因
- **参考资料**: 相关文档链接
- **关联文件**: 项目中相关的代码文件
