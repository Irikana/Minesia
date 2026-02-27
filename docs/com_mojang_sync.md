# com.mojang 同步说明

## 概述

本项目通过**符号链接 (Junction)** 将 `BP` 和 `RP` 目录与 Minecraft 的 `com.mojang` 开发包目录同步，实现代码变更后无需手动复制即可直接测试。

## 当前配置

| 项目目录 | com.mojang 目录 |
|---------|----------------|
| `G:\PClite\mcbe_addons_p\bridge\projects\Minesia\BP` | `C:\Users\Administrator\AppData\Roaming\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs\BP` |
| `G:\PClite\mcbe_addons_p\bridge\projects\Minesia\RP` | `C:\Users\Administrator\AppData\Roaming\Minecraft Bedrock\Users\Shared\games\com.mojang\development_resource_packs\RP` |
| `G:\PClite\mcbe_addons_p\bridge\projects\Minesia\BP` | `G:\PClite\LeviMC\versions\1.26.2.01\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs\BP` |
| `G:\PClite\mcbe_addons_p\bridge\projects\Minesia\RP` | `G:\PClite\LeviMC\versions\1.26.2.01\Minecraft Bedrock\Users\Shared\games\com.mojang\development_resource_packs\RP` |

## 工作流程

1. 在任意编辑器（Trae CN、Bridge. 等）中编辑并保存文件
2. 变更即时同步到 com.mojang
3. 启动游戏或执行 `/reload` 即可测试更新

---

## 常见问题

### 1. 符号链接和快捷方式有什么区别？

虽然它们在文件资源管理器中显示相似的图标，但**原理完全不同**：

| 特性 | 符号链接 (Junction) | 快捷方式 (.lnk) |
|------|---------------------|-----------------|
| **系统级别** | 文件系统级别 | Shell/用户界面级别 |
| **应用程序识别** | 所有程序都识别为真实目录 | 只有 Shell 识别，程序看到的是 .lnk 文件 |
| **路径解析** | 操作系统内核自动重定向 | 需要应用程序主动解析 |
| **Minecraft 兼容性** | ✅ 完全兼容 | ❌ 不兼容，游戏无法识别 |
| **透明性** | 对程序完全透明 | 程序需要特殊处理 |

**简单理解：**
- **快捷方式**只是一个指向目标的 `.lnk` 文件，程序需要"知道"如何解析它
- **符号链接**在文件系统层面创建了一个"别名"，操作系统会将所有访问自动重定向到目标，程序无需任何特殊处理

这就是为什么 Minecraft 能正确读取符号链接中的资源包，但无法识别快捷方式。

### 2. 如何取消同步？

以**管理员身份**运行 PowerShell，执行以下命令：

```powershell
# 删除符号链接（不会删除源文件）
Remove-Item "C:\Users\Administrator\AppData\Roaming\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs\BP"
Remove-Item "C:\Users\Administrator\AppData\Roaming\Minecraft Bedrock\Users\Shared\games\com.mojang\development_resource_packs\RP"
Remove-Item "G:\PClite\LeviMC\versions\1.26.2.01\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs\BP"
Remove-Item "G:\PClite\LeviMC\versions\1.26.2.01\Minecraft Bedrock\Users\Shared\games\com.mojang\development_resource_packs\RP"
```

**注意：**
- 删除符号链接**不会**影响项目源文件
- 如需恢复手动同步，只需将 BP 和 RP 复制到对应目录即可

---

## 技术细节

### 创建命令参考

```powershell
# 创建 Junction 符号链接
New-Item -ItemType Junction -Path "<链接路径>" -Target "<目标路径>"
```

### Junction vs SymbolicLink

本项目使用 `Junction` 而非 `SymbolicLink`，原因：
- Junction 不需要管理员权限即可创建（目录链接）
- Junction 对 Windows 版本兼容性更好
- Junction 只能链接目录，不能链接文件（符合我们的需求）

---

## 相关文件

- 项目配置：`config.json`
- 行为包：`./BP`
- 资源包：`./RP`
