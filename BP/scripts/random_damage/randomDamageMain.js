// randomDamageMain.js
// ===============================
// 随机伤害系统 - 核心逻辑
// 处理玩家攻击事件，计算并应用随机伤害
// ===============================

import { world, system, EquipmentSlot } from "@minecraft/server";
import { getWeaponConfig, calculateRandomDamage } from "./config.js";
import { applyTinaEffect } from "../custom_events/item_events/tinaEffect.js";
import { applyScytheEffect, isScytheItem } from "../custom_events/item_events/scytheEffect.js";
import { applyFlamieEffect, isFlamieItem, hasFlamieEquipped } from "../custom_events/item_events/flamieEffect.js";
import { applyTheForestEffect, isTheForestItem } from "../custom_events/item_events/theForestEffect.js";
import { applyEnderPearlSwordEffect, isEnderPearlSwordItem, hasEnderPearlSwordEquipped } from "../custom_events/item_events/enderPearlSwordEffect.js";
import { applyDutyIceEffect, isDutyIceItem } from "../custom_events/item_events/dutyIceEffect.js";
import { applyPioneerEffect, isPioneerItem } from "../custom_events/item_events/pioneerEffect.js";
import { applySelfishEffect, isSelfishItem } from "../custom_events/item_events/selfishEffect.js";
import { applyBlackDaggerEffect, isBlackDaggerItem } from "../custom_events/item_events/blackDaggerEffect.js";
import { applyWhiteGoldenSwordEffect, isWhiteGoldenSwordItem } from "../custom_events/item_events/whiteGoldenSwordEffect.js";
import { StaminaSystem } from "../stamina/staminaMain.js";
import { debug } from "../debug/debugManager.js";

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

        if (randomDamage > 0) {
            applyRandomDamage(hurtEntity, randomDamage, attacker);

            recordRandomDamage(attacker, hurtEntity, damage, randomDamage, isExhausted);

            debug.logWithTag("RandomDamage", `${attacker.name} 使用 ${mainhandItem.typeId} 造成 ${randomDamage} 点随机伤害${isExhausted ? ' (体力耗尽，伤害减半)' : ''}`);
        }

        if (attacker.hasTag("desert_walker_active")) {
            applyDesertWalkerEffect(hurtEntity, attacker);
        }

        if (isDesertScytheItem(mainhandItem.typeId)) {
            applyDesertScytheEffect(hurtEntity, attacker);
        }

        if (attacker.hasTag("tina_active")) {
            applyTinaEffect(hurtEntity, attacker);
        }

        if (isScytheItem(mainhandItem.typeId)) {
            const totalDamage = damage + randomDamage;
            applyScytheEffect(hurtEntity, attacker, totalDamage);
        }

        if (isFlamieItem(mainhandItem.typeId)) {
            applyFlamieEffect(hurtEntity, attacker, false);
        } else if (attacker.hasTag("flamie_offhand_active")) {
            applyFlamieEffect(hurtEntity, attacker, true);
        }

        if (isTheForestItem(mainhandItem.typeId)) {
            applyTheForestEffect(hurtEntity, attacker, StaminaSystem);
        }

        if (isEnderPearlSwordItem(mainhandItem.typeId)) {
            applyEnderPearlSwordEffect(hurtEntity, attacker, false);
        } else if (attacker.hasTag("ender_pearl_sword_offhand_active")) {
            applyEnderPearlSwordEffect(hurtEntity, attacker, true);
        }

        if (isDutyIceItem(mainhandItem.typeId)) {
            applyDutyIceEffect(hurtEntity, attacker);
        }

        if (isPioneerItem(mainhandItem.typeId)) {
            applyPioneerEffect(hurtEntity, attacker, StaminaSystem);
        }

        if (isSelfishItem(mainhandItem.typeId)) {
            applySelfishEffect(hurtEntity, attacker);
        }

        if (isBlackDaggerItem(mainhandItem.typeId)) {
            applyBlackDaggerEffect(hurtEntity, attacker);
        }

        if (isWhiteGoldenSwordItem(mainhandItem.typeId)) {
            applyWhiteGoldenSwordEffect(attacker, mainhandItem);
        }

    } catch (error) {
        debug.logError("RandomDamage", `处理伤害事件时出错: ${error?.message ?? error}`);
    }
}

function applyDesertWalkerEffect(target, attacker) {
    try {
        if (Math.random() < 0.5) {
            target.addEffect("minecraft:slowness", 20, {
                amplifier: 0,
                showParticles: true
            });
            debug.logWithTag("DesertWalker", `${attacker.name} 的沙漠行者触发了减速效果`);
        }
    } catch (error) {
        debug.logError("DesertWalker", `应用减速效果时出错: ${error?.message ?? error}`);
    }
}

function isDesertScytheItem(itemId) {
    return itemId === "minesia:desert_scythe";
}

function applyDesertScytheEffect(target, attacker) {
    try {
        if (Math.random() < 0.25) {
            target.addEffect("minecraft:slowness", 100, {
                amplifier: 0,
                showParticles: true
            });
            debug.logWithTag("DesertScythe", `${attacker.name} 的沙漠镰刀触发了减速效果`);
        }
    } catch (error) {
        debug.logError("DesertScythe", `应用减速效果时出错: ${error?.message ?? error}`);
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

function recordRandomDamage(attacker, target, baseDamage, randomDamage, isExhausted = false) {
    const playerId = attacker.id;
    const tick = system.currentTick;

    recentRandomDamage.set(playerId, {
        targetId: target.id,
        targetType: target.typeId,
        baseDamage: baseDamage,
        randomDamage: randomDamage,
        totalDamage: baseDamage + randomDamage,
        tick: tick,
        timestamp: Date.now(),
        isExhausted: isExhausted
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
