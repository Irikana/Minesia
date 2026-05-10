// setEffectMain.js - 套装效果主逻辑（稳定版)
// 解决装备检测不稳定和状态同步问题

import { world, system, EntityComponentTypes } from "@minecraft/server";
import * as rulesModule from "./rules.js";
import * as equipmentModule from "./equipment.js";
import * as actionsModule from "./actions.js";
import * as setEffectsModule from "./set_effects.js";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { MinesiaLevelEventSystem } from "../minesia_level/minesiaLevelEvent.js";
import { debug } from "../debug/debugManager.js";
import { getCachedEquipment, hasEquipmentChanged, getEquipmentStateHash, clearPlayerCache } from "./equipmentCache.js";
import { getPlayerAccessoryItems, ACCESSORY_CONFIG } from "../accessory/index.js";

import { processItemEffects } from "../custom_events/index.js";

const playerProcessingCooldown = new Map();
const playerLastEquipmentHash = new Map();

export function handleAllPlayersSetEffects() {
    try {
        const players = world.getPlayers();
        const currentTime = system.currentTick;

        for (const player of players) {
            const playerId = player.id;

            const lastProcessTime = playerProcessingCooldown.get(playerId) || 0;
            if (currentTime - lastProcessTime < 3) {
                continue;
            }

            const equippable = player.getComponent('minecraft:equippable');
            if (!equippable) continue;

            const currentEquipment = getCachedEquipment(player);
            const currentHash = getEquipmentStateHash(currentEquipment);
            const lastHash = playerLastEquipmentHash.get(playerId);

            const shouldProcess = currentHash !== lastHash;

            if (shouldProcess) {
                debug.logWithTag("SetEffectMain", `${player.name}: 装备状态变化`);
                playerLastEquipmentHash.set(playerId, currentHash);
            }

            actionsModule.clearStates(player);

            const totalExp = MinesiaLevelSystem.getTotalExperience(player);
            if (totalExp !== null) {
                const currentLevel = MinesiaLevelSystem.calculateLevel(totalExp);
                const levelHealthBonus = MinesiaLevelEventSystem.calculateLevelHealthBonus(currentLevel);
                actionsModule.applyLevelHealthBonus(player, levelHealthBonus);
            }

            processItemRules(player, equippable);
            setEffectsModule.handleSetEffects(player);
            actionsModule.updatePlayerHealthEffect(player);
            playerProcessingCooldown.set(playerId, currentTime);
        }
    } catch (error) {
        debug.logError("SetEffectMain", `主循环错误: ${error}`);
    }
}

function getEquipmentState(equippable) {
    try {
        const equipmentItems = [];
        for (const slotName in equipmentModule.SLOT_MAP) {
            const slot = equipmentModule.SLOT_MAP[slotName];
            if (slot) {
                const item = equippable.getEquipment(slot);
                const itemId = item ? item.typeId : 'empty';
                equipmentItems.push(`${slotName}:${itemId}`);
            }
        }
        return equipmentItems.sort().join('|');
    } catch (error) {
        debug.logWarning("SetEffectMain", `获取装备状态失败: ${error.message}`);
        return 'error_state';
    }
}

function processItemRules(player, equippable) {
    for (const rule of rulesModule.ITEM_RULES) {
        for (const slotName of rule.slots) {
            const slot = equipmentModule.SLOT_MAP[slotName];
            if (!slot) continue;

            const item = equippable.getEquipment(slot);
            if (item && item.typeId === rule.id) {
                debug.logWithTag("SetEffectMain", `${player.name}: 检测到物品 ${rule.id} 在槽位 ${slotName}`);
                actionsModule.applyActions(player, rule.actions);
            }
        }
        
        if (rule.slots.includes("offhand")) {
            const accessoryItems = getPlayerAccessoryItems(player);
            for (const accessory of accessoryItems) {
                if (accessory.item.typeId === rule.id) {
                    debug.logWithTag("SetEffectMain", `${player.name}: 检测到物品 ${rule.id} 在饰品槽位 ${accessory.slotIndex}`);
                    actionsModule.applyActions(player, rule.actions);
                }
            }
        }
    }
}

export function initializeSetEffectSystem() {
    world.beforeEvents.playerLeave.subscribe((event) => {
        if (event.player) {
            clearPlayerCache(event.player.id);
            playerProcessingCooldown.delete(event.player.id);
            playerLastEquipmentHash.delete(event.player.id);
        }
    });
    
    debug.logWithTag("SetEffectMain", "套装效果系统初始化完成");
}
