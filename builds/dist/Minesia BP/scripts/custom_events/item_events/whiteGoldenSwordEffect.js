import { EquipmentSlot, system } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

export const WHITE_GOLDEN_SWORD_EFFECT = {
    name: "White Golden Sword",
    description: "每次攻击时额外随机消耗0到2点耐久度",
    itemId: "minesia:white_golden_sword"
};

export function applyWhiteGoldenSwordEffect(player, mainhandItem) {
    try {
        const extraDamage = Math.floor(Math.random() * 3);
        if (extraDamage > 0) {
            const durability = mainhandItem.getComponent("minecraft:durability");
            if (durability) {
                const equippable = player.getComponent("minecraft:equippable");
                if (durability.damage + extraDamage >= durability.maxDurability) {
                    equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
                    player.playSound("random.break");
                } else {
                    durability.damage += extraDamage;
                    equippable.setEquipment(EquipmentSlot.Mainhand, mainhandItem);
                }
            }
        }
    } catch (error) {
        debug.logError("WhiteGoldenSword", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isWhiteGoldenSwordItem(itemId) {
    return itemId === "minesia:white_golden_sword";
}
