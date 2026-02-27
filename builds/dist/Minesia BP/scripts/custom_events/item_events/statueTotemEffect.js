import { EquipmentSlot, system } from "@minecraft/server";

export const STATUE_TOTEM_EFFECT = {
    name: "Statue Totem",
    description: "副手装备时增加25%最大生命值和80%体力值，每半秒恢复1点体力值，生命值低于4点时消耗物品提供增益",
    itemId: "minesia:statue_totem",
    tag: "statue_totem_active"
};

export function isStatueTotemItem(itemId) {
    return itemId === "minesia:statue_totem";
}

export function hasStatueTotemEquipped(player) {
    try {
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return false;
        
        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        return offhandItem && offhandItem.typeId === "minesia:statue_totem";
    } catch (error) {
        return false;
    }
}
