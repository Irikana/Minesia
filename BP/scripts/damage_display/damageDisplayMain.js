// damageDisplayMain.js
// ===============================
// 伤害显示系统 - 核心逻辑
// 在玩家攻击时显示伤害信息
// ===============================

import { world, system } from "@minecraft/server";
import { DAMAGE_DISPLAY_CONFIG, getDisplayTexts } from "./config.js";
import { recentBonusDamage, isCurrentlyApplyingBonusDamage } from "../bonus_damage/bonusDamageMain.js";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { getAoeDamageRecord, isAoeEntity } from "../custom_events/item_events/aoeDamageRegistry.js";
import { isLevelUpDisplayActive } from "../minesia_level/minesiaLevelEvent.js";

const playerComboState = new Map();
const playerDisplayState = new Map();
const LANGUAGE_OBJECTIVE = "minesia_language";
const DEFAULT_LOCALE = "zh_CN";
const levelDisplayPausedByDamage = new Map();

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

        if (isCurrentlyApplyingBonusDamage()) {
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
        baseDamage,
        bonusDamage,
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

    if (!levelDisplayPausedByDamage.has(playerId)) {
        levelDisplayPausedByDamage.set(playerId, true);
        MinesiaLevelSystem.playerDisplayPaused.set(playerId, true);
    }

    player.onScreenDisplay.setActionBar(displayText);

    system.runTimeout(() => {
        clearDamageDisplay(playerId);
    }, DAMAGE_DISPLAY_CONFIG.displayDuration);
}

function buildDisplayText(baseDamage, bonusDamage, totalDamage, texts, hitCount = 1, aoeDamage = 0, aoeTargetCount = 0, aoeSourceName = "", aoeSourceNameEn = "", locale = "zh_CN") {
    const color = DAMAGE_DISPLAY_CONFIG.textColor;

    if (DAMAGE_DISPLAY_CONFIG.debugMode) {
        let debugText = `${color}${texts.baseDamage}: ${baseDamage.toFixed(1)} | ${texts.bonusDamage}: ${bonusDamage.toFixed(1)} | ${texts.totalDamage}: ${totalDamage.toFixed(1)}`;
        if (aoeDamage > 0) {
            debugText += `\n§dAOE: ${aoeDamage.toFixed(1)} (${aoeTargetCount} targets)`;
        }
        return debugText;
    }

    let mainLine = "";

    if (DAMAGE_DISPLAY_CONFIG.showTotalDamage) {
        if (hitCount > 1) {
            mainLine = `${color}${texts.damage}: ${totalDamage.toFixed(1)} (x${hitCount})`;
        } else {
            mainLine = `${color}${texts.damage}: ${totalDamage.toFixed(1)}`;
        }
    } else {
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
            mainLine = `${color}${texts.damage}: ${totalDamage.toFixed(1)}`;
        } else {
            mainLine = `${color}${parts.join(' | ')}`;
        }
    }

    if (aoeDamage > 0 && aoeTargetCount > 0) {
        const sourceName = locale === "zh_CN" ? aoeSourceName : aoeSourceNameEn;
        const aoeText = locale === "zh_CN"
            ? `§dAOE: ${aoeDamage.toFixed(1)} (${aoeTargetCount}目标) - ${sourceName}`
            : `§dAOE: ${aoeDamage.toFixed(1)} (${aoeTargetCount} targets) - ${sourceName}`;
        return `${mainLine}\n${aoeText}`;
    }

    return mainLine;
}

function clearDamageDisplay(playerId) {
    const displayState = playerDisplayState.get(playerId);
    if (displayState) {
        const elapsed = system.currentTick - displayState.displayTick;
        if (elapsed >= DAMAGE_DISPLAY_CONFIG.displayDuration) {
            playerDisplayState.delete(playerId);

            if (levelDisplayPausedByDamage.has(playerId)) {
                levelDisplayPausedByDamage.delete(playerId);
                MinesiaLevelSystem.playerDisplayPaused.delete(playerId);

                const players = world.getPlayers();
                for (const player of players) {
                    if (player.id === playerId) {
                        MinesiaLevelSystem.updateLevelDisplay(player);
                        break;
                    }
                }
            }
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
