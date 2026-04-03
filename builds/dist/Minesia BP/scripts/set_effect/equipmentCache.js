import { system } from "@minecraft/server";
import { EquipmentSlot } from "@minecraft/server";
import { SLOT_MAP } from "./equipment.js";
import { debug } from "../debug/debugManager.js";

const playerEquipmentCache = new Map();
const playerLastCheckTick = new Map();
const CACHE_VALIDITY_TICKS = 5;
const equipmentChangeCallbacks = new Map();

export function getCachedEquipment(player, forceRefresh = false) {
    const playerId = player.id;
    const currentTick = system.currentTick;
    
    if (!forceRefresh) {
        const cachedData = playerEquipmentCache.get(playerId);
        const lastCheckTick = playerLastCheckTick.get(playerId);
        
        if (cachedData && lastCheckTick && (currentTick - lastCheckTick) < CACHE_VALIDITY_TICKS) {
            return cachedData;
        }
    }
    
    const equippable = player.getComponent('minecraft:equippable');
    if (!equippable) {
        return playerEquipmentCache.get(playerId) || {};
    }
    
    const newEquipment = {};
    for (const slotName in SLOT_MAP) {
        const item = equippable.getEquipment(SLOT_MAP[slotName]);
        newEquipment[slotName] = item ? item.typeId : null;
    }
    
    const previousEquipment = playerEquipmentCache.get(playerId);
    if (previousEquipment) {
        for (const slotName in newEquipment) {
            if (newEquipment[slotName] !== previousEquipment[slotName]) {
                triggerEquipmentChange(player, slotName, previousEquipment[slotName], newEquipment[slotName]);
            }
        }
    }
    
    playerEquipmentCache.set(playerId, newEquipment);
    playerLastCheckTick.set(playerId, currentTick);
    
    return newEquipment;
}

export function getEquipmentStateHash(equipment) {
    const parts = [];
    for (const slotName of Object.keys(SLOT_MAP).sort()) {
        parts.push(`${slotName}:${equipment[slotName] || 'empty'}`);
    }
    return parts.join('|');
}

export function hasEquipmentChanged(player) {
    const playerId = player.id;
    const cachedEquipment = playerEquipmentCache.get(playerId);
    
    if (!cachedEquipment) return true;
    
    const equippable = player.getComponent('minecraft:equippable');
    if (!equippable) return false;
    
    for (const slotName in SLOT_MAP) {
        const item = equippable.getEquipment(SLOT_MAP[slotName]);
        const currentId = item ? item.typeId : null;
        if (currentId !== cachedEquipment[slotName]) {
            return true;
        }
    }
    
    return false;
}

export function onEquipmentChange(callbackId, callback) {
    equipmentChangeCallbacks.set(callbackId, callback);
}

export function offEquipmentChange(callbackId) {
    equipmentChangeCallbacks.delete(callbackId);
}

function triggerEquipmentChange(player, slotName, oldItemId, newItemId) {
    for (const [id, callback] of equipmentChangeCallbacks) {
        try {
            callback(player, slotName, oldItemId, newItemId);
        } catch (error) {
            debug.logError("EquipmentCache", `装备变化回调 ${id} 执行失败: ${error?.message ?? error}`);
        }
    }
}

export function clearPlayerCache(playerId) {
    playerEquipmentCache.delete(playerId);
    playerLastCheckTick.delete(playerId);
}

export function clearAllCache() {
    playerEquipmentCache.clear();
    playerLastCheckTick.clear();
}

export function getCacheStats() {
    return {
        cachedPlayers: playerEquipmentCache.size,
        trackedPlayers: playerLastCheckTick.size
    };
}
