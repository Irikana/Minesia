import { EquipmentSlot, system } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

export const DESERT_SNOW_EFFECT = {
    name: "Desert Snow",
    description: "攻击时50%概率使目标虚弱I持续3秒、减速III持续1秒",
    itemId: "minesia:desert_snow"
};

export function applyDesertSnowEffect(target, attacker) {
    try {
        if (Math.random() < 0.5) {
            target.addEffect("minecraft:weakness", 60, {
                amplifier: 0,
                showParticles: true
            });
            target.addEffect("minecraft:slowness", 20, {
                amplifier: 2,
                showParticles: true
            });
            debug.logWithTag("DesertSnow", `${attacker.name} 使目标虚弱和减速`);
        }
    } catch (error) {
        debug.logError("DesertSnow", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isDesertSnowItem(itemId) {
    return itemId === "minesia:desert_snow";
}
