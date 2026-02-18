# 版本提示UI转换计划

## 目标
将当前使用ActionBar显示的版本提示UI转换为JSON UI，并将位置移动到屏幕左上角。

## 实现步骤

### 1. 创建JSON UI定义文件
- 在 `RP/ui` 目录下创建 `version_display.json` 文件
- 定义一个简单的UI布局，包含文本元素
- 设置UI位置为屏幕左上角
- 配置文本样式和格式

### 2. 修改UI显示脚本
- 更新 `BP/scripts/uiDisplay.js` 文件
- 替换 `setActionBar` 方法为JSON UI显示
- 使用 `player.onScreenDisplay.setUI` 方法加载JSON UI
- 保持版本信息的实时更新机制

### 3. 确保资源包配置正确
- 确保 `RP/manifest.json` 中包含UI模块
- 验证JSON UI文件路径和命名规范

### 4. 测试和验证
- 确保UI在游戏中正确显示
- 验证版本信息更新正常
- 确认UI位置在屏幕左上角

## 技术要点
- 使用Minecraft Bedrock的JSON UI系统
- 正确设置UI的锚点和偏移量以实现左上角定位
- 保持与当前版本信息显示逻辑的兼容性
- 确保UI在不同屏幕尺寸下的适应性