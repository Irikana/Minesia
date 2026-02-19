import { EquipmentSlot } from "@minecraft/server";

export const ITEM_EFFECTS = {
    golden_phantom_membrane_active: {
        name: "黄金幻翼膜",
        description: "缓降I，最大体力+20%，每秒消耗1点耐久",
        itemId: "minesia:golden_phantom_membrane",
        interval: 20,
        onActivate: (player, StaminaSystem) => {
            player.addEffect("minecraft:slow_falling", 40, {
                amplifier: 0,
                showParticles: false
            });
            StaminaSystem.setMaxStaminaBonus(player, 20);
        },
        onTick: (player, StaminaSystem) => {
            player.addEffect("minecraft:slow_falling", 40, {
                amplifier: 0,
                showParticles: false
            });

            try {
                const equippable = player.getComponent("minecraft:equippable");
                if (!equippable) return;

                const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
                if (!offhandItem || offhandItem.typeId !== "minesia:golden_phantom_membrane") return;

                const durability = offhandItem.getComponent("minecraft:durability");
                if (!durability) return;

                if (durability.damage < durability.maxDurability) {
                    durability.damage += 1;
                    equippable.setEquipment(EquipmentSlot.Offhand, offhandItem);
                } else {
                    equippable.setEquipment(EquipmentSlot.Offhand, undefined);
                    player.playSound("random.break");
                }
            } catch (error) {
                console.error("[ItemEffect] 黄金幻翼膜耐久消耗失败:", error?.message ?? error);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
            player.removeEffect("minecraft:slow_falling");
            StaminaSystem.setMaxStaminaBonus(player, 0);
        }
    }
};

export function getItemEffectByTag(tag) {
    return ITEM_EFFECTS[tag];
}

export function getAllItemEffects() {
    return { ...ITEM_EFFECTS };
}
