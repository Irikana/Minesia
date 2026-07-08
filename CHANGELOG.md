# Minesia 更新日志

## [0.0.17] - 2026-06-15

### 修复
- **创世经验不断累加 bug**：首次获取经验后经验和等级持续增加直到升级
  - `lastExp` 现在始终更新，防止重复计算增量
  - `minesiaTotalExp` 初始值从 `currentExp` 改为 `0`，避免将已有原版经验一次性计入
  - 使用 `Math.floor()` 防止浮点数精度误差
  - 首次初始化后 `continue` 跳过，不计算增量
  - 重登时从计分板恢复已保存的经验值，避免等级重置
- **体力系统创造模式判断错误**：`GameMode.Creative`（不存在）改为 `GameMode.creative`，创造模式玩家现在正确跳过体力消耗
- **语言选择弹窗无限弹出**：用户关闭弹窗时默认设为中文，不再递归重试；弹窗出错时默认中文
- **属性面板 RawMessage 类型错误**：`zh_CN` 配置缺少 `settings` 字段已补全；`ActionFormData` 不再使用 `divider/header/label` 方法，改用 `body()` 展示属性信息
- **`level_system.js` 缺少 `getPlayerLocale` 导入**：已添加
- **Script API 版本兼容性**：从 2.9.0 降级到 2.7.0 稳定版，移除所有 beta API 依赖

### 变更
- Script API 依赖版本锁定为 `@minecraft/server` 2.7.0 / `@minecraft/server-ui` 2.0.0（稳定版）
- 饰品栏系统从事件监听改为轮询模式（`playerInventoryItemChange` 为 beta API）
- 体力系统食物恢复从 `playerInventoryItemChange` 改为 `itemCompleteUse` 事件
- 属性面板物品锁定从 `ItemLockMode`（beta API）改为轮询确保物品不被移走
- 等级显示刷新间隔从 50ms 改为 5000ms
- BP/RP 版本号从 0.0.16 升级到 0.0.17
