import { EquipmentSlot } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";

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
                debug.logError("ItemEffect", `黄金幻翼膜耐久消耗失败: ${error?.message ?? error}`);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
            player.removeEffect("minecraft:slow_falling");
            StaminaSystem.setMaxStaminaBonus(player, 0);
        }
    },
    life_stone_active: {
        name: "生命之石",
        description: "副手装备时，最大生命值增加50%",
        itemId: "minesia:life_stone",
        interval: 200,
        onActivate: (player, StaminaSystem) => {
        },
        onTick: (player, StaminaSystem) => {
        },
        onDeactivate: (player, StaminaSystem) => {
        }
    },
    spider_leg_active: {
        name: "蜘蛛腿",
        description: "副手装备时，每5刻恢复1点体力值",
        itemId: "minesia:spider_leg",
        interval: 5,
        onActivate: (player, StaminaSystem) => {
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 1);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
        }
    },
    statue_totem_active: {
        name: "雕像图腾",
        description: "副手装备时增加25%最大生命值和80%体力值，每半秒恢复1点体力值",
        itemId: "minesia:statue_totem",
        interval: 10,
        onActivate: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.setMaxStaminaBonus(player, 80);
            }
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 1);
            }

            const health = player.getComponent("minecraft:health");
            if (health && health.currentValue <= 4) {
                const equippable = player.getComponent("minecraft:equippable");
                if (!equippable) return;

                const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
                if (!offhandItem || offhandItem.typeId !== "minesia:statue_totem") return;

                equippable.setEquipment(EquipmentSlot.Offhand, undefined);

                player.addEffect("minecraft:resistance", 1200, { amplifier: 0, showParticles: true });
                player.addEffect("minecraft:fire_resistance", 1200, { amplifier: 0, showParticles: true });
                player.addEffect("minecraft:regeneration", 1200, { amplifier: 0, showParticles: true });

                player.playSound("random.totem");

                const loc = player.location;
                for (let i = 0; i < 20; i++) {
                    player.dimension.spawnParticle("minecraft:totem_particle", {
                        x: loc.x + (Math.random() - 0.5) * 2,
                        y: loc.y + Math.random() * 2,
                        z: loc.z + (Math.random() - 0.5) * 2
                    });
                }
            }
        },
        onDeactivate: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.setMaxStaminaBonus(player, 0);
            }
        }
    },
    desert_pyramid_pearl_active: {
        name: "沙漠神殿珍珠",
        description: "副手装备时增加100%最大体力值、50%最大生命值，每秒恢复8点体力值",
        itemId: "minesia:desert_pyramid_pearl",
        interval: 20,
        onActivate: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.setMaxStaminaBonus(player, 100);
            }
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 8, true);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.setMaxStaminaBonus(player, 0);
            }
        }
    },
    desert_pyramid_eye_active: {
        name: "沙漠神殿之眼",
        description: "副手装备时增加30%暴击率、50%最大体力值，每秒恢复4点体力值",
        itemId: "minesia:desert_pyramid_eye",
        interval: 20,
        onActivate: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.setMaxStaminaBonus(player, 50);
            }
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 4, true);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.setMaxStaminaBonus(player, 0);
            }
        }
    }
};

export function getItemEffectByTag(tag) {
    return ITEM_EFFECTS[tag];
}

export function getAllItemEffects() {
    return { ...ITEM_EFFECTS };
}
