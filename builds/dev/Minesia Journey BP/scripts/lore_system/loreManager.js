// loreManager.js
// ===============================
// Lore核心管理器
// 统一处理物品Lore的添加、检测、本地化等功能
// ===============================

import { world, system } from "@minecraft/server";
import { LoreRegistry } from "./loreRegistry.js";

const LANGUAGE_OBJECTIVE = "minesia_language";
const DEFAULT_LOCALE = "zh_CN";

const localeCache = new Map();

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective(LANGUAGE_OBJECTIVE);
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 1) return "en_US";
        }
    } catch (e) { }
    return DEFAULT_LOCALE;
}

function createLoreLine(text, color = "§9") {
    return `${color}${text}`;
}

function appendLoreLines(existingLore, newLines) {
    const currentLore = existingLore || [];
    const linesToAdd = Array.isArray(newLines) ? newLines : [newLines];
    return [...currentLore, ...linesToAdd];
}

function setItemLore(itemStack, lore) {
    try {
        const newItem = itemStack.clone();
        newItem.setLore(lore);
        return newItem;
    } catch (error) {
        console.error('[LoreManager] 设置Lore失败:', error?.message ?? error);
        return null;
    }
}

export const LoreManager = {
    processItem(itemStack, context = {}) {
        if (!itemStack) return itemStack;

        const handlers = LoreRegistry.getHandlersForItem(itemStack, context);
        if (handlers.length === 0) return itemStack;

        let currentLore = itemStack.getLore() || [];
        let modified = false;
        const locale = context.locale ?? DEFAULT_LOCALE;

        for (const handler of handlers) {
            try {
                if (handler.hasLore) {
                    if (handler.hasLore(currentLore, itemStack, context)) {
                        continue;
                    }
                }

                const newLines = handler.generateLore(itemStack, { ...context, locale, currentLore });
                if (newLines) {
                    const linesToAdd = Array.isArray(newLines) ? newLines : [newLines];
                    currentLore = [...currentLore, ...linesToAdd];
                    modified = true;
                }
            } catch (error) {
                console.error(`[LoreManager] 处理器 ${handler.id} 生成Lore出错:`, error?.message ?? error);
            }
        }

        if (modified) {
            return setItemLore(itemStack, currentLore);
        }

        return itemStack;
    },

    processContainer(container, context = {}) {
        if (!container) return;

        const locale = context.locale ?? DEFAULT_LOCALE;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            const processedItem = this.processItem(item, { ...context, locale });
            if (processedItem !== item) {
                container.setItem(i, processedItem);
            }
        }
    },

    processPlayerInventory(player) {
        try {
            const inventory = player.getComponent('minecraft:inventory');
            if (!inventory) return;

            const container = inventory.container;
            if (!container) return;

            const locale = getPlayerLocale(player);
            this.processContainer(container, { player, locale });
        } catch (error) {
            console.error('[LoreManager] 处理玩家背包出错:', error?.message ?? error);
        }
    },

    processDroppedItem(entity) {
        try {
            if (entity.typeId !== "minecraft:item") return null;

            const itemComponent = entity.getComponent('minecraft:item');
            if (!itemComponent?.itemStack) return null;

            const processedItem = this.processItem(itemComponent.itemStack, { isDropped: true });
            if (processedItem !== itemComponent.itemStack) {
                const location = entity.location;
                const dimension = entity.dimension;

                entity.remove();

                dimension.spawnItem(processedItem, location);
                return processedItem;
            }
        } catch (error) {
            console.error('[LoreManager] 处理掉落物出错:', error?.message ?? error);
        }
        return null;
    },

    getLocale: getPlayerLocale,

    createLoreLine,

    appendLoreLines,

    setItemLore
};

export function initializeLoreSystem(options = {}) {
    const checkInterval = options.checkInterval ?? 100;

    world.afterEvents.playerSpawn.subscribe((event) => {
        const { player } = event;
        if (!player) return;

        system.runTimeout(() => {
            LoreManager.processPlayerInventory(player);
        }, 20);
    });

    system.runInterval(() => {
        try {
            const players = world.getPlayers();
            for (const player of players) {
                LoreManager.processPlayerInventory(player);
            }
        } catch (error) {
            console.error('[LoreSystem] 定期检查出错:', error?.message ?? error);
        }
    }, checkInterval);

    console.log('[LoreSystem] Lore系统初始化完成');
}

export { LoreRegistry };
