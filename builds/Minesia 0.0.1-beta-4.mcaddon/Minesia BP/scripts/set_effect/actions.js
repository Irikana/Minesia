// actions.js
// ===============================
// 所有行为（effect / command / state / attribute）
// 都通过这里执行
// ===============================

import { system } from "@minecraft/server";

export const CONTROLLED_EFFECTS = [
  "strength",
  "health_boost",
  "resistance",
  "speed",
  "jump_boost",
  "regeneration",
  "fire_resistance",
  "absorption"
];

export const CONTROLLED_TAGS = [
  "diamond_set",
  "shield_set",
  "steel_set",
  "golden_phantom_membrane_active",
  "desert_walker_active",
  "tina_active",
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

// 清理所有"系统控制"的状态
export function clearStates(player) {
  try {
    // 清理状态标签
    const tags = player.getTags();
    for (const tag of tags) {
      if (CONTROLLED_TAGS.includes(tag) || tag.startsWith("irikana:")) {
        player.removeTag(tag);
      }
    }

    // 重置玩家属性，防止累积
    const playerId = player.id;
    if (playerAttributes.has(playerId)) {
      playerAttributes.set(playerId, new Map());
    }
  } catch (error) {
    console.error("清理状态时出错:", error);
  }
}

// 执行动作列表
export function applyActions(player, actions) {
  try {
    const playerId = player.id;

    // 初始化玩家效果记录
    if (!playerEffects.has(playerId)) {
      playerEffects.set(playerId, new Map());
    }

    // 初始化玩家属性记录
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
            console.warn("执行命令失败:", action.command, cmdError);
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

    // 每次都更新属性，确保所有加成都被应用
    updatePlayerAttributes(player, currentAttributes);
  } catch (error) {
    console.error("应用动作时出错:", error);
  }
}

/**
 * 应用药水效果
 * @param {Player} player 
 * @param {Object} action 
 * @param {Map} currentEffects 
 */
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
    console.error("应用效果时出错:", error);
  }
}

/**
 * 应用状态标签
 * @param {Player} player 
 * @param {Object} action 
 */
function applyState(player, action) {
  try {
    if (action.value) {
      // 确保标签不会重复添加
      if (!player.hasTag(action.key)) {
        player.addTag(action.key);
      }
    } else {
      player.removeTag(action.key);
    }
  } catch (error) {
    console.error("应用状态时出错:", error);
  }
}

/**
 * 应用属性加成
 * @param {Player} player 
 * @param {Object} action 
 * @param {Map} currentAttributes 
 */
function applyAttribute(player, action, currentAttributes) {
  try {
    const attributeType = action.type;
    const value = action.value || 0;
    const attributeKey = attributeType;

    // 累积属性加成
    const currentValue = currentAttributes.get(attributeKey) || 0;
    currentAttributes.set(attributeKey, currentValue + value);
  } catch (error) {
    console.error("应用属性时出错:", error);
  }
}

/**
 * 应用属性百分比修改
 * @param {Player} player 
 * @param {Object} action 
 * @param {Map} currentAttributes 
 */
function applyAttributePercent(player, action, currentAttributes) {
  try {
    const attributeType = action.type;
    const percent = action.percent || 0;
    const attributeKey = `${attributeType}_percent`;

    // 累积属性百分比加成
    const currentPercent = currentAttributes.get(attributeKey) || 0;
    currentAttributes.set(attributeKey, currentPercent + percent);
  } catch (error) {
    console.error("应用属性百分比时出错:", error);
  }
}

function updatePlayerAttributes(player, currentAttributes) {
  try {
    const equipmentHealth = currentAttributes.get("health") || 0;
    const levelHealth = currentAttributes.get("level_health") || 0;
    const healthPercent = currentAttributes.get("health_percent") || 0;

    const totalHealthBonus = equipmentHealth + levelHealth;

    const healthBoostLevel = Math.max(0, Math.floor(totalHealthBonus / 4));

    if (healthBoostLevel > 0) {
      const amplifier = healthBoostLevel - 1;
      player.addEffect("health_boost", 10, {
        amplifier: amplifier,
        showParticles: false
      });
    }
  } catch (error) {
    console.error("更新玩家属性时出错:", error);
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



