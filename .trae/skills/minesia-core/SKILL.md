---
name: "minesia-core"
description: "Loads Minesia core project conventions and references. Invoke when working on the Minesia project to ensure adherence to project conventions."
---

# Minesia Core Project Guide

This skill loads the core Minesia development conventions and references when working on the Minesia project.

## When to Invoke

Invoke this skill when:
- Modifying any code files in the Minesia project
- Making changes to manifest files
- Working with subpacks
- Starting any development task in the Minesia project

## Official Documentation References

| Type | Link | Description |
|------|------|-------------|
| Bedrock Add-Ons | https://learn.microsoft.com/en-us/minecraft/creator/ | Official Minecraft Bedrock Add-On docs |
| Bedrock Script API | https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/ | Script API reference |
| Bedrock Entity Docs | https://wiki.bedrock.dev/ | Community-maintained entity docs |
| Minecraft Wiki | https://minecraft.wiki/ | Minecraft Wiki (Bedrock content) |
| Bedrock.dev | https://bedrock.dev/ | Official Bedrock documentation |

## Directory Notes
- `builds/` — Only for bridge quick builds; does not affect development or debugging; should be ignored during development

## Document Terminology Standards
- **Minesia Level**: Use "Minesia Level" not "Creation Level"
- **Project Name**: Use "Minesia" or "创世" consistently
- Maintain terminology consistency across all documentation

## When to Stop and Ask
- **Technical limitations**: Script API doesn't support certain features
- **Uncertain implementation**: Multiple viable approaches exist
- **Ambiguous requirements**: Feature requirements have multiple interpretations
- **Dependency issues**: Need confirmation before introducing new dependencies or modifying existing structure

## Full Guide Location

The complete development guide is located at:
`docs/开发指南.md`

Always read this file before making any code changes to ensure compliance with project conventions.
