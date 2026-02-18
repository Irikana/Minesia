# 修改hud_screen.json布局计划

## 分析当前布局
- 热键栏(hotbar)当前水平布局在屏幕底部中央
- 生命值、饥饿值当前水平布局在屏幕底部中央
- 经验值条当前在热键栏上方

## 修改内容

### 1. 修改热键栏(hotbar)布局
- 将`hotbar_panel`的方向从水平改为垂直
- 修改锚点为屏幕左上角
- 调整大小和位置

### 2. 修改生命值和饥饿值布局
- 修改`centered_gui_elements_at_bottom_middle`中相关元素的布局
- 将生命值、饥饿值改为垂直排列
- 移动到屏幕左上角

### 3. 修改经验值条布局
- 找到经验值条相关的控制元素
- 放大一倍大小
- 移动到屏幕顶端中央

### 4. 删除所有注释
- 移除文件中的所有注释行

## 具体修改点
1. **hotbar_panel** - 修改orientation为vertical，调整anchor和offset
2. **centered_gui_elements_at_bottom_middle** - 调整heart_rend、hunger_rend等元素的位置和排列方式
3. **exp_progress_bar_and_hotbar** - 修改大小和位置
4. 全局删除所有注释行

## 预期效果
- PC端热键栏垂直显示在屏幕左上角
- 生命值和饥饿值垂直显示在屏幕左上角
- 经验值条放大一倍显示在屏幕顶端中央
- 文件中无注释，保持简洁