---
name: "minesia-dev-guide"
description: "Loads Minesia development guide as context. Invoke when modifying code in the Minesia project to ensure adherence to project conventions."
---

# Minesia Development Guide

This skill automatically loads the Minesia development guide when working on the Minesia project.

## When to Invoke

Invoke this skill when:
- Modifying any code files in the Minesia project
- Creating new items, weapons, or features
- Working with scripts in the BP/scripts directory
- Updating language files (RP/texts/*.lang)
- Making changes to manifest files
- Working with subpacks
- Creating or updating changelogs
- Building the addon

## Official Documentation References

| Type | Link | Description |
|------|------|-------------|
| Bedrock Add-Ons | https://learn.microsoft.com/en-us/minecraft/creator/ | Official Minecraft Bedrock Add-On docs |
| Bedrock Script API | https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/ | Script API reference |
| Bedrock Entity Docs | https://wiki.bedrock.dev/ | Community-maintained entity docs |
| Minecraft Wiki | https://minecraft.wiki/ | Minecraft Wiki (Bedrock content) |
| Bedrock.dev | https://bedrock.dev/ | Official Bedrock documentation |

## Key Conventions Summary

### Item Registration Rules
- **Random Damage**: Register to `scripts/random_damage`
- **Stamina Cost**: Register to `scripts/stamina`
- **Custom Events**: Register to `scripts/custom_events`
- **Critical Hit**: Register to `scripts/critical_hit`
- **Lore Descriptions**: Configure via language files (RP/texts/*.lang)

### Lore Description Format
- Use `~LINEBREAK~` for line breaks
- Color codes: §9 (blue/primary), §c (red/stamina), §e (yellow/crit), §7 (gray/secondary)
- Order: Attack Damage → Stamina Cost → Crit Rate → Set/Offhand Effects → Custom Events → Flavor Text
- Accessory slot description:
  - Chinese: `§9副手或背包第一行时:`
  - English: `§9When in offhand or inventory row 1:`
- **No Unicode characters** (e.g. emoji) in descriptions — they break vanilla font rendering

### Weapon Damage Rules
- Sword: x (fixed value, vanilla baseline)
- Scythe: x+1 ~ x+x/2 (higher than sword of same material)
- Scythe weapons default to triggering the scythe sweep event; no need to add to lore unless explicitly stated

### Material Weapon Damage Table

| Material | Vanilla Sword (x) | Dagger Range | Scythe Range |
|----------|------------------|-------------|-------------|
| Wood/Gold | 4 | 1~4 | 5~6 |
| Copper | - | 2~5 | 6~7 |
| Stone | 5 | 2~5 | 6~7.5 |
| Iron | 6 | 3~6 | 7~9 |
| Steel | - | 4~7 | 9~12 |
| Diamond | 7 | 4~7 | 8~10.5 |
| Netherite | 8 | 5~8 | 9~12 |

### Debug Standards
- Use `world.sendMessage()` or `player.sendMessage()` instead of console.log
- Use scriptevent for custom commands: `scriptevent minesia:debug_on/off/status`
- Built-in debug system at `scripts/debug` with `debug.log()`, `debug.logPlayer()`, `debug.logWithTag()`

### Version Number Format
- Format: `长期版本号.主要版本号.寻常版本号` (e.g., 0.0.13)
- Default: increment 寻常版本号 only
- Incrementing 主要版本号 resets 寻常版本号 to 0
- Incrementing 长期版本号 resets both 主要版本号 and 寻常版本号 to 0

### Subpack Synchronization
- Easy: `BP/subpacks/Easy/` (25% reward increase)
- Very Easy: `BP/subpacks/Very Easy/` (50% reward increase)
- Sync changes to subpacks when modifying main pack
- When modifying scripts, check if subpacks contain the same file and sync accordingly

### Currency Value Mapping

| Currency | Equivalent |
|----------|-----------|
| 1 Emerald Coin | ≈ 8 Diamond Coins |
| 1 Diamond Coin | ≈ 9 Gold Coins |
| 1 Gold Coin | ≈ 8 Silver Coins |
| 1 Silver Coin | ≈ 11 Stone Coins |
| 1 Stone Coin | ≈ 14 Wooden Coins |

**Item Values:**

| Item | Equivalent |
|------|-----------|
| 1 Rotten Flesh | ≈ 1 Wooden Coin |
| 1 Iron Ingot | ≈ 4 Stone Coins |
| 1 Gold Ingot | ≈ 5 Silver Coins |
| 1 Diamond | ≈ 3 Gold Coins |
| 1 Netherite Ingot | ≈ 4 Diamond Coins |

> ⚠️ Ruby Coin is a mysterious illegal currency — never create any acquisition path for it unless explicitly stated.

### Function Module Management

| Module | Directory | Description |
|--------|-----------|-------------|
| Random Damage | `scripts/random_damage` | All damage-related logic |
| Stamina | `scripts/stamina` | All stamina-related logic |
| Set Effects | `scripts/set_effect` | Custom events triggered by equipment slots |
| Lore Descriptions | `RP/texts/*.lang` | Static configuration via language files |
| Debug System | `scripts/debug` | Debug mode management with dynamic on/off |
| Critical Hit | `scripts/critical_hit` | Crit rate management and crit damage calculation |
| Attribute Panel | `scripts/attribute_panel` | Player attribute display panel (DDUI framework) |
| Accessory Slot | `scripts/accessory` | Accessory slot management, offhand items trigger effects in inventory row 1 |

### Directory Notes
- `builds/` — Only for bridge quick builds; does not affect development or debugging; should be ignored during development

### Document Terminology Standards
- **Minesia Level**: Use "Minesia Level" not "Creation Level"
- **Project Name**: Use "Minesia" or "创世" consistently
- Maintain terminology consistency across all documentation

### Changelog Convention
- Location: `changelogs/zh_CN/` for Chinese, `changelogs/en_US/` for English
- Plan files: `plan.md` with `*` prefix for pending items; remove `*` after completion
- Format: Version → Date → *** → Category → Content
- Style: Casual, natural language
- Use bullet points (`-`) for listing items
- Blank line between paragraphs for proper Markdown rendering
- **Net Change Principle**: Errors found and fixed within the same version are NOT recorded in changelog. Changelog should only contain net changes between current and previous version

### Build Convention
1. Check all pending items (with `*`) are completed before building
2. Set the date in the Chinese plan.md to the current Beijing time
3. Create English changelog in `changelogs/en_US/`
4. Rename `plan.md` to `.md` (remove plan prefix)
5. Update manifest version numbers in both BP and RP
6. Build as `Minesia [version].mcaddon`
7. Create next version's `plan.md` in `changelogs/zh_CN/`

### When to Stop and Ask
- **Technical limitations**: Script API doesn't support certain features
- **Uncertain implementation**: Multiple viable approaches exist
- **Ambiguous requirements**: Feature requirements have multiple interpretations
- **Dependency issues**: Need confirmation before introducing new dependencies or modifying existing structure

## Full Guide Location

The complete development guide is located at:
`docs/开发指南.md`

Always read this file before making any code changes to ensure compliance with project conventions.
