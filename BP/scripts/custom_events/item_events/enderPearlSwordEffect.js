import { EquipmentSlot, system, Vector3, world } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

export const ENDER_PEARL_SWORD_EFFECT = {
    name: "Ender Pearl Sword",
    description: "攻击时传送目标，副手装备时将目标传送至高处",
    itemId: "minesia:ender_pearl_sword"
};

export function applyEnderPearlSwordEffect(target, attacker, isOffhandEquipped) {
    try {
        const targetLoc = target.location;
        const attackerLoc = attacker.location;

        let newLoc;
        if (isOffhandEquipped) {
            newLoc = {
                x: targetLoc.x,
                y: targetLoc.y + 4,
                z: targetLoc.z
            };
        } else {
            const direction = {
                x: targetLoc.x - attackerLoc.x,
                z: targetLoc.z - attackerLoc.z
            };
            const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
            if (length > 0) {
                direction.x = direction.x / length;
                direction.z = direction.z / length;
            }

            newLoc = {
                x: targetLoc.x + direction.x * 2,
                y: targetLoc.y,
                z: targetLoc.z + direction.z * 2
            };
        }

        target.dimension.spawnParticle("minecraft:enderman_teleport_particle", targetLoc);
        target.dimension.spawnParticle("minecraft:enderman_teleport_particle", newLoc);

        target.teleport(newLoc);

        attacker.runCommand("playsound mob.endermen.portal @s");

        debug.logWithTag("EnderPearlSword", `${attacker.name} 传送目标`);
    } catch (error) {
        debug.logError("EnderPearlSword", `应用传送效果时出错: ${error?.message ?? error}`);
    }
}

export function isEnderPearlSwordItem(itemId) {
    return itemId === "minesia:ender_pearl_sword";
}

export function hasEnderPearlSwordEquipped(player) {
    try {
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return false;

        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        return offhandItem && offhandItem.typeId === "minesia:ender_pearl_sword";
    } catch (error) {
        return false;
    }
}
