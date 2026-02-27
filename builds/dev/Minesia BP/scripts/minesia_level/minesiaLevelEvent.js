// minesiaLevelEvent.js
// ===============================
// 创世等级事件系统
// 处理玩家升级时或处于特定等级时的事件
// ===============================

import { world, system, ItemStack } from "@minecraft/server";
import { MinesiaLevelSystem } from "./level_system.js";
import { ActionBarManager, DISPLAY_PRIORITIES } from "../action_bar/index.js";
import { LoreManager } from "../lore_system/loreManager.js";

const levelUpDisplayActive = new Map();
const LANGUAGE_OBJECTIVE = "minesia_language";

const LEVEL_TEXTS = {
    zh_CN: {
        healthBonus: "生命值",
        levels: {
            1: "恭喜升级到1级！获得50个木币！",
            2: "恭喜升级到2级！获得60个木币！",
            3: "恭喜升级到3级！获得80个木币和10个石币！",
            4: "恭喜升级到4级！获得100个木币和20个石币！",
            5: "恭喜升级到5级！获得30个石币！",
            6: "恭喜升级到6级！获得40个石币和5个银币！",
            7: "恭喜升级到7级！获得50个石币和10个银币！",
            8: "恭喜升级到8级！获得20个银币！",
            9: "恭喜升级到9级！获得25个银币！",
            10: "恭喜升级到10级！获得30个银币、5个金币！",
            11: "恭喜升级到11级！获得35个银币和8个金币！",
            12: "恭喜升级到12级！获得40个银币和10个金币！",
            13: "恭喜升级到13级！获得15个金币！",
            14: "恭喜升级到14级！获得20个金币！",
            15: "恭喜升级到15级！获得25个金币、3个钻石币！",
            16: "恭喜升级到16级！获得30个金币和5个钻石币！",
            17: "恭喜升级到17级！获得35个金币和6个钻石币！",
            18: "恭喜升级到18级！获得8个钻石币！",
            19: "恭喜升级到19级！获得10个钻石币！",
            20: "恭喜升级到20级！获得12个钻石币、1个绿宝石币！",
            21: "恭喜升级到21级！获得15个钻石币和2个绿宝石币！",
            22: "恭喜升级到22级！获得18个钻石币和2个绿宝石币！",
            23: "恭喜升级到23级！获得20个钻石币和3个绿宝石币！",
            24: "恭喜升级到24级！获得22个钻石币和3个绿宝石币！",
            25: "恭喜升级到25级！获得25个钻石币、5个绿宝石币！",
            26: "恭喜升级到26级！获得28个钻石币和6个绿宝石币！",
            27: "恭喜升级到27级！获得30个钻石币和7个绿宝石币！",
            28: "恭喜升级到28级！获得32个钻石币和8个绿宝石币！",
            29: "恭喜升级到29级！获得35个钻石币和9个绿宝石币！",
            30: "恭喜升级到30级！获得40个钻石币、12个绿宝石币！",
            31: "恭喜升级到31级！获得42个钻石币和14个绿宝石币！",
            32: "恭喜升级到32级！获得45个钻石币和16个绿宝石币！",
            33: "恭喜升级到33级！获得20个绿宝石币！",
            34: "恭喜升级到34级！获得22个绿宝石币！",
            35: "恭喜升级到35级！获得25个绿宝石币！",
            36: "恭喜升级到36级！获得28个绿宝石币！",
            37: "恭喜升级到37级！获得30个绿宝石币！",
            38: "恭喜升级到38级！获得32个绿宝石币！",
            39: "恭喜升级到39级！获得35个绿宝石币！",
            40: "恭喜升级到40级！获得40个绿宝石币！",
            41: "恭喜升级到41级！获得45个绿宝石币！",
            42: "恭喜升级到42级！获得50个绿宝石币！",
            43: "恭喜升级到43级！获得55个绿宝石币！",
            44: "恭喜升级到44级！获得60个绿宝石币！",
            45: "恭喜升级到45级！获得70个绿宝石币！",
            46: "恭喜升级到46级！获得80个绿宝石币！",
            47: "恭喜升级到47级！获得90个绿宝石币！",
            48: "恭喜升级到48级！获得100个绿宝石币！",
            49: "恭喜升级到49级！获得120个绿宝石币！",
            50: "恭喜达到最高等级50级！获得150个绿宝石币和缇娜！"
        }
    },
    en_US: {
        healthBonus: "Health",
        levels: {
            1: "Level up to 1! Got 50 Wooden Coins!",
            2: "Level up to 2! Got 60 Wooden Coins!",
            3: "Level up to 3! Got 80 Wooden Coins and 10 Stone Coins!",
            4: "Level up to 4! Got 100 Wooden Coins and 20 Stone Coins!",
            5: "Level up to 5! Got 30 Stone Coins!",
            6: "Level up to 6! Got 40 Stone Coins and 5 Silver Coins!",
            7: "Level up to 7! Got 50 Stone Coins and 10 Silver Coins!",
            8: "Level up to 8! Got 20 Silver Coins!",
            9: "Level up to 9! Got 25 Silver Coins!",
            10: "Level up to 10! Got 30 Silver Coins and 5 Gold Coins!",
            11: "Level up to 11! Got 35 Silver Coins and 8 Gold Coins!",
            12: "Level up to 12! Got 40 Silver Coins and 10 Gold Coins!",
            13: "Level up to 13! Got 15 Gold Coins!",
            14: "Level up to 14! Got 20 Gold Coins!",
            15: "Level up to 15! Got 25 Gold Coins and 3 Diamond Coins!",
            16: "Level up to 16! Got 30 Gold Coins and 5 Diamond Coins!",
            17: "Level up to 17! Got 35 Gold Coins and 6 Diamond Coins!",
            18: "Level up to 18! Got 8 Diamond Coins!",
            19: "Level up to 19! Got 10 Diamond Coins!",
            20: "Level up to 20! Got 12 Diamond Coins and 1 Emerald Coin!",
            21: "Level up to 21! Got 15 Diamond Coins and 2 Emerald Coins!",
            22: "Level up to 22! Got 18 Diamond Coins and 2 Emerald Coins!",
            23: "Level up to 23! Got 20 Diamond Coins and 3 Emerald Coins!",
            24: "Level up to 24! Got 22 Diamond Coins and 3 Emerald Coins!",
            25: "Level up to 25! Got 25 Diamond Coins and 5 Emerald Coins!",
            26: "Level up to 26! Got 28 Diamond Coins and 6 Emerald Coins!",
            27: "Level up to 27! Got 30 Diamond Coins and 7 Emerald Coins!",
            28: "Level up to 28! Got 32 Diamond Coins and 8 Emerald Coins!",
            29: "Level up to 29! Got 35 Diamond Coins and 9 Emerald Coins!",
            30: "Level up to 30! Got 40 Diamond Coins and 12 Emerald Coins!",
            31: "Level up to 31! Got 42 Diamond Coins and 14 Emerald Coins!",
            32: "Level up to 32! Got 45 Diamond Coins and 16 Emerald Coins!",
            33: "Level up to 33! Got 20 Emerald Coins!",
            34: "Level up to 34! Got 22 Emerald Coins!",
            35: "Level up to 35! Got 25 Emerald Coins!",
            36: "Level up to 36! Got 28 Emerald Coins!",
            37: "Level up to 37! Got 30 Emerald Coins!",
            38: "Level up to 38! Got 32 Emerald Coins!",
            39: "Level up to 39! Got 35 Emerald Coins!",
            40: "Level up to 40! Got 40 Emerald Coins!",
            41: "Level up to 41! Got 45 Emerald Coins!",
            42: "Level up to 42! Got 50 Emerald Coins!",
            43: "Level up to 43! Got 55 Emerald Coins!",
            44: "Level up to 44! Got 60 Emerald Coins!",
            45: "Level up to 45! Got 70 Emerald Coins!",
            46: "Level up to 46! Got 80 Emerald Coins!",
            47: "Level up to 47! Got 90 Emerald Coins!",
            48: "Level up to 48! Got 100 Emerald Coins!",
            49: "Level up to 49! Got 120 Emerald Coins!",
            50: "Max level 50! Got 150 Emerald Coins and Tina!"
        }
    }
};

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective(LANGUAGE_OBJECTIVE);
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 0) return "en_US";
        }
    } catch (e) { }
    return "zh_CN";
}

function getLevelMessage(player, level) {
    const locale = getPlayerLocale(player);
    const texts = LEVEL_TEXTS[locale] || LEVEL_TEXTS.zh_CN;
    return texts.levels[level] || `Level ${level}`;
}

export function isLevelUpDisplayActive(playerId) {
    return levelUpDisplayActive.has(playerId);
}

export class MinesiaLevelEventSystem {
    static rewardsObtainedObjectivePrefix = "minesia_reward_";

    static LEVEL_HEALTH_REWARDS = {
        1: 4, 5: 4, 10: 4, 15: 4, 20: 4,
        25: 4, 30: 4, 35: 4, 40: 4, 45: 4
    };

    static calculateLevelHealthBonus(level) {
        let totalBonus = 0;
        for (const [rewardLevel, bonus] of Object.entries(this.LEVEL_HEALTH_REWARDS)) {
            if (level >= parseInt(rewardLevel)) {
                totalBonus += bonus;
            }
        }
        return totalBonus;
    }

    static LEVEL_REWARDS = {
        1: { woodCoin: 50 },
        2: { woodCoin: 60 },
        3: { woodCoin: 80, stoneCoin: 10 },
        4: { woodCoin: 100, stoneCoin: 20 },
        5: { stoneCoin: 30, toySword: 1 },
        6: { stoneCoin: 40, silverCoin: 5 },
        7: { stoneCoin: 50, silverCoin: 10 },
        8: { silverCoin: 20 },
        9: { silverCoin: 25 },
        10: { silverCoin: 30, goldCoin: 5 },
        11: { silverCoin: 35, goldCoin: 8 },
        12: { silverCoin: 40, goldCoin: 10 },
        13: { goldCoin: 15 },
        14: { goldCoin: 20 },
        15: { goldCoin: 25, diamondCoin: 3 },
        16: { goldCoin: 30, diamondCoin: 5 },
        17: { goldCoin: 35, diamondCoin: 6 },
        18: { diamondCoin: 8 },
        19: { diamondCoin: 10 },
        20: { diamondCoin: 12, emeraldCoin: 1 },
        21: { diamondCoin: 15, emeraldCoin: 2 },
        22: { diamondCoin: 18, emeraldCoin: 2 },
        23: { diamondCoin: 20, emeraldCoin: 3 },
        24: { diamondCoin: 22, emeraldCoin: 3 },
        25: { diamondCoin: 25, emeraldCoin: 5 },
        26: { diamondCoin: 28, emeraldCoin: 6 },
        27: { diamondCoin: 30, emeraldCoin: 7 },
        28: { diamondCoin: 32, emeraldCoin: 8 },
        29: { diamondCoin: 35, emeraldCoin: 9 },
        30: { diamondCoin: 40, emeraldCoin: 12 },
        31: { diamondCoin: 42, emeraldCoin: 14 },
        32: { diamondCoin: 45, emeraldCoin: 16 },
        33: { emeraldCoin: 20 },
        34: { emeraldCoin: 22 },
        35: { emeraldCoin: 25 },
        36: { emeraldCoin: 28 },
        37: { emeraldCoin: 30 },
        38: { emeraldCoin: 32 },
        39: { emeraldCoin: 35 },
        40: { emeraldCoin: 40 },
        41: { emeraldCoin: 45 },
        42: { emeraldCoin: 50 },
        43: { emeraldCoin: 55 },
        44: { emeraldCoin: 60 },
        45: { emeraldCoin: 70 },
        46: { emeraldCoin: 80 },
        47: { emeraldCoin: 90 },
        48: { emeraldCoin: 100 },
        49: { emeraldCoin: 120 },
        50: { emeraldCoin: 150, tina: 1 }
    };

    static getRewardObjectiveName(level) {
        return `${this.rewardsObtainedObjectivePrefix}${level}`;
    }

    static initializeRewardsScoreboard() {
        try {
            const scoreboard = world.scoreboard;
            if (!scoreboard) return false;

            for (let level = 1; level <= 50; level++) {
                const objectiveName = this.getRewardObjectiveName(level);
                if (!scoreboard.getObjective(objectiveName)) {
                    scoreboard.addObjective(objectiveName, `Minesia Reward Lv${level}`);
                }
            }
            return true;
        } catch (e) {
            console.error('[MinesiaEvent] 初始化计分板失败:', e?.message);
            return false;
        }
    }

    static hasObtainedReward(player, level) {
        try {
            const objectiveName = this.getRewardObjectiveName(level);
            const rewardsObj = world.scoreboard?.getObjective(objectiveName);
            return rewardsObj?.getScore(player) === 1;
        } catch (e) {
            return false;
        }
    }

    static markRewardObtained(player, level) {
        try {
            const objectiveName = this.getRewardObjectiveName(level);
            const rewardsObj = world.scoreboard?.getObjective(objectiveName);
            rewardsObj?.setScore(player, 1);
        } catch (e) { }
    }

    static showLocalizedMessage(player, level, duration = 10000) {
        const playerId = player.id;
        const message = getLevelMessage(player, level);

        levelUpDisplayActive.set(playerId, true);
        MinesiaLevelSystem.pauseLevelDisplay(player, duration);

        ActionBarManager.setLine(playerId, 'levelup', `§a${message}`, DISPLAY_PRIORITIES.LEVEL);
        ActionBarManager.updateDisplay(player);

        system.runTimeout(() => {
            levelUpDisplayActive.delete(playerId);
            ActionBarManager.removeLine(playerId, 'levelup');
        }, Math.floor(duration / 50));
    }

    static playLevelUpSound(player) {
        try {
            player.runCommand('playsound minesia.level_up @s');
        } catch (e) {
            try { player.runCommand('playsound random.anvil_use @s'); } catch (e2) { }
        }
    }

    static handleLevelUp(player, oldLevel, newLevel) {
        if (newLevel <= oldLevel) return;
        this.playLevelUpSound(player);
        for (let level = oldLevel + 1; level <= newLevel; level++) {
            this.handleSpecificLevelReward(player, level);
        }
    }

    static handleSpecificLevelReward(player, level) {
        if (this.hasObtainedReward(player, level)) return;

        const reward = this.LEVEL_REWARDS[level];
        if (!reward) return;

        if (reward.woodCoin) this.giveItem(player, "minesia:wooden_coin", reward.woodCoin);
        if (reward.stoneCoin) this.giveItem(player, "minesia:stone_coin", reward.stoneCoin);
        if (reward.silverCoin) this.giveItem(player, "minesia:silver_coin", reward.silverCoin);
        if (reward.goldCoin) this.giveItem(player, "minesia:gold_coin", reward.goldCoin);
        if (reward.diamondCoin) this.giveItem(player, "minesia:diamond_coin", reward.diamondCoin);
        if (reward.emeraldCoin) this.giveItem(player, "minesia:emerald_coin", reward.emeraldCoin);
        if (reward.toySword) this.giveItem(player, "minesia:toy_sword", reward.toySword);
        if (reward.tina) this.giveItem(player, "minesia:tina", reward.tina);

        const hasHealthReward = this.LEVEL_HEALTH_REWARDS[level];
        if (hasHealthReward) {
            this.showCombinedMessage(player, level, hasHealthReward);
        } else {
            this.showLocalizedMessage(player, level, 10000);
        }

        this.markRewardObtained(player, level);
    }

    static showCombinedMessage(player, level, healthBonus) {
        const playerId = player.id;
        const message = getLevelMessage(player, level);
        const locale = getPlayerLocale(player);
        const texts = LEVEL_TEXTS[locale] || LEVEL_TEXTS.zh_CN;

        levelUpDisplayActive.set(playerId, true);
        MinesiaLevelSystem.pauseLevelDisplay(player, 10000);

        const displayText = `§a${message}\n§a+${healthBonus} ${texts.healthBonus}`;
        ActionBarManager.setLine(playerId, 'levelup', displayText, DISPLAY_PRIORITIES.LEVEL);
        ActionBarManager.updateDisplay(player);

        system.runTimeout(() => {
            levelUpDisplayActive.delete(playerId);
            ActionBarManager.removeLine(playerId, 'levelup');
        }, 200);
    }

    static giveItem(player, itemId, count) {
        try {
            const itemStack = new ItemStack(itemId, count);
            const processedItem = LoreManager.processItem(itemStack, { player });
            
            const inventory = player.getComponent('minecraft:inventory');
            if (!inventory) {
                player.runCommand(`give @s ${itemId} ${count}`);
                return;
            }
            
            const container = inventory.container;
            if (!container) {
                player.runCommand(`give @s ${itemId} ${count}`);
                return;
            }
            
            container.addItem(processedItem);
        } catch (e) {
            console.error('[MinesiaLevelEvent] giveItem失败:', e?.message ?? e);
            try {
                player.runCommand(`give @s ${itemId} ${count}`);
            } catch (e2) { }
        }
    }
}
