---
name: "minesia-script-dev"
description: "Loads Minesia script development conventions. Invoke when working with scripts in the Minesia project to ensure adherence to module management and debugging standards."
---

# Minesia Script Development Guide

This skill loads script development conventions when working with scripts in the Minesia project.

## When to Invoke

Invoke this skill when:
- Working with scripts in the BP/scripts directory
- Modifying or creating script modules
- Debugging script behavior

## Function Module Management

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

## Debug Standards
- Use `world.sendMessage()` or `player.sendMessage()` instead of console.log
- Use scriptevent for custom commands: `scriptevent minesia:debug_on/off/status`
- Built-in debug system at `scripts/debug` with `debug.log()`, `debug.logPlayer()`, `debug.logWithTag()`

## Version Number Format
- Format: `长期版本号.主要版本号.寻常版本号` (e.g., 0.0.13)
- Default: increment 寻常版本号 only
- Incrementing 主要版本号 resets 寻常版本号 to 0
- Incrementing 长期版本号 resets both 主要版本号 and 寻常版本号 to 0

## Subpack Synchronization
- Easy: `BP/subpacks/Easy/` (25% reward increase)
- Very Easy: `BP/subpacks/Very Easy/` (50% reward increase)
- Sync changes to subpacks when modifying main pack
- When modifying scripts, check if subpacks contain the same file and sync accordingly
