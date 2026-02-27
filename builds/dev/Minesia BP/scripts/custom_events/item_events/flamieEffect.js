import { EquipmentSlot, system } from "@minecraft/server";

export const FLAMIE_EFFECT = {
    name: "Flamie",
    description: "攻击时使目标着火5秒，副手装备时攻击使目标着火2秒",
    itemId: "minesia:flamie"
};

export function applyFlamieEffect(target, attacker, isOffhandEquipped) {
    try {
        const fireDuration = isOffhandEquipped ? 2 : 5;
        target.setOnFire(fireDuration, true);
        console.log(`[Flamie] ${attacker.name} 使目标着火 ${fireDuration} 秒`);
    } catch (error) {
        console.error("[Flamie] 应用着火效果时出错:", error?.message ?? error);
    }
}

export function isFlamieItem(itemId) {
    return itemId === "minesia:flamie";
}

export function hasFlamieEquipped(player) {
    try {
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return false;
        
        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        return offhandItem && offhandItem.typeId === "minesia:flamie";
    } catch (error) {
        return false;
    }
}
