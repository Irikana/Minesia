import { system } from "@minecraft/server";
import { ITEM_EFFECTS } from "./effectRegistry.js";
import { StaminaSystem } from "../../stamina/staminaMain.js";

const playerActiveEffects = new Map();
const playerLastTick = new Map();

export function processItemEffects(player) {
    const currentTime = system.currentTick;
    const playerId = player.id;
    const currentEffects = new Set();
    
    for (const [tag, effect] of Object.entries(ITEM_EFFECTS)) {
        if (player.hasTag(tag)) {
            currentEffects.add(tag);
        }
    }
    
    const previousEffects = playerActiveEffects.get(playerId) || new Set();
    
    for (const tag of currentEffects) {
        if (!previousEffects.has(tag)) {
            try {
                ITEM_EFFECTS[tag].onActivate?.(player, StaminaSystem);
            } catch (error) {
                console.error(`[ItemEffect] 激活效果 ${tag} 失败:`, error?.message ?? error);
            }
        }
    }
    
    for (const tag of currentEffects) {
        const effect = ITEM_EFFECTS[tag];
        if (!effect.onTick) continue;
        
        const key = `${playerId}:${tag}`;
        const lastTick = playerLastTick.get(key) || 0;
        
        if (currentTime - lastTick >= effect.interval) {
            try {
                effect.onTick(player, StaminaSystem);
                playerLastTick.set(key, currentTime);
            } catch (error) {
                console.error(`[ItemEffect] 执行效果 ${tag} 失败:`, error?.message ?? error);
            }
        }
    }
    
    for (const tag of previousEffects) {
        if (!currentEffects.has(tag)) {
            try {
                ITEM_EFFECTS[tag].onDeactivate?.(player, StaminaSystem);
            } catch (error) {
                console.error(`[ItemEffect] 停用效果 ${tag} 失败:`, error?.message ?? error);
            }
        }
    }
    
    playerActiveEffects.set(playerId, currentEffects);
}

export function registerItemEffect(tag, effect) {
    ITEM_EFFECTS[tag] = effect;
}

export function unregisterItemEffect(tag) {
    delete ITEM_EFFECTS[tag];
}

export function getActiveItemEffects(playerId) {
    return playerActiveEffects.get(playerId) || new Set();
}
