// healthBoostManager.js
// ===============================
// 生命提升管理器
// 解决装备切换时生命提升效果短暂消失的问题
// ===============================

import { world, system } from "@minecraft/server";
import { debug } from "../debug/debugManager.js";

const BASE_PLAYER_HEALTH = 10;
const EFFECT_DURATION = 25;
const REFRESH_INTERVAL = 20;

const playerHealthBoostState = new Map();

function getPlayerState(playerId) {
  if (!playerHealthBoostState.has(playerId)) {
    playerHealthBoostState.set(playerId, {
      currentLevel: 0,
      equipmentHealth: 0,
      levelHealth: 0,
      healthPercent: 0
    });
  }
  return playerHealthBoostState.get(playerId);
}

function refreshHealthBoostEffect(player, level) {
  if (level <= 0) return;
  const amplifier = level - 1;
  player.addEffect("minecraft:health_boost", EFFECT_DURATION, {
    amplifier: amplifier,
    showParticles: false
  });
}

export function updateHealthBoost(player, equipmentHealth, levelHealth, healthPercent) {
  try {
    const playerId = player.id;
    const state = getPlayerState(playerId);

    const newEquipmentHealth = equipmentHealth || 0;
    const newLevelHealth = levelHealth || 0;
    const newHealthPercent = healthPercent || 0;

    const baseHealth = BASE_PLAYER_HEALTH + newEquipmentHealth + newLevelHealth;
    const percentBonus = Math.floor(baseHealth * (newHealthPercent / 100));
    const totalHealthBonus = newEquipmentHealth + newLevelHealth + percentBonus;
    const newLevel = Math.max(0, Math.floor(totalHealthBonus / 4));

    if (newLevel === state.currentLevel) {
      state.equipmentHealth = newEquipmentHealth;
      state.levelHealth = newLevelHealth;
      state.healthPercent = newHealthPercent;
      return;
    }

    const oldLevel = state.currentLevel;
    debug.logWithTag("HealthBoostManager", `${player.name}: 生命提升等级变化 ${oldLevel} -> ${newLevel}`);

    const currentHealth = player.getComponent("minecraft:health");
    const currentHealthValue = currentHealth ? currentHealth.currentValue : BASE_PLAYER_HEALTH;

    if (oldLevel > 0) {
      try {
        player.removeEffect("minecraft:health_boost");
      } catch (e) {
        debug.logWarning("HealthBoostManager", `移除效果失败: ${e}`);
      }
    }

    if (newLevel > 0) {
      refreshHealthBoostEffect(player, newLevel);
    }

    const oldMaxHealth = BASE_PLAYER_HEALTH + (oldLevel * 4);
    const newMaxHealth = BASE_PLAYER_HEALTH + (newLevel * 4);

    let restoredHealth;
    if (currentHealthValue >= newMaxHealth) {
      restoredHealth = newMaxHealth;
    } else {
      restoredHealth = currentHealthValue;
    }

    const healthComponent = player.getComponent("minecraft:health");
    if (healthComponent) {
      const finalHealth = Math.min(restoredHealth, newMaxHealth);
      healthComponent.setCurrentValue(finalHealth);
    }

    state.currentLevel = newLevel;
    state.equipmentHealth = newEquipmentHealth;
    state.levelHealth = newLevelHealth;
    state.healthPercent = newHealthPercent;

    debug.logWithTag("HealthBoostManager", `${player.name}: 血量恢复 ${currentHealthValue} -> ${restoredHealth}, 新最大生命: ${newMaxHealth}`);

  } catch (error) {
    debug.logError("HealthBoostManager", `更新生命提升时出错: ${error}`);
  }
}

export function getPlayerHealthBoostLevel(playerId) {
  const state = playerHealthBoostState.get(playerId);
  return state ? state.currentLevel : 0;
}

export function clearPlayerHealthBoostState(playerId) {
  playerHealthBoostState.delete(playerId);
}

export function initHealthBoostManager() {
  world.afterEvents.playerLeave.subscribe((eventData) => {
    clearPlayerHealthBoostState(eventData.playerId);
  });

  world.afterEvents.playerSpawn.subscribe((eventData) => {
    const { player, initialSpawn } = eventData;
    if (initialSpawn) return;

    const playerId = player.id;
    const state = playerHealthBoostState.get(playerId);
    if (state && state.currentLevel > 0) {
      refreshHealthBoostEffect(player, state.currentLevel);
      debug.logWithTag("HealthBoostManager", `${player.name} 重生后恢复生命提升等级 ${state.currentLevel}`);
    }
  });

  system.runInterval(() => {
    const players = world.getPlayers();
    for (const player of players) {
      const state = playerHealthBoostState.get(player.id);
      if (state && state.currentLevel > 0) {
        refreshHealthBoostEffect(player, state.currentLevel);
      }
    }
  }, REFRESH_INTERVAL);

  debug.logWithTag("HealthBoostManager", "生命提升管理器已初始化");
}
