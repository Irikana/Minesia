// loreHandler.js
// ===============================
// 附加伤害系统 - Lore处理
// 当玩家获取具有附加伤害的武器时，自动添加Lore描述
// ===============================

import { world, system } from "@minecraft/server";
import { getWeaponConfig, formatDamageRange, getLoreText, LOCALE_SETTINGS } from "./config.js";

const LORE_COLOR = "§r§9";
const LANGUAGE_OBJECTIVE = "minesia_language";

const processedItems = new WeakSet();

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective(LANGUAGE_OBJECTIVE);
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 1) return "en_US";
        }
    } catch (e) { }
    return LOCALE_SETTINGS.defaultLocale;
}

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

            const currentLore = item.getLore();
            if (!hasBonusDamageLore(currentLore)) {
                const newItem = addBonusDamageLore(item, config, locale);
                if (newItem) {
                    container.setItem(i, newItem);
                }
            }
        }
    } catch (error) {
        console.error('[BonusDamage] 检查玩家物品栏时出错:', error?.message ?? error);
    }
}

function hasBonusDamageLore(lore) {
    if (!lore || lore.length === 0) return false;

    for (const line of lore) {
        if (line.includes("附加伤害") || line.includes("Bonus Damage")) {
            return true;
        }
    }
    return false;
}

function addBonusDamageLore(itemStack, config, locale = LOCALE_SETTINGS.defaultLocale) {
    try {
        const damageRange = formatDamageRange(config.minDamage, config.maxDamage);
        const loreText = getLoreText(locale);
        const loreLine = `${LORE_COLOR}+${damageRange} ${loreText.bonusDamage}`;

        const currentLore = itemStack.getLore() || [];
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
    if (hasBonusDamageLore(currentLore)) return itemStack;

    return addBonusDamageLore(itemStack, config) || itemStack;
}
