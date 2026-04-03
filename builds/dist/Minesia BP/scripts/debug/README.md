# Minesia 调试系统

## 概述

调试系统用于开发阶段的日志输出，支持动态开启/关闭调试模式。调试模式下，日志信息会发送到游戏聊天栏，方便开发者实时查看。

## 调试模式开关

| 指令 | 说明 |
|------|------|
| `scriptevent minesia:debug_on` | 开启调试模式 |
| `scriptevent minesia:debug_off` | 关闭调试模式 |
| `scriptevent minesia:debug_toggle` | 切换调试状态 |
| `scriptevent minesia:debug_status` | 查看当前调试状态 |

## 使用方法

### 导入调试模块

```javascript
import { debug } from "../debug/debugManager.js";
```

### 调试日志方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `debug.log(msg)` | 输出调试信息 | `debug.log("初始化完成")` |
| `debug.logPlayer(player, msg)` | 向特定玩家发送调试信息 | `debug.logPlayer(player, "你的状态已更新")` |
| `debug.logWithTag(tag, msg)` | 带模块标签的调试日志 | `debug.logWithTag("随机伤害", "伤害计算完成")` |
| `debug.logError(tag, msg)` | 错误日志（始终显示） | `debug.logError("系统", "发生错误")` |
| `debug.logWarning(tag, msg)` | 警告日志 | `debug.logWarning("配置", "缺少参数")` |

### 状态检查

```javascript
if (debug.isEnabled()) {
    // 调试模式已开启
}
```

## 示例代码

```javascript
import { debug } from "../debug/debugManager.js";

function processDamage(attacker, target, damage) {
    try {
        // 调试日志 - 仅在调试模式下显示
        debug.logWithTag("伤害系统", `${attacker.name} 攻击 ${target.typeId}，伤害: ${damage}`);
        
        // 执行伤害逻辑...
        
    } catch (error) {
        // 错误日志 - 始终显示
        debug.logError("伤害系统", `处理伤害时出错: ${error.message}`);
    }
}
```

## 开发流程建议

1. **开发阶段**：使用 `scriptevent minesia:debug_on` 开启调试模式
2. **调试完毕**：使用 `scriptevent minesia:debug_off` 关闭调试模式
3. **发布前**：确保调试模式已关闭（默认关闭），避免影响玩家体验

## 注意事项

- 调试模式默认关闭（`isDebugEnabled = false`）
- `logError` 方法始终会输出，不受调试模式影响
- 所有日志都会发送到游戏聊天栏，不会输出到控制台
