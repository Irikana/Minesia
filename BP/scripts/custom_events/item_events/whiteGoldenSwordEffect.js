import { EquipmentSlot, system } from "@minecraft/server";
import { isCurrentlyApplyingCriticalDamage } from "../../critical_hit/criticalHitMain.js";
import { debug } from "../../debug/debugManager.js";

let isApplyingExtraDamage = false;

export function isCurrentlyApplyingWhiteGoldenSwordDamage() {
    return isApplyingExtraDamage;
}

export const WHITE_GOLDEN_SWORD_EFFECT = {
    name: "White Golden Sword",
    description: "攻击时有50%概率在0.5秒内造成2段额外1~2点物理伤害，触发时消耗1点耐久",
    itemId: "minesia:white_golden_sword"
};

export function applyWhiteGoldenSwordEffect(player, target, mainhandItem) {
    try {
        if (isCurrentlyApplyingCriticalDamage() || isApplyingExtraDamage) return;
        if (Math.random() >= 0.5) return;

        const durability = mainhandItem.getComponent("minecraft:durability");
        if (durability) {
            const equippable = player.getComponent("minecraft:equippable");
            if (durability.damage + 1 >= durability.maxDurability) {
                equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
                player.playSound("random.break");
                return;
            } else {
                durability.damage += 1;
                equippable.setEquipment(EquipmentSlot.Mainhand, mainhandItem);
            }
        }

        for (let i = 0; i < 2; i++) {
            system.runTimeout(() => {
                try {
                    isApplyingExtraDamage = true;
                    const extraDamage = 1 + Math.floor(Math.random() * 2);
                    target.applyDamage(extraDamage, {
                        cause: "entityAttack",
                        damagingEntity: player
                    });
                    debug.logWithTag("WhiteGoldenSword", `${player.name} 造成额外 ${extraDamage} 点伤害 (第${i + 1}段)`);
                } catch (error) {
                    debug.logError("WhiteGoldenSword", `额外伤害段${i + 1}出错: ${error?.message ?? error}`);
                } finally {
                    isApplyingExtraDamage = false;
                }
            }, 5 * (i + 1));
        }
    } catch (error) {
        debug.logError("WhiteGoldenSword", `应用效果时出错: ${error?.message ?? error}`);
    }
}

export function isWhiteGoldenSwordItem(itemId) {
    return itemId === "minesia:white_golden_sword";
}
