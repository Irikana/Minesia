import { world, system, EquipmentSlot } from "@minecraft/server";
import { getWeaponConfig, calculateRandomDamage } from "./config.js";
import { processWeaponAttack, hasWeaponEffect } from "../custom_events/item_events/weaponEffectRegistry.js";
import { StaminaSystem } from "../stamina/staminaMain.js";
import { debug } from "../debug/debugManager.js";
import { getTotalCriticalRate } from "../critical_hit/criticalHitMain.js";
import { CRITICAL_CONFIG } from "../critical_hit/config.js";

const recentAttacks = new Map();

export const recentRandomDamage = new Map();

let isApplyingRandomDamage = false;

export function isCurrentlyApplyingRandomDamage() {
    return isApplyingRandomDamage;
}

export function initializeRandomDamageSystem() {
    world.afterEvents.entityHurt.subscribe(handleEntityHurt);
    debug.logWithTag("RandomDamage", "系统初始化完成");
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

        let randomDamage = calculateRandomDamage(weaponConfig.minDamage, weaponConfig.maxDamage);

        const currentStamina = StaminaSystem.getStamina(attacker);
        const isExhausted = currentStamina <= 0;

        if (isExhausted) {
            randomDamage = Math.round(randomDamage * 0.5 * 10) / 10;
            StaminaSystem.setExhaustedDamageWarning(attacker.id, true);
        }

        const criticalRate = getTotalCriticalRate(attacker);
        const isCritical = criticalRate > 0 && Math.random() * 100 < criticalRate;
        let criticalDamage = 0;

        if (isCritical) {
            const baseDamageForCrit = damage + randomDamage;
            criticalDamage = Math.round(baseDamageForCrit * (CRITICAL_CONFIG.criticalDamageMultiplier - 1) * 10) / 10;
        }

        const totalExtraDamage = randomDamage + criticalDamage;

        if (totalExtraDamage > 0) {
            applyRandomDamage(hurtEntity, totalExtraDamage, attacker);

            recordRandomDamage(attacker, hurtEntity, damage, randomDamage, isExhausted, isCritical, criticalDamage);

            if (isCritical) {
                const loc = hurtEntity.location;
                attacker.dimension.spawnParticle(CRITICAL_CONFIG.particleEffect, {
                    x: loc.x,
                    y: loc.y + 1,
                    z: loc.z
                });
                attacker.playSound(CRITICAL_CONFIG.soundEffect);
                debug.logWithTag("CriticalHit", `${attacker.name} 触发暴击，额外伤害: ${criticalDamage}`);
            }

            debug.logWithTag("RandomDamage", `${attacker.name} 使用 ${mainhandItem.typeId} 造成 ${randomDamage} 点随机伤害${isExhausted ? ' (体力耗尽，伤害减半)' : ''}${isCritical ? ' (暴击)' : ''}`);
        }

        const totalDamage = damage + totalExtraDamage;

        processWeaponAttack({
            attacker,
            target: hurtEntity,
            mainhandItem,
            totalDamage,
            StaminaSystem
        });

    } catch (error) {
        debug.logError("RandomDamage", `处理伤害事件时出错: ${error?.message ?? error}`);
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
        debug.logError("RandomDamage", `应用随机伤害时出错: ${error?.message ?? error}`);
    } finally {
        isApplyingRandomDamage = false;
    }
}

function recordRandomDamage(attacker, target, baseDamage, randomDamage, isExhausted = false, isCritical = false, criticalDamage = 0) {
    const playerId = attacker.id;
    const tick = system.currentTick;

    recentRandomDamage.set(playerId, {
        targetId: target.id,
        targetType: target.typeId,
        baseDamage: baseDamage,
        randomDamage: randomDamage,
        criticalDamage: criticalDamage,
        totalDamage: baseDamage + randomDamage + criticalDamage,
        tick: tick,
        timestamp: Date.now(),
        isExhausted: isExhausted,
        isCritical: isCritical
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
