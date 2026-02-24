// randomDamageMain.js
// ===============================
// 随机伤害系统 - 核心逻辑
// 处理玩家攻击事件，计算并应用随机伤害
// ===============================

import { world, system, EquipmentSlot } from "@minecraft/server";
import { getWeaponConfig, calculateRandomDamage } from "./config.js";
import { applyTinaEffect } from "../custom_events/item_events/tinaEffect.js";
import { applyScytheEffect, isScytheItem } from "../custom_events/item_events/scytheEffect.js";

const recentAttacks = new Map();

export const recentRandomDamage = new Map();

let isApplyingRandomDamage = false;

export function isCurrentlyApplyingRandomDamage() {
    return isApplyingRandomDamage;
}

export function initializeRandomDamageSystem() {
    world.afterEvents.entityHurt.subscribe(handleEntityHurt);
    console.log('[RandomDamage] 系统初始化完成');
}

function handleEntityHurt(event) {
    try {
        if (isApplyingRandomDamage) {
            return;
        }

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

        const randomDamage = calculateRandomDamage(weaponConfig.minDamage, weaponConfig.maxDamage);

        if (randomDamage > 0) {
            applyRandomDamage(hurtEntity, randomDamage, attacker);

            recordRandomDamage(attacker, hurtEntity, damage, randomDamage);

            console.log(`[RandomDamage] ${attacker.name} 使用 ${mainhandItem.typeId} 造成 ${randomDamage} 点随机伤害`);
        }

        if (attacker.hasTag("desert_walker_active")) {
            applyDesertWalkerEffect(hurtEntity, attacker);
        }

        if (attacker.hasTag("tina_active")) {
            applyTinaEffect(hurtEntity, attacker);
        }

        if (isScytheItem(mainhandItem.typeId)) {
            const totalDamage = damage + randomDamage;
            applyScytheEffect(hurtEntity, attacker, totalDamage);
        }

    } catch (error) {
        console.error('[RandomDamage] 处理伤害事件时出错:', error?.message ?? error);
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

function applyRandomDamage(target, damage, attacker) {
    try {
        isApplyingRandomDamage = true;

        target.applyDamage(damage, {
            cause: "entityAttack",
            damagingEntity: attacker
        });

    } catch (error) {
        console.error('[RandomDamage] 应用随机伤害时出错:', error?.message ?? error);
    } finally {
        isApplyingRandomDamage = false;
    }
}

function recordRandomDamage(attacker, target, baseDamage, randomDamage) {
    const playerId = attacker.id;
    const tick = system.currentTick;

    recentRandomDamage.set(playerId, {
        targetId: target.id,
        targetType: target.typeId,
        baseDamage: baseDamage,
        randomDamage: randomDamage,
        totalDamage: baseDamage + randomDamage,
        tick: tick,
        timestamp: Date.now()
    });

    system.runTimeout(() => {
        const record = recentRandomDamage.get(playerId);
        if (record && record.tick === tick) {
            recentRandomDamage.delete(playerId);
        }
    }, 100);
}

export function getRecentRandomDamage(playerId) {
    return recentRandomDamage.get(playerId);
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
