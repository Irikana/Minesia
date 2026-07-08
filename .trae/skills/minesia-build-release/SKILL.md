---
name: "minesia-build-release"
description: "Loads Minesia build and release conventions. Invoke when building the addon, creating changelogs, or releasing a new version of the Minesia project."
---

# Minesia Build & Release Guide

This skill loads build and release conventions when building the addon, creating changelogs, or releasing a new version of the Minesia project.

## When to Invoke

Invoke this skill when:
- Building the addon
- Creating or updating changelogs
- Releasing a new version
- Updating manifest version numbers

## Changelog Convention
- Location: `changelogs/zh_CN/` for Chinese, `changelogs/en_US/` for English
- Plan files: `plan.md` with `*` prefix for pending items; remove `*` after completion
- Format: Version → Date → *** → Category → Content
- Style: Casual, natural language
- Use bullet points (`-`) for listing items
- Blank line between paragraphs for proper Markdown rendering
- **Net Change Principle**: Errors found and fixed within the same version are NOT recorded in changelog. Changelog should only contain net changes between current and previous version

## Build Convention
1. Check all pending items (with `*`) are completed before building
2. Set the date in the Chinese plan.md to the current Beijing time
3. Create English changelog in `changelogs/en_US/`
4. Rename `plan.md` to `.md` (remove plan prefix)
5. Update manifest version numbers in both BP and RP
6. Build as `Minesia [version].mcaddon`
7. Create next version's `plan.md` in `changelogs/zh_CN/`

## Subpack Synchronization
- Easy: `BP/subpacks/Easy/` (25% reward increase)
- Very Easy: `BP/subpacks/Very Easy/` (50% reward increase)
- Sync changes to subpacks when modifying main pack
- When modifying scripts, check if subpacks contain the same file and sync accordingly

## Version Number Format
- Format: `长期版本号.主要版本号.寻常版本号` (e.g., 0.0.13)
- Default: increment 寻常版本号 only
- Incrementing 主要版本号 resets 寻常版本号 to 0
- Incrementing 长期版本号 resets both 主要版本号 and 寻常版本号 to 0
