import { EquipmentSlot, system } from "@minecraft/server";

export const BLACK_DAGGER_EFFECT = {
    name: "Black Dagger",
    description: "每次攻击时有25%概率使目标凋谢2秒",
    itemId: "minesia:black_dagger"
};

export function applyBlackDaggerEffect(target, attacker) {
    try {
        if (Math.random() < 0.25) {
            target.addEffect("minecraft:wither", 40, {
                amplifier: 1,
                showParticles: true
            });
            console.log(`[BlackDagger] ${attacker.name} 使目标凋谢2秒`);
        }
    } catch (error) {
        console.error("[BlackDagger] 应用效果时出错:", error?.message ?? error);
    }
}

export function isBlackDaggerItem(itemId) {
    return itemId === "minesia:black_dagger";
}
