import { EquipmentSlot, system } from "@minecraft/server";

export const SELFISH_EFFECT = {
    name: "Selfish",
    description: "攻击目标时有25%概率使目标获得5秒虚弱",
    itemId: "minesia:selfish"
};

export function applySelfishEffect(target, attacker) {
    try {
        if (Math.random() < 0.25) {
            target.addEffect("minecraft:weakness", 100, {
                amplifier: 0,
                showParticles: true
            });
            console.log(`[Selfish] ${attacker.name} 使目标虚弱5秒`);
        }
    } catch (error) {
        console.error("[Selfish] 应用效果时出错:", error?.message ?? error);
    }
}

export function isSelfishItem(itemId) {
    return itemId === "minesia:selfish";
}
