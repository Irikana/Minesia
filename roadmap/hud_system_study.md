# Minecraft基岩版自定义HUD系统学习笔记

## 概述

本文档总结了 `Bedrock_Reimagined` 附加包中的自定义HUD实现方式，该系统通过UI JSON和脚本API配合，实现了在屏幕上渲染自定义状态条（血量、饥饿值、口渴值、魔力值等）的功能。

---

## 核心架构

### 1. 数据传输机制

HUD系统使用 `player.onScreenDisplay.setTitle()` API来传输数据到UI层：

```javascript
// 脚本端发送数据
player.onScreenDisplay.setTitle("data,100,95,80,50,20,0,75,100,0,0,100,0,0,100");
```

**数据格式**：`"data,值1,值2,值3,..."` 用逗号分隔

### 2. UI数据接收与解析

在 `hud_screen.json` 中，通过 `data_control` 接收并解析数据：

```json
{
  "data_control": {
    "type": "panel",
    "size": [0, 0],
    "property_bag": {
      "#text1": "",
      "#text2": "",
      "#text3": "",
      // ... 更多变量
      "#split_seperator": ","
    },
    "bindings": [
      {
        "binding_name": "#hud_title_text_string"
      },
      {
        "binding_type": "view",
        "source_property_name": "( #text_0 - $update_string)",
        "target_property_name": "#text1"
      }
      // ... 解析其他值
    ]
  }
}
```

---

## 文件结构

### 资源包 (RP) 文件

```
RP/
├── ui/
│   ├── _ui_defs.json          # UI定义文件列表
│   ├── hud_screen.json        # 主HUD屏幕（修改root_panel）
│   ├── bars_hud.json          # 状态条定义（血量、饥饿、口渴、魔力）
│   ├── bars_hud_fake.json     # 简化版状态条（用于预览）
│   └── form_hud_custom.json   # HUD调整表单界面
│
└── textures/
    └── gui/
        └── hud/
            ├── status_bar_health_full.png      # 血量条纹理
            ├── status_bar_hunger_full.png      # 饥饿条纹理
            ├── status_bar_thirst_full.png      # 口渴条纹理
            ├── status_bar_health_full_white.png # 白色拖尾效果
            ├── bar_food_and_drink_empty.png    # 左侧背景框
            └── bar_health_and_mana_empty.png   # 右侧背景框
```

---

## 状态条实现详解

### 1. 基础状态条结构

```json
{
  "bar_hunger": {
    "type": "panel",
    "anchor_from": "top_left",
    "anchor_to": "top_left",
    "size": ["100%", "100%"],
    "layer": 20,
    "controls": [
      {
        "hunger_bar_control": {
          "type": "panel",
          "use_anchored_offset": true,
          "property_bag": {
            "#multiplier": 0.01,
            "#diff": 0,
            "#changed_value": 0
          },
          "bindings": [
            {
              "binding_type": "view",
              "source_control_name": "data_control",
              "source_property_name": "(#text1)",
              "target_property_name": "#text1"
            },
            {
              "binding_type": "view",
              "source_property_name": "($min * (#text1 - ':'))",
              "target_property_name": "#value_1"
            }
          ]
        }
      }
    ]
  }
}
```

### 2. 状态条动画效果

```json
{
  "increase_anim": {
    "anim_type": "size",
    "from": [0, "100%"],
    "to": ["100%", "100%"],
    "duration": 0.5,
    "easing": "in_out_sine"
  },
  "decrease_anim": {
    "anim_type": "size",
    "from": ["100%", "100%"],
    "to": [0, "100%"],
    "duration": 0.5,
    "easing": "in_out_circ"
  }
}
```

### 3. 动态宽度计算

```json
{
  "bindings": [
    {
      "binding_type": "view",
      "source_property_name": "((#max - #diff) * #multiplier)",
      "target_property_name": "#size_binding_x"
    }
  ]
}
```

---

## 屏幕布局

### 左下角（饥饿 + 口渴）

```json
{
  "hunger_and_drink_panel": {
    "type": "panel",
    "anchor_from": "bottom_left",
    "anchor_to": "bottom_left",
    "size": ["25%", "30.77%x"],
    "controls": [
      {
        "hunger_bar@bars_commons.bar_hunger": {
          "size": ["66.82%", "12.5%"],
          "offset": ["24.639423076926%", "34.375%"]
        }
      },
      {
        "drink_bar@bars_commons.bar_drink": {
          "size": ["66.82%", "12.5%"],
          "offset": ["31.25%", "57.8125%"]
        }
      }
    ]
  }
}
```

### 右下角（血量 + 魔力）

```json
{
  "mana_and_life_panel": {
    "type": "panel",
    "anchor_from": "bottom_right",
    "anchor_to": "bottom_right",
    "size": ["25%", "30.77%x"],
    "controls": [
      {
        "bar_life@bars_commons.bar_life": {
          "size": ["66.82%", "12.5%"],
          "offset": ["-24.39903846%", "34.375%"]
        }
      },
      {
        "bar_mana@bars_commons.bar_mana": {
          "size": ["66.82%", "12.5%"],
          "offset": ["-31.25%", "57.8125%"]
        }
      }
    ]
  }
}
```

---

## 脚本端实现

### 1. 数据发送

```javascript
import { system, world } from "@minecraft/server";

// 定期更新HUD数据
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const hunger = player.getComponent("minecraft:hunger");
    const health = player.getComponent("minecraft:health");
    
    // 构建数据字符串
    const data = `data,${hunger.current},${hunger.previous},${thirst},${prevThirst},${health.current},${prevHealth},${mana},${prevMana},${effectState},${hungryState},${size},${offsetY},${offsetX},${opacity}`;
    
    // 发送到UI
    player.onScreenDisplay.setTitle(data);
  }
}, 2); // 每2tick更新一次
```

### 2. 动态属性存储

```javascript
// 存储玩家数据
player.setDynamicProperty("5fs:mana", 100);
player.setDynamicProperty("5fs:thirst", 100);
player.setDynamicProperty("5fs:maxMana", 100);
player.setDynamicProperty("5fs:maxThirst", 100);
```

---

## 数据索引对照表

| 索引 | 变量名 | 用途 |
|------|--------|------|
| #text1 | 当前饥饿值 | 饥饿条显示 |
| #text2 | 上一帧饥饿值 | 动画计算 |
| #text3 | 当前口渴值 | 口渴条显示 |
| #text4 | 上一帧口渴值 | 动画计算 |
| #text5 | 当前血量值 | 血量条显示 |
| #text6 | 上一帧血量值 | 动画计算 |
| #text7 | 当前魔力值 | 魔力条显示 |
| #text8 | 上一帧魔力值 | 动画计算 |
| #text9 | 状态效果类型 | 纹理切换（中毒/凋零/吸收等）|
| #text10 | 饥饿状态 | 是否饥饿状态 |
| #text11 | HUD大小 | 缩放比例 |
| #text12 | Y偏移 | 垂直位置 |
| #text13 | X偏移 | 水平位置 |
| #text14 | 透明度 | HUD透明度 |

---

## 纹理资源

### 状态条纹理

| 纹理文件 | 用途 |
|----------|------|
| `status_bar_health_full.png` | 普通血量条 |
| `status_bar_absorption_full.png` | 吸收之心血量条 |
| `status_bar_poisoned_full.png` | 中毒血量条 |
| `status_bar_withering_full.png` | 凋零血量条 |
| `status_bar_hunger_full.png` | 普通饥饿条 |
| `status_bar_hungry_full.png` | 饥饿状态条 |
| `status_bar_thirst_full.png` | 口渴条 |
| `status_mana_full.png` | 魔力条 |

### 背景纹理

| 纹理文件 | 用途 |
|----------|------|
| `bar_food_and_drink_empty.png` | 左侧背景框（饥饿+口渴）|
| `bar_health_and_mana_empty.png` | 右侧背景框（血量+魔力）|

---

## 实现自定义HUD的步骤

### 步骤1：创建UI定义文件

1. 在 `RP/ui/` 创建 `hud_screen.json`
2. 修改 `root_panel` 添加自定义控件
3. 在 `_ui_defs.json` 中注册UI文件

### 步骤2：创建状态条组件

1. 创建 `bars_hud.json` 定义状态条组件
2. 设计状态条纹理并放入 `textures/gui/hud/`
3. 创建纹理的JSON元数据文件

### 步骤3：编写脚本逻辑

1. 使用 `system.runInterval()` 定期更新
2. 收集玩家状态数据
3. 格式化为数据字符串并发送

### 步骤4：测试与调试

1. 检查数据是否正确传输
2. 验证UI绑定是否正常工作
3. 调整位置和大小参数

---

## 注意事项

1. **性能考虑**：更新频率不宜过高，建议2-5tick更新一次
2. **数据格式**：确保数据字符串格式正确，避免解析错误
3. **纹理尺寸**：状态条纹理建议使用九宫格切片或固定尺寸
4. **锚点系统**：合理使用 `anchor_from` 和 `anchor_to` 确保在不同分辨率下正常显示
5. **层级管理**：使用 `layer` 属性控制渲染顺序

---

## 参考文件路径

- HUD屏幕：`Project-Corestone_RP/ui/hud_screen.json`
- 状态条定义：`Project-Corestone_RP/ui/bars_hud.json`
- 纹理目录：`Project-Corestone_RP/textures/gui/hud/`
- UI定义列表：`Project-Corestone_RP/ui/_ui_defs.json`
- 脚本文件：`Project-Corestone_BP/scripts/imports.js`
