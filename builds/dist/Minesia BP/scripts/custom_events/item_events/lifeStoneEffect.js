import { EquipmentSlot, system } from "@minecraft/server";

export const LIFE_STONE_EFFECT = {
    name: "Life Stone",
    description: "副手装备时，最大生命值增加50%",
    itemId: "minesia:life_stone",
    tag: "life_stone_active"
};

export function isLifeStoneItem(itemId) {
    return itemId === "minesia:life_stone";
}

export function hasLifeStoneEquipped(player) {
    try {
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) return false;
        
        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        return offhandItem && offhandItem.typeId === "minesia:life_stone";
    } catch (error) {
        return false;
    }
}
