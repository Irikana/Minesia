import { debug } from "../../debug/debugManager.js";

export const FROST_EDGE_EFFECT = {
    name: "Frost Edge",
    description: "35%概率使目标缓慢II持续4秒",
    itemId: "minesia:frost_edge"
};

const FROST_CHANCE = 0.35;
const FROST_DURATION = 80; // 4 seconds (20 ticks per second)
const FROST_AMPLIFIER = 1; // Slowness II

export function applyFrostEdgeEffect(target, attacker) {
    try {
        if (Math.random() < FROST_CHANCE) {
            target.addEffect("minecraft:slowness", FROST_DURATION, {
                amplifier: FROST_AMPLIFIER,
                showParticles: true
            });
            debug.logWithTag("FrostEdge", `${attacker.name} 的霜刃使目标缓慢 ${FROST_DURATION / 20} 秒`);
        }
    } catch (error) {
        debug.logError("FrostEdge", `应用霜冻效果时出错: ${error?.message ?? error}`);
    }
}

export function isFrostEdgeItem(itemId) {
    return itemId === "minesia:frost_edge";
}
