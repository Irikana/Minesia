import { EquipmentSlot, system } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

export const THE_FOREST_EFFECT = {
    name: "The Forest",
    description: "攻击时使目标中毒3秒，每次攻击恢复2点体力值",
    itemId: "minesia:the_forest"
};

export function applyTheForestEffect(target, attacker, StaminaSystem) {
    try {
        target.addEffect("minecraft:poison", 60, {
            amplifier: 0,
            showParticles: true
        });

        if (StaminaSystem) {
            StaminaSystem.recoverStamina(attacker, 2);
        }

        debug.logWithTag("TheForest", `${attacker.name} 使目标中毒并恢复2点体力`);
    } catch (error) {
        debug.logError("TheForest", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isTheForestItem(itemId) {
    return itemId === "minesia:the_forest";
}
