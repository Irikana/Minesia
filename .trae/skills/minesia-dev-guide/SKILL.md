---
name: "minesia-dev-guide"
description: "Loads Minesia development guide as context. Invoke when modifying code in the Minesia project to ensure adherence to project conventions."
---

# Minesia Development Guide

This skill automatically loads the Minesia development guide when working on the Minesia project.

The development guide has been split into task-specific sub-skills for more precise context loading:

## Sub-Skills

| Skill | When to Invoke |
|-------|---------------|
| `minesia-core` | Modifying any code files, making changes to manifest files, working with subpacks, starting any development task |
| `minesia-item-creation` | Creating new items, weapons, or features; updating language files (RP/texts/*.lang); designing weapon damage values or lore descriptions |
| `minesia-script-dev` | Working with scripts in the BP/scripts directory; modifying or creating script modules; debugging script behavior |
| `minesia-build-release` | Building the addon; creating or updating changelogs; releasing a new version; updating manifest version numbers |

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

## Full Guide Location

The complete development guide is located at:
`docs/开发指南.md`

Always read this file before making any code changes to ensure compliance with project conventions.
