// bonusDamageMain.js
// ===============================
// 附加伤害系统 - 核心逻辑
// 处理玩家攻击事件，计算并应用附加伤害
// ===============================

import { world, system, EquipmentSlot } from "@minecraft/server";
import { getWeaponConfig, calculateBonusDamage } from "./config.js";
import { applyTinaEffect } from "../custom_events/item_events/tinaEffect.js";

const recentAttacks = new Map();

export const recentBonusDamage = new Map();

export function initializeBonusDamageSystem() {
    world.afterEvents.entityHurt.subscribe(handleEntityHurt);
    console.log('[BonusDamage] 系统初始化完成');
}

function handleEntityHurt(event) {
    try {
        const { hurtEntity, damageSource, damage } = event;

        if (!damageSource || damageSource.cause !== "entityAttack") {
            return;
        }

        const attacker = damageSource.damagingEntity;
        if (!attacker || attacker.typeId !== "minecraft:player") {
            return;
        }

        const equippable = attacker.getComponent('minecraft:equippable');
        if (!equippable) return;

        const mainhandItem = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (!mainhandItem) return;

        const weaponConfig = getWeaponConfig(mainhandItem.typeId);
        if (!weaponConfig) return;

        const attackId = `${attacker.id}_${hurtEntity.id}_${system.currentTick}`;
        if (recentAttacks.has(attackId)) {
            return;
        }
        recentAttacks.set(attackId, true);

        system.runTimeout(() => {
            recentAttacks.delete(attackId);
        }, 5);

        const bonusDamage = calculateBonusDamage(weaponConfig.minDamage, weaponConfig.maxDamage);

        if (bonusDamage > 0) {
            applyExtraDamage(hurtEntity, bonusDamage, attacker);

            recordBonusDamage(attacker, hurtEntity, damage, bonusDamage);

            console.log(`[BonusDamage] ${attacker.name} 使用 ${mainhandItem.typeId} 造成 ${bonusDamage} 点附加伤害`);
        }

        if (attacker.hasTag("desert_walker_active")) {
            applyDesertWalkerEffect(hurtEntity, attacker);
        }

        if (attacker.hasTag("tina_active")) {
            applyTinaEffect(hurtEntity, attacker);
        }

    } catch (error) {
        console.error('[BonusDamage] 处理伤害事件时出错:', error?.message ?? error);
    }
}

function applyDesertWalkerEffect(target, attacker) {
    try {
        if (Math.random() < 0.5) {
            target.addEffect("minecraft:slowness", 20, {
                amplifier: 0,
                showParticles: true
            });
            console.log(`[DesertWalker] ${attacker.name} 的沙漠行者触发了减速效果`);
        }
    } catch (error) {
        console.error('[DesertWalker] 应用减速效果时出错:', error?.message ?? error);
    }
}

function applyExtraDamage(target, damage, attacker) {
    try {
        const currentHealth = target.getComponent('minecraft:health');
        if (!currentHealth) return;

        const currentHealthValue = currentHealth.currentValue;

        const newHealth = Math.max(0, currentHealthValue - damage);
        currentHealth.setCurrentValue(newHealth);

    } catch (error) {
        console.error('[BonusDamage] 应用附加伤害时出错:', error?.message ?? error);
    }
}

function recordBonusDamage(attacker, target, baseDamage, bonusDamage) {
    const playerId = attacker.id;
    const tick = system.currentTick;

    recentBonusDamage.set(playerId, {
        targetId: target.id,
        targetType: target.typeId,
        baseDamage: baseDamage,
        bonusDamage: bonusDamage,
        totalDamage: baseDamage + bonusDamage,
        tick: tick,
        timestamp: Date.now()
    });

    system.runTimeout(() => {
        const record = recentBonusDamage.get(playerId);
        if (record && record.tick === tick) {
            recentBonusDamage.delete(playerId);
        }
    }, 100);
}

export function getRecentBonusDamage(playerId) {
    return recentBonusDamage.get(playerId);
}

export function getWeaponDamageInfo(itemId) {
    const config = getWeaponConfig(itemId);
    if (!config) return null;

    return {
        minDamage: config.minDamage,
        maxDamage: config.maxDamage,
        enabled: config.enabled
    };
}
