import { EquipmentSlot, system } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

export const DUTY_ICE_EFFECT = {
    name: "Duty Ice",
    description: "攻击目标时有25%概率使目标冰冻5秒（缓慢III、挖掘疲劳III、虚弱I）",
    itemId: "minesia:duty_ice"
};

export function applyDutyIceEffect(target, attacker) {
    try {
        if (Math.random() < 0.25) {
            target.addEffect("minecraft:slowness", 100, {
                amplifier: 2,
                showParticles: true
            });
            target.addEffect("minecraft:mining_fatigue", 100, {
                amplifier: 2,
                showParticles: true
            });
            target.addEffect("minecraft:weakness", 100, {
                amplifier: 0,
                showParticles: true
            });

            const loc = target.location;
            for (let i = 0; i < 10; i++) {
                target.dimension.spawnParticle("minecraft:snowflake_particle", {
                    x: loc.x + (Math.random() - 0.5) * 2,
                    y: loc.y + Math.random() * 2,
                    z: loc.z + (Math.random() - 0.5) * 2
                });
            }

            debug.logWithTag("DutyIce", `${attacker.name} 使目标冰冻5秒`);
        }
    } catch (error) {
        debug.logError("DutyIce", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isDutyIceItem(itemId) {
    return itemId === "minesia:duty_ice";
}
