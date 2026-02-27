// loreManager.js
// ===============================
// Lore核心管理器
// 统一处理物品Lore的添加、检测、本地化等功能
// ===============================

import { world, system } from "@minecraft/server";
import { LoreRegistry } from "./loreRegistry.js";

const LANGUAGE_OBJECTIVE = "minesia_language";
const DEFAULT_LOCALE = "zh_CN";

const MINESIA_LORE_MARKERS = [
    "攻击伤害", "Attack Damage",
    "附加伤害", "Bonus Damage",
    "随机伤害", "Random Damage",
    "它真的能用来战斗吗？", "Can it really be used for battle?",
    "这把剑看起来像是个玩具", "This sword looks like a toy",
    "攻击时50%概率使目标减速1秒", "50% chance to slow target for 1 second on attack",
    "攻击时25%概率使目标减速5秒", "25% chance to slow target for 5 seconds on attack",
    "攻击时对周围5格内同类实体造成1~5点伤害", "Deals 1~5 damage to same-type entities within 5 blocks on attack",
    "登峰造极", "Reaching the peak",
    "钢铁套装", "Steel Set",
    "黄金幻翼膜", "Golden Phantom Membrane",
    "装备全套时:", "When full set equipped:",
    "副手装备时:", "When equipped in offhand:",
    "+4 生命值", "+4 Health",
    "缓降 I", "Slow Falling I",
    "+20 最大体力值", "+20 Max Stamina",
    "每秒消耗1点耐久", "Consumes 1 durability per second",
    "很寻常的普通货币", "A very common currency",
    "比较少见的普通货币", "A somewhat uncommon currency",
    "较为珍贵的货币", "A fairly precious currency",
    "非常宝贵的珍贵货币", "A very precious currency",
    "非法货币", "Illegal currency",
    "体力消耗", "Stamina Cost",
    "攻击时使目标着火", "Sets target on fire",
    "攻击使目标着火2秒", "Sets target on fire for 2 seconds on attack",
    "攻击时使目标中毒", "Poisons target",
    "每次攻击恢复2点体力值", "Recovers 2 stamina on each attack",
    "最大生命值增加", "Increases max health",
    "每5刻恢复1点体力值", "Recovers 1 stamina every 5 ticks",
    "攻击时传送目标", "Teleports target on attack",
    "攻击使目标传送至高处", "Teleports target 4 blocks up on attack",
    "攻击时25%概率使目标寒冷10秒", "25% chance to chill target for 10 seconds on attack",
    "这把剑让人心寒", "This sword makes one's heart go cold",
    "攻击时25%概率使目标缓慢III持续5秒", "25% chance to slow target III for 5 seconds on attack",
    "触发时额外消耗5点体力值", "Consumes 5 extra stamina when triggered",
    "主世界的先驱曾用它开辟新的大陆", "The pioneers of the Overworld once used it to open new continents",
    "攻击时25%概率使目标虚弱5秒", "25% chance to weaken target for 5 seconds on attack",
    "这把剑如其名", "This sword is just as its name suggests",
    "增加25%最大生命值和80%体力值", "Increases max health by 25% and stamina by 80%",
    "每半秒恢复1点体力值", "Recovers 1 stamina every half second",
    "生命值低于4点时消耗物品获得增益", "Consumes item when health below 4 to grant buffs",
    "看起来非常靠谱，似乎可以在战斗中庇护我", "It looks reliable, seems like it can protect me in battle",
    "攻击时25%概率使目标凋谢2秒", "25% chance to wither target for 2 seconds on attack",
    "这把匕首看起来很危险", "This dagger looks dangerous",
    "攻击时额外随机消耗0到2点耐久度", "Randomly consumes 0-2 durability on each attack",
    "就是有点容易坏，不知道出自哪位高人之手", "It's a bit fragile, wonder who made it"
];

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

function isMinesiaLore(line) {
    if (line === "" || line === "§r" || line === "§r§9" || line === "§r§7") {
        return true;
    }
    for (const marker of MINESIA_LORE_MARKERS) {
        if (line.includes(marker)) {
            return true;
        }
    }
    return false;
}

function removeMinesiaLore(lore) {
    if (!lore || lore.length === 0) return [];
    return lore.filter(line => !isMinesiaLore(line));
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
        const locale = context.locale ?? DEFAULT_LOCALE;

        const hasMinesiaLoreInItem = currentLore.some(line => isMinesiaLore(line));

        if (hasMinesiaLoreInItem) {
            const otherLore = removeMinesiaLore(currentLore);
            currentLore = otherLore;
        }

        let modified = false;

        for (const handler of handlers) {
            try {
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

        if (modified || hasMinesiaLoreInItem) {
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
