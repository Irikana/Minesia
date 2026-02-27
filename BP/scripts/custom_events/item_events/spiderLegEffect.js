import { EquipmentSlot, system } from "@minecraft/server";

export const SPIDER_LEG_EFFECT = {
    name: "Spider Leg",
    description: "副手装备时，每5刻恢复1点体力值",
    itemId: "minesia:spider_leg",
    tag: "spider_leg_active",
    interval: 5
};

export function isSpiderLegItem(itemId) {
    return itemId === "minesia:spider_leg";
}

export function hasSpiderLegEquipped(player) {
    try {
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return false;
        
        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        return offhandItem && offhandItem.typeId === "minesia:spider_leg";
    } catch (error) {
        return false;
    }
}
