import { system } from "@minecraft/server";
import { applyCriticalHit, isCurrentlyApplyingCriticalDamage } from "../../critical_hit/criticalHitMain.js";
import { debug } from "../../debug/debugManager.js";

const playerAttackCounts = new Map();

export const BLACK_DAGGER_EFFECT = {
    name: "Black Dagger",
    description: "每3次攻击必暴击1次，攻击时有30%概率使目标凋零II持续6秒",
    itemId: "minesia:black_dagger"
};

export function applyBlackDaggerEffect(target, attacker, baseDamage) {
    try {
        if (isCurrentlyApplyingCriticalDamage()) return;

        const playerId = attacker.id;
        const count = (playerAttackCounts.get(playerId) || 0) + 1;
        playerAttackCounts.set(playerId, count);

        if (count % 3 === 0 && baseDamage > 0) {
            applyCriticalHit(attacker, target, baseDamage);
        }

        if (Math.random() < 0.3) {
            target.addEffect("minecraft:wither", 120, {
                amplifier: 1,
                showParticles: true
            });
            debug.logWithTag("BlackDagger", `${attacker.name} 使目标凋零II 6秒`);
        }
    } catch (error) {
        debug.logError("BlackDagger", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isBlackDaggerItem(itemId) {
    return itemId === "minesia:black_dagger";
}
