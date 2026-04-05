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

### Weapon Damage Rules
- Sword: x (fixed value, vanilla baseline)
- Scythe: x+1 ~ x+x/2 (higher than sword of same material)

### Debug Standards
- Use `world.sendMessage()` or `player.sendMessage()` instead of console.log
- Use scriptevent for custom commands: `scriptevent minesia:debug_on/off/status`

### Version Number Format
- Format: `长期版本号.主要版本号.寻常版本号` (e.g., 0.0.13)
- Default: increment 寻常版本号 only

### Subpack Synchronization
- Easy: `BP/subpacks/Easy/` (25% reward increase)
- Very Easy: `BP/subpacks/Very Easy/` (50% reward increase)
- Sync changes to subpacks when modifying main pack

## Full Guide Location

The complete development guide is located at:
`docs/开发指南.md`

Always read this file before making any code changes to ensure compliance with project conventions.
