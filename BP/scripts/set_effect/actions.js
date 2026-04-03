// actions.js
// ===============================
// 所有行为（effect / command / state / attribute）
// 都通过这里执行
// ===============================

import { system } from "@minecraft/server";
import { updateHealthBoost } from "./healthBoostManager.js";
import { debug } from "../debug/debugManager.js";

export const CONTROLLED_EFFECTS = [
  "strength",
  "resistance",
  "speed",
  "jump_boost",
  "regeneration",
  "fire_resistance",
  "absorption"
];

export const CONTROLLED_TAGS = [
  "steel_set",
  "golden_phantom_membrane_active",
  "desert_walker_active",
  "tina_active",
  "life_stone_active",
  "spider_leg_active",
  "statue_totem_active",
  "flamie_offhand_active",
  "ender_pearl_sword_offhand_active",
  "desert_pyramid_pearl_active",
  "desert_pyramid_eye_active"
];

const playerEffects = new Map();

export const playerAttributes = new Map();

export function applyLevelHealthBonus(player, healthBonus) {
  const playerId = player.id;
  if (!playerAttributes.has(playerId)) {
    playerAttributes.set(playerId, new Map());
  }
  const currentAttributes = playerAttributes.get(playerId);
  currentAttributes.set("level_health", healthBonus);
}

export function clearStates(player) {
  try {
    const tags = player.getTags();
    for (const tag of tags) {
      if (CONTROLLED_TAGS.includes(tag) || tag.startsWith("irikana:")) {
        player.removeTag(tag);
      }
    }

    const playerId = player.id;
    if (playerAttributes.has(playerId)) {
      playerAttributes.set(playerId, new Map());
    }
  } catch (error) {
    debug.logError("Actions", `清理状态时出错: ${error}`);
  }
}

export function applyActions(player, actions) {
  try {
    const playerId = player.id;

    if (!playerEffects.has(playerId)) {
      playerEffects.set(playerId, new Map());
    }

    if (!playerAttributes.has(playerId)) {
      playerAttributes.set(playerId, new Map());
    }

    const currentEffects = playerEffects.get(playerId);
    const currentAttributes = playerAttributes.get(playerId);

    for (const action of actions) {
      switch (action.kind) {
        case "effect":
          applyEffect(player, action, currentEffects);
          break;

        case "command":
          try {
            player.runCommand(action.command);
          } catch (cmdError) {
            debug.logWarning("Actions", `执行命令失败: ${action.command} ${cmdError}`);
          }
          break;

        case "state":
          applyState(player, action);
          break;

        case "attribute":
          applyAttribute(player, action, currentAttributes);
          break;

        case "attribute_percent":
          applyAttributePercent(player, action, currentAttributes);
          break;
      }
    }

    updatePlayerAttributes(player, currentAttributes);
  } catch (error) {
    debug.logError("Actions", `应用动作时出错: ${error}`);
  }
}

function applyEffect(player, action, currentEffects) {
  try {
    const duration = action.duration || 10;
    const amplifier = action.amplifier ?? 0;
    const effectKey = `${action.type}:${amplifier}`;

    const lastApplied = currentEffects.get(effectKey) || 0;
    const currentTime = system.currentTick;

    if (currentTime - lastApplied > duration / 4) {
      player.addEffect(action.type, duration, {
        amplifier: amplifier,
        showParticles: false
      });
      currentEffects.set(effectKey, currentTime);
    }
  } catch (error) {
    debug.logError("Actions", `应用效果时出错: ${error}`);
  }
}

function applyState(player, action) {
  try {
    if (action.value) {
      if (!player.hasTag(action.key)) {
        player.addTag(action.key);
        debug.logWithTag("Actions", `添加标签: ${action.key} 给 ${player.name}`);
      }
    } else {
      player.removeTag(action.key);
    }
  } catch (error) {
    debug.logError("Actions", `应用状态时出错: ${error}`);
  }
}

function applyAttribute(player, action, currentAttributes) {
  try {
    const attributeType = action.type;
    const value = action.value || 0;
    const attributeKey = attributeType;

    const currentValue = currentAttributes.get(attributeKey) || 0;
    currentAttributes.set(attributeKey, currentValue + value);
  } catch (error) {
    debug.logError("Actions", `应用属性时出错: ${error}`);
  }
}

function applyAttributePercent(player, action, currentAttributes) {
  try {
    const attributeType = action.type;
    const percent = action.percent || 0;
    const attributeKey = `${attributeType}_percent`;

    const currentPercent = currentAttributes.get(attributeKey) || 0;
    currentAttributes.set(attributeKey, currentPercent + percent);
  } catch (error) {
    debug.logError("Actions", `应用属性百分比时出错: ${error}`);
  }
}

function updatePlayerAttributes(player, currentAttributes) {
  try {
    const equipmentHealth = currentAttributes.get("health") || 0;
    const levelHealth = currentAttributes.get("level_health") || 0;
    const healthPercent = currentAttributes.get("health_percent") || 0;

    updateHealthBoost(player, equipmentHealth, levelHealth, healthPercent);
  } catch (error) {
    debug.logError("Actions", `更新玩家属性时出错: ${error}`);
  }
}

export function updatePlayerHealthEffect(player) {
  const playerId = player.id;
  if (!playerAttributes.has(playerId)) {
    return;
  }
  const currentAttributes = playerAttributes.get(playerId);
  updatePlayerAttributes(player, currentAttributes);
}
