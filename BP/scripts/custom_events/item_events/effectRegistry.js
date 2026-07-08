import { EquipmentSlot, EntityComponentTypes } from "@minecraft/server";
import { debug } from "../../debug/debugManager.js";
import { getPlayerAccessoryItems } from "../../accessory/index.js";

function findItemInOffhandOrAccessory(player, itemId) {
    const equippable = player.getComponent("minecraft:equippable");
    if (equippable) {
        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        if (offhandItem && offhandItem.typeId === itemId) {
            return { location: "offhand", item: offhandItem };
        }
    }

    for (const accessory of getPlayerAccessoryItems(player)) {
        if (accessory.item.typeId === itemId) {
            return { location: "accessory", slotIndex: accessory.slotIndex, item: accessory.item };
        }
    }

    return null;
}

function updateItemInSlot(player, found) {
    if (found.location === "offhand") {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) equippable.setEquipment(EquipmentSlot.Offhand, found.item);
    } else if (found.location === "accessory") {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (inventory?.container) {
            inventory.container.setItem(found.slotIndex, found.item);
        }
    }
}

function removeItemInSlot(player, found) {
    if (found.location === "offhand") {
        const equippable = player.getComponent("minecraft:equippable");
        if (equippable) equippable.setEquipment(EquipmentSlot.Offhand, undefined);
    } else if (found.location === "accessory") {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (inventory?.container) {
            inventory.container.setItem(found.slotIndex, undefined);
        }
    }
}

export const ITEM_EFFECTS = {
    golden_phantom_membrane_active: {
        name: "黄金幻翼膜",
        description: "缓降I，最大体力+20，每秒消耗1点耐久",
        itemId: "minesia:golden_phantom_membrane",
        interval: 20,
        onActivate: (player, StaminaSystem) => {
            player.addEffect("minecraft:slow_falling", 40, {
                amplifier: 0,
                showParticles: false
            });
        },
        onTick: (player, StaminaSystem) => {
            player.addEffect("minecraft:slow_falling", 40, {
                amplifier: 0,
                showParticles: false
            });

            try {
                const found = findItemInOffhandOrAccessory(player, "minesia:golden_phantom_membrane");
                if (!found) return;

                const durability = found.item.getComponent("minecraft:durability");
                if (!durability) return;

                if (durability.damage < durability.maxDurability) {
                    durability.damage += 1;
                    updateItemInSlot(player, found);
                } else {
                    removeItemInSlot(player, found);
                    player.playSound("random.break");
                }
            } catch (error) {
                debug.logError("ItemEffect", `黄金幻翼膜耐久消耗失败: ${error?.message ?? error}`);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
            player.removeEffect("minecraft:slow_falling");
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
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 1);
            }

            const health = player.getComponent("minecraft:health");
            if (health && health.currentValue <= 4) {
                const found = findItemInOffhandOrAccessory(player, "minesia:statue_totem");
                if (!found) return;

                removeItemInSlot(player, found);

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
        }
    },
    desert_pyramid_pearl_active: {
        name: "沙漠神殿珍珠",
        description: "副手装备时增加100%最大体力值、50%最大生命值，每秒恢复8点体力值",
        itemId: "minesia:desert_pyramid_pearl",
        interval: 20,
        onActivate: (player, StaminaSystem) => {
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 8, true);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
        }
    },
    desert_pyramid_eye_active: {
        name: "沙漠神殿之眼",
        description: "副手装备时增加30%暴击率、50%最大体力值，每秒恢复4点体力值",
        itemId: "minesia:desert_pyramid_eye",
        interval: 20,
        onActivate: (player, StaminaSystem) => {
        },
        onTick: (player, StaminaSystem) => {
            if (StaminaSystem) {
                StaminaSystem.recoverStamina(player, 4, true);
            }
        },
        onDeactivate: (player, StaminaSystem) => {
        }
    }
};

export function getItemEffectByTag(tag) {
    return ITEM_EFFECTS[tag];
}

export function getAllItemEffects() {
    return { ...ITEM_EFFECTS };
}
