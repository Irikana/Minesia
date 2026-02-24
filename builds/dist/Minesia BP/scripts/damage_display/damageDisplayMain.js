// damageDisplayMain.js
// ===============================
// 伤害显示系统 - 核心逻辑
// 在玩家攻击时显示伤害信息
// ===============================

import { world, system } from "@minecraft/server";
import { DAMAGE_DISPLAY_CONFIG, getDisplayTexts } from "./config.js";
import { recentRandomDamage, isCurrentlyApplyingRandomDamage } from "../random_damage/randomDamageMain.js";
import { ActionBarManager, DISPLAY_PRIORITIES } from "../action_bar/index.js";
import { getAoeDamageRecord, isAoeEntity } from "../custom_events/item_events/aoeDamageRegistry.js";
import { isLevelUpDisplayActive } from "../minesia_level/minesiaLevelEvent.js";

const playerComboState = new Map();
const playerDisplayState = new Map();
const LANGUAGE_OBJECTIVE = "minesia_language";
const DEFAULT_LOCALE = "zh_CN";
const processedAttacks = new Map();

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective(LANGUAGE_OBJECTIVE);
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 0) return "en_US";
            return "zh_CN";
        }
    } catch (e) { }
    return DEFAULT_LOCALE;
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

        if (isLevelUpDisplayActive(attacker.id)) {
            return;
        }

        if (isAoeEntity(hurtEntity.id)) {
            return;
        }

        if (isCurrentlyApplyingRandomDamage()) {
            return;
        }

        const attackId = `${attacker.id}_${hurtEntity.id}_${system.currentTick}`;
        if (processedAttacks.has(attackId)) {
            return;
        }
        processedAttacks.set(attackId, true);

        system.runTimeout(() => {
            processedAttacks.delete(attackId);
        }, 5);

        const randomDamageRecord = recentRandomDamage.get(attacker.id);
        let randomDamage = 0;

        if (randomDamageRecord) {
            randomDamage = randomDamageRecord.randomDamage;
        }

        const totalDamage = randomDamage > 0 ? randomDamage : damage;

        showDamageDisplay(attacker, totalDamage, hurtEntity);

    } catch (error) {
        console.error('[DamageDisplay] 处理伤害显示时出错:', error?.message ?? error);
    }
}

function showDamageDisplay(player, totalDamage, target) {
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

    const aoeRecord = getAoeDamageRecord(playerId);
    let aoeDamage = 0;
    let aoeTargetCount = 0;
    let aoeSourceName = "";
    let aoeSourceNameEn = "";

    if (aoeRecord) {
        aoeDamage = aoeRecord.totalDamage;
        aoeTargetCount = aoeRecord.targetCount;
        aoeSourceName = aoeRecord.sourceName;
        aoeSourceNameEn = aoeRecord.sourceNameEn;
    }

    const displayText = buildDisplayText(
        accumulatedDamage,
        texts,
        hitCount,
        aoeDamage,
        aoeTargetCount,
        aoeSourceName,
        aoeSourceNameEn,
        locale
    );

    playerDisplayState.set(playerId, {
        displayText: displayText,
        displayTick: currentTick
    });

    ActionBarManager.setLine(playerId, 'damage', displayText, DISPLAY_PRIORITIES.DAMAGE);
    ActionBarManager.updateDisplay(player);

    system.runTimeout(() => {
        clearDamageDisplay(playerId);
    }, DAMAGE_DISPLAY_CONFIG.displayDuration);
}

function buildDisplayText(totalDamage, texts, hitCount = 1, aoeDamage = 0, aoeTargetCount = 0, aoeSourceName = "", aoeSourceNameEn = "", locale = "zh_CN") {
    const color = DAMAGE_DISPLAY_CONFIG.textColor;

    let mainLine = "";

    if (hitCount > 1) {
        mainLine = `${color}${texts.damage}: ${totalDamage.toFixed(1)} (x${hitCount})`;
    } else {
        mainLine = `${color}${texts.damage}: ${totalDamage.toFixed(1)}`;
    }

    if (aoeDamage > 0 && aoeTargetCount > 0) {
        const sourceName = locale === "zh_CN" ? aoeSourceName : aoeSourceNameEn;
        const aoeText = locale === "zh_CN"
            ? `§dAOE: ${aoeDamage.toFixed(1)} (${aoeTargetCount}目标) - ${sourceName}`
            : `§dAOE: ${aoeDamage.toFixed(1)} (${aoeTargetCount} targets) - ${sourceName}`;
        ActionBarManager.setLine('global', 'aoe', aoeText, DISPLAY_PRIORITIES.AOE);
        return mainLine;
    }

    return mainLine;
}

function clearDamageDisplay(playerId) {
    const displayState = playerDisplayState.get(playerId);
    if (displayState) {
        const elapsed = system.currentTick - displayState.displayTick;
        if (elapsed >= DAMAGE_DISPLAY_CONFIG.displayDuration) {
            playerDisplayState.delete(playerId);
            ActionBarManager.removeLine(playerId, 'damage');
            ActionBarManager.removeLine(playerId, 'aoe');
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
