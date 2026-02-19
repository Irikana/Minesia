// loreHandler.js
// ===============================
// 附加伤害系统 - Lore处理
// 当玩家获取具有附加伤害的武器时，自动添加Lore描述
// ===============================

import { world, system } from "@minecraft/server";
import { getWeaponConfig, formatDamageRange, getLoreText, LOCALE_SETTINGS } from "./config.js";

const LORE_COLOR = "§r§9";
const LANGUAGE_OBJECTIVE = "minesia_language";
const DEFAULT_LOCALE = "zh_CN";

const BONUS_DAMAGE_MARKERS = ["附加伤害", "Bonus Damage"];

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

function isBonusDamageLore(line) {
    for (const marker of BONUS_DAMAGE_MARKERS) {
        if (line.includes(marker)) {
            return true;
        }
    }
    return false;
}

function removeBonusDamageLore(lore) {
    if (!lore || lore.length === 0) return [];
    return lore.filter(line => !isBonusDamageLore(line));
}

const processedItems = new WeakSet();

export function initializeLoreHandler() {
    world.afterEvents.playerSpawn.subscribe(handlePlayerSpawn);

    world.afterEvents.itemCompleteUse.subscribe(handleItemUse);

    system.runInterval(checkAllPlayerInventories, 100);

    console.log('[BonusDamage] Lore处理器初始化完成');
}

function handlePlayerSpawn(event) {
    const { player } = event;
    if (!player) return;

    system.runTimeout(() => {
        checkPlayerInventory(player);
    }, 20);
}

function handleItemUse(event) {
    const { source, itemStack } = event;
    if (!source || source.typeId !== "minecraft:player") return;

    const config = getWeaponConfig(itemStack.typeId);
    if (!config) return;
}

function checkAllPlayerInventories() {
    try {
        const players = world.getPlayers();
        for (const player of players) {
            checkPlayerInventory(player);
        }
    } catch (error) {
        console.error('[BonusDamage] 检查玩家物品栏时出错:', error?.message ?? error);
    }
}

export function checkPlayerInventory(player) {
    try {
        const inventory = player.getComponent('minecraft:inventory');
        if (!inventory) return;

        const container = inventory.container;
        if (!container) return;

        const locale = getPlayerLocale(player);

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            const config = getWeaponConfig(item.typeId);
            if (!config) continue;

            const currentLore = item.getLore() || [];
            const hasBonusDamageLoreInItem = currentLore.some(line => isBonusDamageLore(line));

            if (hasBonusDamageLoreInItem) {
                const otherLore = removeBonusDamageLore(currentLore);
                const newItem = addBonusDamageLore(item, config, locale, otherLore);
                if (newItem) {
                    container.setItem(i, newItem);
                }
            } else {
                const newItem = addBonusDamageLore(item, config, locale, currentLore);
                if (newItem) {
                    container.setItem(i, newItem);
                }
            }
        }
    } catch (error) {
        console.error('[BonusDamage] 检查玩家物品栏时出错:', error?.message ?? error);
    }
}

function addBonusDamageLore(itemStack, config, locale = DEFAULT_LOCALE, existingLore = null) {
    try {
        const damageRange = formatDamageRange(config.minDamage, config.maxDamage);
        const loreText = getLoreText(locale);
        const loreLine = `${LORE_COLOR}+${damageRange} ${loreText.bonusDamage}`;

        const currentLore = existingLore || itemStack.getLore() || [];
        const newLore = [...currentLore, loreLine];

        const newItem = itemStack.clone();
        newItem.setLore(newLore);

        return newItem;
    } catch (error) {
        console.error('[BonusDamage] 添加Lore时出错:', error?.message ?? error);
        return null;
    }
}

export function updateItemLore(itemStack) {
    const config = getWeaponConfig(itemStack.typeId);
    if (!config) return itemStack;

    const currentLore = itemStack.getLore();
    if (currentLore && currentLore.some(line => isBonusDamageLore(line))) return itemStack;

    return addBonusDamageLore(itemStack, config) || itemStack;
}
