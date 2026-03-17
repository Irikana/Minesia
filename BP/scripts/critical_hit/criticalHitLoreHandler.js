import { getTotalCriticalRateForDisplay } from "./criticalHitMain.js";
import { CRITICAL_CONFIG } from "./config.js";

let loreRegistry = null;

export function registerCriticalHitLoreHandler(registry) {
    loreRegistry = registry;
    
    loreRegistry.registerHandler("critical_hit", (item, player) => {
        return getCriticalHitLore(player);
    });
}

export function getCriticalHitLore(player) {
    const lines = [];
    const totalRate = player ? getTotalCriticalRateForDisplay(player) : CRITICAL_CONFIG.defaultCriticalRate;
    
    if (totalRate > 0) {
        lines.push(`§e暴击率: §f${totalRate.toFixed(1)}%`);
    }
    
    lines.push(`§7暴击伤害: §c+${Math.round((CRITICAL_CONFIG.criticalDamageMultiplier - 1) * 100)}%`);
    
    return lines;
}
