# 通用 Lore 系统

## 概述

通用 Lore 系统（Lore System）是一个独立的物品描述管理系统，为 Minecraft 基岩版提供统一的物品 Lore 处理框架。各模块可以通过注册处理器的方式为特定物品添加自定义 Lore 描述，支持本地化显示。

### 设计理念

- **模块化设计**：各功能模块独立注册自己的 Lore 处理器
- **处理器优先级**：支持优先级排序，控制 Lore 行的显示顺序
- **本地化支持**：根据玩家语言设置显示不同语言的 Lore
- **防重复机制**：自动检测已有 Lore，避免重复添加
- **独立运行**：与附加伤害系统的 Lore 处理并存，互不干扰

---

## 文件结构

```
BP/scripts/lore_system/
├── index.js           # 入口文件，导出公共 API
├── loreRegistry.js    # 处理器注册中心
└── loreManager.js     # 核心管理器
```

---

## 核心概念

### 1. LoreRegistry（处理器注册中心）

各模块通过 `LoreRegistry.register()` 注册自己的处理器：
```javascript
import { LoreRegistry } from "../lore_system/index.js";

LoreRegistry.register("handler_id", {
    priority: 10,
    description: "处理器描述",
    
    canHandle(itemStack, context) {
        // 返回 true 表示这个处理器可以处理这个物品
        return itemStack.typeId === "minecraft:diamond_sword";
    },
    
    hasLore(currentLore, itemStack, context) {
        // 返回 true 表示物品已有此 Lore，跳过处理
        return currentLore.some(line => line.includes("我的文本"));
    },
    
    generateLore(itemStack, context) {
        // 返回要添加的 Lore 行（字符串或数组）
        return "§b这是我的自定义 Lore";
    }
});
```

### 2. LoreManager（核心管理器）

提供统一的 Lore 处理方法：

| 方法 | 用途 |
|------|------|
| `processItem(itemStack, context)` | 处理单个物品 |
| `processContainer(container, context)` | 处理容器内所有物品 |
| `processPlayerInventory(player)` | 处理玩家背包 |
| `processDroppedItem(entity)` | 处理掉落物实体 |
| `getLocale(player)` | 获取玩家语言设置 |
| `createLoreLine(text, color)` | 创建带颜色的 Lore 行 |
| `setItemLore(itemStack, lore)` | 设置物品 Lore |

### 3. 处理器结构

每个处理器必须包含以下属性：

| 属性/方法 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `priority` | number | 否 | 优先级，数字越小越先处理，默认 100 |
| `description` | string | 否 | 处理器描述信息 |
| `canHandle` | function | 是 | 判断是否处理该物品 |
| `hasLore` | function | 是 | 判断物品是否已有此 Lore |
| `generateLore` | function | 是 | 生成 Lore 内容 |

---

## 如何注册处理器

### 基础示例

```javascript
import { LoreRegistry } from "../lore_system/index.js";

LoreRegistry.register("my_custom_lore", {
    priority: 50,
    description: "自定义物品 Lore",
    
    canHandle(itemStack, context) {
        return itemStack.typeId.startsWith("minesia:");
    },
    
    hasLore(currentLore, itemStack, context) {
        return currentLore.some(line => line.includes("自定义标签"));
    },
    
    generateLore(itemStack, context) {
        return "§6自定义标签 - Minesia 物品";
    }
});
```

### 本地化示例

```javascript
import { LoreRegistry } from "../lore_system/index.js";

const LOCALE_TEXTS = {
    zh_CN: {
        setEffect: "套装效果",
        bonus: "加成"
    },
    en_US: {
        setEffect: "Set Effect",
        bonus: "Bonus"
    }
};

function getText(locale) {
    return LOCALE_TEXTS[locale] || LOCALE_TEXTS.zh_CN;
}

LoreRegistry.register("set_effect_lore", {
    priority: 20,
    
    canHandle(itemStack, context) {
        return isSetEquipment(itemStack.typeId);
    },
    
    hasLore(currentLore, itemStack, context) {
        const text = getText(context.locale);
        return currentLore.some(line => line.includes(text.setEffect));
    },
    
    generateLore(itemStack, context) {
        const text = getText(context.locale);
        const setName = getSetName(itemStack.typeId);
        
        return [
            `§6${text.setEffect}: ${setName}`,
            `§7- ${text.bonus}: +10% 伤害`
        ];
    }
});
```

### 多行 Lore 示例

```javascript
LoreRegistry.register("weapon_info", {
    priority: 30,
    
    canHandle(itemStack, context) {
        return itemStack.typeId.includes("sword");
    },
    
    hasLore(currentLore, itemStack, context) {
        return currentLore.some(line => line.includes("武器信息"));
    },
    
    generateLore(itemStack, context) {
        return [
            "§e═══ 武器信息 ═══",
            "§7攻击速度: §b1.6",
            "§7攻击范围: §b3.0",
            "§7耐久度: §a良好"
        ];
    }
});
```

---

## Context 上下文对象

在处理器的方法中，`context` 对象提供以下信息：

| 属性 | 类型 | 说明 |
|------|------|------|
| `locale` | string | 玩家当前语言设置（zh_CN / en_US） |
| `player` | Player | 触发处理的玩家对象（可选） |
| `isDropped` | boolean | 是否为掉落物（可选） |
| `currentLore` | string[] | 物品当前的 Lore 数组 |

---

## 自动触发机制

系统会在以下时机自动处理物品：

| 触发时机 | 说明 |
|----------|------|
| 玩家加入服务器 | 延迟 20 tick 后检查背包 |
| 物品掉落 | 延迟 1 tick 后处理掉落物 |
| 定期检查 | 默认每 100 tick（5秒）检查所有在线玩家背包 |

### 自定义检查间隔

```javascript
import { initializeLoreSystem } from "./lore_system/index.js";

// 设置检查间隔为 200 tick（10秒）
initializeLoreSystem({ checkInterval: 200 });
```

---

## 手动调用 API

### 处理单个物品

```javascript
import { LoreManager } from "./lore_system/index.js";

const processedItem = LoreManager.processItem(itemStack, { 
    locale: "zh_CN",
    player: player 
});
```

### 处理玩家背包

```javascript
LoreManager.processPlayerInventory(player);
```

### 处理容器

```javascript
const container = player.getComponent('minecraft:inventory').container;
LoreManager.processContainer(container, { locale: "zh_CN" });
```

### 获取玩家语言

```javascript
const locale = LoreManager.getLocale(player);
// 返回 "zh_CN" 或 "en_US"
```

### 创建 Lore 行

```javascript
const line = LoreManager.createLoreLine("这是文本", "§b");
// 返回 "§b这是文本"
```

---

## 与其他系统的关系

### 与附加伤害系统的关系

通用 Lore 系统与附加伤害系统的 Lore 处理是**独立并存**的：

```
┌─────────────────────────────────────────────────────────────┐
│                   物品 Lore 处理                            │
├─────────────────────────────────────────────────────────────┤
│ 附加伤害系统 Lore                     通用 Lore 系统         │
│ (bonus_damage/loreHandler.js)        (lore_system/)        │
│                                                            │
│ - 处理附加伤害武器                    - 处理注册的处理器     │
│ - 独立的检测逻辑                      - 模块化注册          │
│ - 与通用系统并存                      - 可扩展              │
└─────────────────────────────────────────────────────────────┘
```

两个系统可以同时为同一物品添加不同的 Lore 行，互不干扰。

### 在 main.js 中的初始化

```javascript
import { initializeLoreSystem } from "./lore_system/index.js";

// 初始化通用 Lore 系统
initializeLoreSystem({ checkInterval: 100 });
```

---

## 完整示例：套装效果 Lore

### 步骤 1：创建处理器文件

```javascript
// BP/scripts/set_effect/setEffectLoreHandler.js
import { LoreRegistry } from "../lore_system/index.js";

const SET_EQUIPMENT = {
    "minesia:steel_helmet": { set: "steel", slot: "head" },
    "minesia:steel_chestplate": { set: "steel", slot: "chest" },
    "minesia:steel_leggings": { set: "steel", slot: "legs" },
    "minesia:steel_boots": { set: "steel", slot: "feet" },
    "minesia:dragon_helmet": { set: "dragon", slot: "head" },
    // ... 更多套装装备
};

const SET_INFO = {
    steel: {
        name: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        bonus: { zh_CN: "+10% 伤害减免", en_US: "+10% Damage Reduction" }
    },
    dragon: {
        name: { zh_CN: "龙鳞套装", en_US: "Dragon Set" },
        bonus: { zh_CN: "+20% 攻击伤害", en_US: "+20% Attack Damage" }
    }
};

function getSetInfo(itemId) {
    return SET_EQUIPMENT[itemId];
}

export function registerSetEffectLoreHandler() {
    LoreRegistry.register("set_effect_lore", {
        priority: 20,
        description: "套装效果 Lore 处理器",
        
        canHandle(itemStack, context) {
            return getSetInfo(itemStack.typeId) !== undefined;
        },
        
        hasLore(currentLore, itemStack, context) {
            const info = getSetInfo(itemStack.typeId);
            const setText = SET_INFO[info.set].name[context.locale] || 
                           SET_INFO[info.set].name.zh_CN;
            return currentLore.some(line => line.includes(setText));
        },
        
        generateLore(itemStack, context) {
            const info = getSetInfo(itemStack.typeId);
            const setData = SET_INFO[info.set];
            const locale = context.locale || "zh_CN";
            
            const setName = setData.name[locale] || setData.name.zh_CN;
            const bonusText = setData.bonus[locale] || setData.bonus.zh_CN;
            
            return [
                `§6§l${setName}`,
                `§7- ${bonusText}`
            ];
        }
    });
    
    console.log('[SetEffect] Lore 处理器已注册');
}
```

### 步骤 2：在 main.js 中注册

```javascript
import { initializeLoreSystem } from "./lore_system/index.js";
import { registerSetEffectLoreHandler } from "./set_effect/setEffectLoreHandler.js";

system.runTimeout(() => {
    // 先初始化通用 Lore 系统
    initializeLoreSystem({ checkInterval: 100 });
    
    // 注册套装效果 Lore 处理器
    registerSetEffectLoreHandler();
    
    console.log('[Minesia] 所有 Lore 系统就绪');
}, 20);
```

---

## 辅助函数

### `LoreRegistry.register(handlerId, handler)`

注册新的 Lore 处理器。
```javascript
LoreRegistry.register("my_handler", {
    priority: 10,
    canHandle: (item) => true,
    generateLore: (item, ctx) => "Lore text"
});
```

### `LoreRegistry.unregister(handlerId)`

注销指定的处理器。
```javascript
LoreRegistry.unregister("my_handler");
```

### `LoreRegistry.getHandler(handlerId)`

获取指定的处理器。
```javascript
const handler = LoreRegistry.getHandler("my_handler");
```

### `LoreRegistry.getAllHandlers()`

获取所有已注册的处理器（按优先级排序）。
```javascript
const handlers = LoreRegistry.getAllHandlers();
```

### `LoreRegistry.getHandlersForItem(itemStack, context)`

获取可以处理指定物品的所有处理器。
```javascript
const handlers = LoreRegistry.getHandlersForItem(itemStack, { locale: "zh_CN" });
```

---

## 注意事项

1. **处理器 ID 唯一性**：每个处理器的 ID 必须唯一，重复注册会覆盖之前的处理器
2. **优先级排序**：处理器按 priority 从小到大排序执行
3. **防重复检测**：建议实现 `hasLore` 方法，避免重复添加相同的 Lore
4. **克隆机制**：系统会自动克隆物品后再设置 Lore，无需手动克隆
5. **错误处理**：处理器中的错误会被捕获并记录，不会影响其他处理器的执行
6. **语言切换**：玩家切换语言后，需要重新进入背包或等待定期检查才能更新 Lore

---

## 调试

系统会在控制台输出日志信息：

- 系统初始化：`[LoreSystem] Lore系统初始化完成`
- 处理器注册：`[LoreRegistry] 处理器 "handler_id" 已注册`
- 处理错误：`[LoreManager] 处理器 handler_id 生成Lore出错: 错误信息`
- 定期检查错误：`[LoreSystem] 定期检查出错: 错误信息`

### 查看已注册的处理器

```javascript
const handlers = LoreRegistry.getAllHandlers();
console.log(`已注册 ${handlers.length} 个处理器:`);
handlers.forEach(h => {
    console.log(`- ${h.id} (优先级: ${h.priority})`);
});
```
