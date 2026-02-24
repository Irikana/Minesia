// staminaSetEffectAdapter.js
// ===============================
// 体力值系统 - 套装效果适配器
// 采用反向依赖设计，体力值系统主动监听套装系统的状态标签
// ===============================

import { system } from "@minecraft/server";
import { StaminaSystem } from "./staminaMain.js";

const STAMINA_SET_EFFECTS = {
    "endurance_set": {
        name: "耐力套装",
        description: "最大体力+50，消耗减少30%，恢复增加50%",
        onEquip: (player) => {
            StaminaSystem.addConsumptionModifier(player, "endurance_set", 0.7);
            StaminaSystem.addRecoveryModifier(player, "endurance_set", 1.5);
            StaminaSystem.setMaxStaminaBonus(player, 50);
        },
        onUnequip: (player) => {
            StaminaSystem.removeConsumptionModifier(player, "endurance_set");
            StaminaSystem.removeRecoveryModifier(player, "endurance_set");
            StaminaSystem.setMaxStaminaBonus(player, 0);
        }
    },
    "agility_set": {
        name: "敏捷套装",
        description: "体力消耗减少50%",
        onEquip: (player) => {
            StaminaSystem.addConsumptionModifier(player, "agility_set", 0.5);
        },
        onUnequip: (player) => {
            StaminaSystem.removeConsumptionModifier(player, "agility_set");
        }
    },
    "heavy_armor_set": {
        name: "重甲套装",
        description: "体力消耗增加50%，恢复减少30%",
        onEquip: (player) => {
            StaminaSystem.addConsumptionModifier(player, "heavy_armor_set", 1.5);
            StaminaSystem.addRecoveryModifier(player, "heavy_armor_set", 0.7);
        },
        onUnequip: (player) => {
            StaminaSystem.removeConsumptionModifier(player, "heavy_armor_set");
            StaminaSystem.removeRecoveryModifier(player, "heavy_armor_set");
        }
    },
    "stamina_ring_active": {
        name: "体力戒指",
        description: "体力恢复增加100%",
        onEquip: (player) => {
            StaminaSystem.addRecoveryModifier(player, "stamina_ring", 2.0);
        },
        onUnequip: (player) => {
            StaminaSystem.removeRecoveryModifier(player, "stamina_ring");
        }
    },
    "endurance_ring_active": {
        name: "耐力戒指",
        description: "最大体力+30，消耗减少20%",
        onEquip: (player) => {
            StaminaSystem.setMaxStaminaBonus(player, 30);
            StaminaSystem.addConsumptionModifier(player, "endurance_ring", 0.8);
        },
        onUnequip: (player) => {
            StaminaSystem.setMaxStaminaBonus(player, 0);
            StaminaSystem.removeConsumptionModifier(player, "endurance_ring");
        }
    }
};

const playerActiveEffects = new Map();

export function processStaminaSetEffects(player) {
    const playerId = player.id;
    const currentEffects = new Set();
    
    for (const [tag, effect] of Object.entries(STAMINA_SET_EFFECTS)) {
        if (player.hasTag(tag)) {
            currentEffects.add(tag);
        }
    }
    
    const previousEffects = playerActiveEffects.get(playerId) || new Set();
    
    for (const tag of currentEffects) {
        if (!previousEffects.has(tag)) {
            try {
                STAMINA_SET_EFFECTS[tag].onEquip(player);
            } catch (error) {
                console.error(`[StaminaSetEffect] 激活效果 ${tag} 失败:`, error?.message ?? error);
            }
        }
    }
    
    for (const tag of previousEffects) {
        if (!currentEffects.has(tag)) {
            try {
                STAMINA_SET_EFFECTS[tag].onUnequip(player);
            } catch (error) {
                console.error(`[StaminaSetEffect] 移除效果 ${tag} 失败:`, error?.message ?? error);
            }
        }
    }
    
    playerActiveEffects.set(playerId, currentEffects);
}

export function registerStaminaSetEffect(tag, effect) {
    STAMINA_SET_EFFECTS[tag] = effect;
}

export function unregisterStaminaSetEffect(tag) {
    delete STAMINA_SET_EFFECTS[tag];
}

export function getStaminaSetEffects() {
    return { ...STAMINA_SET_EFFECTS };
}
