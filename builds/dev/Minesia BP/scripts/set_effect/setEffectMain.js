// setEffectMain.js - 套装效果主逻辑（稳定版）
// 解决装备检测不稳定和状态同步问题

import { world, system } from "@minecraft/server";
import * as rulesModule from "./rules.js";
import * as equipmentModule from "./equipment.js";
import * as actionsModule from "./actions.js";
import * as setEffectsModule from "./set_effects.js";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { MinesiaLevelEventSystem } from "../minesia_level/minesiaLevelEvent.js";

const lastPlayerEquipment = new Map();
const playerProcessingCooldown = new Map();

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

            const currentEquipmentState = getEquipmentState(equippable);
            const lastEquipmentState = lastPlayerEquipment.get(playerId);

            const shouldProcess = currentEquipmentState !== lastEquipmentState;

            if (shouldProcess) {
                console.log(`[SetEffectMain] ${player.name}: 装备状态变化`);
                console.log(`[SetEffectMain] 旧状态: ${lastEquipmentState || 'none'}`);
                console.log(`[SetEffectMain] 新状态: ${currentEquipmentState}`);

                lastPlayerEquipment.set(playerId, currentEquipmentState);
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
        console.error('[SetEffectMain] 主循环错误:', error);
    }
}

// 获取装备状态字符串（用于比较）
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
        console.warn('[SetEffectMain] 获取装备状态失败:', error.message);
        return 'error_state';
    }
}

// 处理单物品规则
function processItemRules(player, equippable) {
    for (const rule of rulesModule.ITEM_RULES) {
        for (const slotName of rule.slots) {
            const slot = equipmentModule.SLOT_MAP[slotName];
            if (!slot) continue;

            const item = equippable.getEquipment(slot);
            if (item && item.typeId === rule.id) {
                console.log(`[SetEffectMain] ${player.name}: 应用物品规则 ${rule.id}`);
                actionsModule.applyActions(player, rule.actions);
            }
        }
    }
}