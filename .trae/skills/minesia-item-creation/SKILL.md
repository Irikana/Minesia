---
name: "minesia-item-creation"
description: "Loads Minesia item and weapon creation conventions. Invoke when creating new items, weapons, or features in the Minesia project."
---

# Minesia Item & Weapon Creation Guide

This skill loads item and weapon creation conventions when creating new items, weapons, or features in the Minesia project.

## When to Invoke

Invoke this skill when:
- Creating new items, weapons, or features
- Updating language files (RP/texts/*.lang)
- Designing weapon damage values or lore descriptions

## Item Registration Rules
- **Random Damage**: Register to `scripts/random_damage`
- **Stamina Cost**: Register to `scripts/stamina`
- **Custom Events**: Register to `scripts/custom_events`
- **Critical Hit**: Register to `scripts/critical_hit`
- **Lore Descriptions**: Configure via language files (RP/texts/*.lang)

## Lore Description Format
- Use `~LINEBREAK~` for line breaks
- Color codes: §9 (blue/primary), §c (red/stamina), §e (yellow/crit), §7 (gray/secondary)
- Order: Attack Damage → Stamina Cost → Crit Rate → Set/Offhand Effects → Custom Events → Flavor Text
- Accessory slot description:
  - Chinese: `§9副手或背包第一行时:`
  - English: `§9When in offhand or inventory row 1:`
- **No Unicode characters** (e.g. emoji) in descriptions — they break vanilla font rendering

## Weapon Damage Rules
- Sword: x (fixed value, vanilla baseline)
- Scythe: x+1 ~ x+x/2 (higher than sword of same material)
- Scythe weapons default to triggering the scythe sweep event; no need to add to lore unless explicitly stated

## Material Weapon Damage Table

| Material | Vanilla Sword (x) | Dagger Range | Scythe Range |
|----------|------------------|-------------|-------------|
| Wood/Gold | 4 | 1~4 | 5~6 |
| Copper | - | 2~5 | 6~7 |
| Stone | 5 | 2~5 | 6~7.5 |
| Iron | 6 | 3~6 | 7~9 |
| Steel | - | 4~7 | 9~12 |
| Diamond | 7 | 4~7 | 8~10.5 |
| Netherite | 8 | 5~8 | 9~12 |

## Currency Value Mapping

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
