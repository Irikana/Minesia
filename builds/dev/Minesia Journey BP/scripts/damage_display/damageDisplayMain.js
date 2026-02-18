// damageDisplayMain.js
// ===============================
// 伤害显示系统 - 核心逻辑
// 在玩家攻击时显示伤害信息
// ===============================

import { world, system } from "@minecraft/server";
import { DAMAGE_DISPLAY_CONFIG, getDisplayTexts } from "./config.js";
import { recentBonusDamage } from "../bonus_damage/bonusDamageMain.js";

const playerComboState = new Map();
const playerDisplayState = new Map();
const LANGUAGE_OBJECTIVE = "minesia_language";

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective(LANGUAGE_OBJECTIVE);
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 1) return "en_US";
        }
    } catch (e) { }
    return "zh_CN";
}

export function initializeDamageDisplaySystem() {
    world.afterEvents.entityHurt.subscribe(handleEntityHurt);
    console.log('[DamageDisplay] 系统初始化完成');
}

function handleEntityHurt(event) {
    if (!DAMAGE_DISPLAY_CONFIG.enabled) return;

    try {
        const { hurtEntity, damageSource, damage } = event;

        if (!damageSource || damageSource.cause !== "entityAttack") {
            return;
        }

        const attacker = damageSource.damagingEntity;
        if (!attacker || attacker.typeId !== "minecraft:player") {
            return;
        }

        const bonusDamageRecord = recentBonusDamage.get(attacker.id);
        let bonusDamage = 0;

        if (bonusDamageRecord) {
            bonusDamage = bonusDamageRecord.bonusDamage;
        }

        const totalDamage = damage + bonusDamage;

        showDamageDisplay(attacker, damage, bonusDamage, totalDamage, hurtEntity);

    } catch (error) {
        console.error('[DamageDisplay] 处理伤害显示时出错:', error?.message ?? error);
    }
}

function showDamageDisplay(player, baseDamage, bonusDamage, totalDamage, target) {
    const playerId = player.id;
    const targetId = target.id;
    const currentTick = system.currentTick;
    const locale = getPlayerLocale(player);
    const texts = getDisplayTexts(locale);

    const existingCombo = playerComboState.get(playerId);
    let hitCount = 1;
    let accumulatedDamage = totalDamage;

    if (existingCombo) {
        const tickDiff = currentTick - existingCombo.lastAttackTick;

        if (existingCombo.targetId === targetId && tickDiff <= DAMAGE_DISPLAY_CONFIG.comboTimeWindow) {
            existingCombo.accumulatedDamage += totalDamage;
            existingCombo.hitCount += 1;
            existingCombo.lastAttackTick = currentTick;
            hitCount = existingCombo.hitCount;
            accumulatedDamage = existingCombo.accumulatedDamage;
        } else {
            existingCombo.accumulatedDamage = totalDamage;
            existingCombo.hitCount = 1;
            existingCombo.targetId = targetId;
            existingCombo.lastAttackTick = currentTick;
        }
    } else {
        playerComboState.set(playerId, {
            targetId: targetId,
            targetType: target.typeId,
            accumulatedDamage: totalDamage,
            hitCount: 1,
            lastAttackTick: currentTick
        });
    }

    const displayText = buildDisplayText(
        baseDamage,
        bonusDamage,
        accumulatedDamage,
        texts,
        hitCount
    );

    playerDisplayState.set(playerId, {
        displayText: displayText,
        displayTick: currentTick
    });

    player.onScreenDisplay.setActionBar(displayText);

    system.runTimeout(() => {
        clearDamageDisplay(playerId);
    }, DAMAGE_DISPLAY_CONFIG.displayDuration);
}

function buildDisplayText(baseDamage, bonusDamage, totalDamage, texts, hitCount = 1) {
    const color = DAMAGE_DISPLAY_CONFIG.textColor;

    if (DAMAGE_DISPLAY_CONFIG.debugMode) {
        return `${color}${texts.baseDamage}: ${baseDamage.toFixed(1)} | ${texts.bonusDamage}: ${bonusDamage.toFixed(1)} | ${texts.totalDamage}: ${totalDamage.toFixed(1)}`;
    }

    if (DAMAGE_DISPLAY_CONFIG.showTotalDamage) {
        if (hitCount > 1) {
            return `${color}${texts.damage}: ${totalDamage.toFixed(1)} (x${hitCount})`;
        }
        return `${color}${texts.damage}: ${totalDamage.toFixed(1)}`;
    }

    let parts = [];

    if (DAMAGE_DISPLAY_CONFIG.showBaseDamage) {
        parts.push(`${texts.baseDamage}: ${baseDamage.toFixed(1)}`);
    }

    if (DAMAGE_DISPLAY_CONFIG.showBonusDamage && bonusDamage > 0) {
        parts.push(`${texts.bonusDamage}: ${bonusDamage.toFixed(1)}`);
    }

    if (DAMAGE_DISPLAY_CONFIG.showTotalDamage) {
        parts.push(`${texts.totalDamage}: ${totalDamage.toFixed(1)}`);
    }

    if (parts.length === 0) {
        return `${color}${texts.damage}: ${totalDamage.toFixed(1)}`;
    }

    return `${color}${parts.join(' | ')}`;
}

function clearDamageDisplay(playerId) {
    const displayState = playerDisplayState.get(playerId);
    if (displayState) {
        const elapsed = system.currentTick - displayState.displayTick;
        if (elapsed >= DAMAGE_DISPLAY_CONFIG.displayDuration) {
            playerDisplayState.delete(playerId);
        }
    }

    const comboState = playerComboState.get(playerId);
    if (comboState) {
        const elapsed = system.currentTick - comboState.lastAttackTick;
        if (elapsed > DAMAGE_DISPLAY_CONFIG.comboTimeWindow) {
            playerComboState.delete(playerId);
        }
    }
}

function getEntityDisplayName(entity) {
    try {
        if (entity.nameTag && entity.nameTag.length > 0) {
            return entity.nameTag;
        }

        const typeId = entity.typeId;
        const namePart = typeId.split(':')[1] || typeId;
        return namePart.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    } catch (e) {
        return 'Unknown';
    }
}

export function getDisplayState(playerId) {
    return playerDisplayState.get(playerId);
}

export function clearAllDisplays() {
    playerDisplayState.clear();
    playerComboState.clear();
}
