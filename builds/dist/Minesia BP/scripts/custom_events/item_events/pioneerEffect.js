import { EquipmentSlot, system } from "@minecraft/server";

export const PIONEER_EFFECT = {
    name: "Pioneer",
    description: "攻击目标时有25%概率使目标缓慢三级持续5秒，触发时额外消耗5点体力值",
    itemId: "minesia:pioneer"
};

export function applyPioneerEffect(target, attacker, StaminaSystem) {
    try {
        if (Math.random() < 0.25) {
            target.addEffect("minecraft:slowness", 100, {
                amplifier: 2,
                showParticles: true
            });
            if (StaminaSystem) {
                StaminaSystem.consumeStamina(attacker, 5);
            }
            console.log(`[Pioneer] ${attacker.name} 使目标缓慢并额外消耗5点体力`);
        }
    } catch (error) {
        console.error("[Pioneer] 应用效果时出错:", error?.message ?? error);
    }
}

export function isPioneerItem(itemId) {
    return itemId === "minesia:pioneer";
}
