import { system } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

let isApplyingExtraDamage = false;
const playerCooldowns = new Map();
const COOLDOWN_TICKS = 40;

export function isCurrentlyApplyingGodOfLeavesDamage() {
    return isApplyingExtraDamage;
}

export const GOD_OF_LEAVES_EFFECT = {
    name: "God of Leaves",
    description: "树叶飞向目标，0.5秒内造成3段1~3点物理伤害，冷却2秒",
    itemId: "minesia:god_of_leaves"
};

export function applyGodOfLeavesEffect(attacker, target) {
    try {
        const playerId = attacker.id;
        const currentTick = system.currentTick;
        const lastUse = playerCooldowns.get(playerId) || 0;

        if (currentTick - lastUse < COOLDOWN_TICKS) return;

        playerCooldowns.set(playerId, currentTick);

        for (let i = 0; i < 3; i++) {
            system.runTimeout(() => {
                try {
                    isApplyingExtraDamage = true;
                    const extraDamage = 1 + Math.floor(Math.random() * 3);

                    target.applyDamage(extraDamage, {
                        cause: "entityAttack",
                        damagingEntity: attacker
                    });

                    const loc = target.location;
                    attacker.dimension.spawnParticle("minecraft:crop_growth_area", {
                        x: loc.x,
                        y: loc.y + 1,
                        z: loc.z
                    });

                    debug.logWithTag("GodOfLeaves", `${attacker.name} 树叶造成 ${extraDamage} 点伤害 (第${i + 1}段)`);
                } catch (error) {
                    debug.logError("GodOfLeaves", `树叶伤害段${i + 1}出错: ${error?.message ?? error}`);
                } finally {
                    isApplyingExtraDamage = false;
                }
            }, 5 * (i + 1));
        }
    } catch (error) {
        debug.logError("GodOfLeaves", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isGodOfLeavesItem(itemId) {
    return itemId === "minesia:god_of_leaves";
}
