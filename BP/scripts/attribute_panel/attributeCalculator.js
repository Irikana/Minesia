import { StaminaSystem } from "../stamina/staminaMain.js";
import { getTotalCriticalRate } from "../critical_hit/criticalHitMain.js";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { CRITICAL_CONFIG } from "../critical_hit/config.js";
import { STAMINA_CONFIG } from "../stamina/config.js";

export function calculatePlayerAttributes(player) {
    const attributes = {
        critRate: 0,
        critDamageMultiplier: CRITICAL_CONFIG.criticalDamageMultiplier,
        critDamagePercent: 0,
        stamina: 0,
        maxStamina: 0,
        maxStaminaBonus: 0,
        baseMaxStamina: STAMINA_CONFIG.maxStamina,
        staminaPercentage: 0,
        consumptionMultiplier: 1,
        recoveryMultiplier: 1,
        health: 0,
        maxHealth: 20,
        healthPercentage: 0,
        level: 0,
        totalExp: 0,
        expInCurrentLevel: 0,
        expNeeded: 0,
        progress: 0
    };

    try {
        attributes.critRate = getTotalCriticalRate(player);
        attributes.critDamagePercent = Math.round((attributes.critDamageMultiplier - 1) * 100);
    } catch (e) { }

    try {
        attributes.stamina = Math.floor(StaminaSystem.getStamina(player));
        attributes.maxStamina = StaminaSystem.getMaxStamina(player);
        attributes.staminaPercentage = Math.round(StaminaSystem.getStaminaPercentage(player) * 100);
        
        const staminaData = StaminaSystem.getPlayerData(player);
        if (staminaData) {
            attributes.maxStaminaBonus = staminaData.maxStaminaBonus || 0;
            attributes.consumptionMultiplier = staminaData.consumptionMultiplier || 1;
            attributes.recoveryMultiplier = staminaData.recoveryMultiplier || 1;
        }
    } catch (e) { }

    try {
        const healthComponent = player.getComponent('minecraft:health');
        if (healthComponent) {
            attributes.health = Math.floor(healthComponent.currentValue);
            attributes.maxHealth = Math.floor(healthComponent.effectiveMax);
            attributes.healthPercentage = Math.round((attributes.health / attributes.maxHealth) * 100);
        }
    } catch (e) { }

    try {
        const levelProgress = MinesiaLevelSystem.getLevelProgress(player);
        if (levelProgress) {
            attributes.level = levelProgress.level;
            attributes.totalExp = levelProgress.totalExp;
            attributes.expInCurrentLevel = levelProgress.expInCurrentLevel;
            attributes.expNeeded = levelProgress.expNeeded;
            attributes.progress = levelProgress.progress;
        }
    } catch (e) { }

    return attributes;
}

export function formatAttributeBar(current, max, length = 10) {
    const percentage = max > 0 ? current / max : 0;
    const filled = Math.max(0, Math.min(length, Math.floor(percentage * length)));
    const empty = Math.max(0, length - filled);
    
    let color;
    if (percentage > 0.6) {
        color = "§a";
    } else if (percentage > 0.3) {
        color = "§e";
    } else {
        color = "§c";
    }
    
    return color + "■".repeat(filled) + "§8" + "■".repeat(empty);
}

export function formatProgressBar(progress, length = 10) {
    const filled = Math.max(0, Math.min(length, Math.floor(progress * length)));
    const empty = Math.max(0, length - filled);
    return "§a" + "■".repeat(filled) + "§8" + "■".repeat(empty);
}

export function formatMultiplier(value, locale = "zh_CN") {
    if (value === 1) {
        return locale === "zh_CN" ? "正常" : "Normal";
    } else if (value < 1) {
        const percent = Math.round((1 - value) * 100);
        return `-${percent}%%`;
    } else {
        const percent = Math.round((value - 1) * 100);
        return `+${percent}%%`;
    }
}

export function formatBonus(value, locale = "zh_CN") {
    if (value === 0) {
        return locale === "zh_CN" ? "无加成" : "No Bonus";
    } else if (value > 0) {
        return `+${value}`;
    } else {
        return `${value}`;
    }
}
