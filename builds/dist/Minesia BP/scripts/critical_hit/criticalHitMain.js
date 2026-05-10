import { world, system, EntityComponentTypes } from "@minecraft/server";
import { CRITICAL_CONFIG, getCriticalRateConfig, getEquipmentCriticalBonus } from "./config.js";
import { EquipmentSlot } from "@minecraft/server";
import { debug } from "../debug/debugManager.js";
import { getPlayerAccessoryItems, ACCESSORY_CONFIG } from "../accessory/index.js";

const CRITICAL_RATE_PROPERTY = "minesia:critical_rate";
const playerCriticalBonuses = new Map();

let isApplyingCriticalDamage = false;

export function isCurrentlyApplyingCriticalDamage() {
    return isApplyingCriticalDamage;
}

export function initializeCriticalHitSystem() {
    debug.logWithTag("CriticalHit", "暴击系统初始化完成");
}

export function getTotalCriticalRate(player) {
    let totalRate = CRITICAL_CONFIG.defaultCriticalRate;
    
    const savedRate = player.getDynamicProperty(CRITICAL_RATE_PROPERTY);
    if (savedRate !== undefined && savedRate !== null) {
        totalRate += savedRate;
    }
    
    const bonuses = playerCriticalBonuses.get(player.id);
    if (bonuses) {
        for (const bonus of bonuses.values()) {
            totalRate += bonus;
        }
    }
    
    const equippable = player.getComponent('minecraft:equippable');
    if (equippable) {
        const mainhandItem = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (mainhandItem) {
            totalRate += getCriticalRateConfig(mainhandItem.typeId);
        }
        
        for (const slot of [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand]) {
            const item = equippable.getEquipment(slot);
            if (item) {
                totalRate += getEquipmentCriticalBonus(item.typeId);
            }
        }
    }
    
    const accessoryItems = getPlayerAccessoryItems(player);
    for (const accessory of accessoryItems) {
        totalRate += getEquipmentCriticalBonus(accessory.item.typeId);
    }
    
    return Math.min(totalRate, CRITICAL_CONFIG.maxCriticalRate);
}

export function applyCriticalHit(attacker, target, baseDamage) {
    try {
        const criticalDamage = Math.round(baseDamage * (CRITICAL_CONFIG.criticalDamageMultiplier - 1) * 10) / 10;
        
        if (criticalDamage > 0) {
            isApplyingCriticalDamage = true;
            
            target.applyDamage(criticalDamage, {
                cause: "entityAttack",
                damagingEntity: attacker
            });
            
            const loc = target.location;
            attacker.dimension.spawnParticle(CRITICAL_CONFIG.particleEffect, {
                x: loc.x,
                y: loc.y + 1,
                z: loc.z
            });
            
            attacker.playSound(CRITICAL_CONFIG.soundEffect);
            
            attacker.sendMessage(`§6§l暴击！§r §c+${criticalDamage} 伤害`);
            
            debug.logWithTag("CriticalHit", `${attacker.name} 触发暴击，基础伤害: ${baseDamage}，额外伤害: ${criticalDamage}`);
        }
        
    } catch (error) {
        debug.logError("CriticalHit", `应用暴击失败: ${error?.message ?? error}`);
    } finally {
        isApplyingCriticalDamage = false;
    }
}

export function setPlayerCriticalRate(player, rate) {
    const clampedRate = Math.max(0, Math.min(rate, CRITICAL_CONFIG.maxCriticalRate));
    player.setDynamicProperty(CRITICAL_RATE_PROPERTY, clampedRate);
    return clampedRate;
}

export function getPlayerCriticalRate(player) {
    return player.getDynamicProperty(CRITICAL_RATE_PROPERTY) || CRITICAL_CONFIG.defaultCriticalRate;
}

export function addCriticalBonus(player, bonusId, bonusValue) {
    const playerId = player.id;
    if (!playerCriticalBonuses.has(playerId)) {
        playerCriticalBonuses.set(playerId, new Map());
    }
    playerCriticalBonuses.get(playerId).set(bonusId, bonusValue);
}

export function removeCriticalBonus(player, bonusId) {
    const playerId = player.id;
    const bonuses = playerCriticalBonuses.get(playerId);
    if (bonuses) {
        bonuses.delete(bonusId);
    }
}

export function clearPlayerCriticalBonuses(playerId) {
    playerCriticalBonuses.delete(playerId);
}

export function getTotalCriticalRateForDisplay(player) {
    return getTotalCriticalRate(player);
}
