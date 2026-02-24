// minesiaLevelEvent.js
// ===============================
// 创世等级事件系统
// 处理玩家升级时或处于特定等级时的事件
// 难度: 非常简单(奖励增加50%)
// ===============================

import { world, system } from "@minecraft/server";
import { MinesiaLevelSystem } from "./level_system.js";

/**
 * 创世等级事件系统
 * 处理玩家升级时的奖励和特殊事件
 */
export class MinesiaLevelEventSystem {
    static rewardsObtainedObjectivePrefix = "minesia_reward_";

    static LEVEL_HEALTH_REWARDS = {
        1: 4, 5: 4, 10: 4, 15: 4, 20: 4,
        25: 4, 30: 4, 35: 4, 40: 4, 45: 4
    };

    static calculateLevelHealthBonus(level) {
        let totalBonus = 0;
        for (const [rewardLevel, bonus] of Object.entries(this.LEVEL_HEALTH_REWARDS)) {
            if (level >= parseInt(rewardLevel)) { totalBonus += bonus; }
        }
        return totalBonus;
    }

    static getLevelHealthMilestones(level) {
        const milestones = [];
        for (const rewardLevel of Object.keys(this.LEVEL_HEALTH_REWARDS).map(Number).sort((a, b) => a - b)) {
            if (level >= rewardLevel) { milestones.push(rewardLevel); }
        }
        return milestones;
    }

    static LEVEL_REWARDS = {
        1: { woodCoin: 75, message: "minesia.level.event.level1" },
        2: { woodCoin: 90, message: "minesia.level.event.level2" },
        3: { woodCoin: 120, stoneCoin: 15, message: "minesia.level.event.level3" },
        4: { woodCoin: 150, stoneCoin: 30, message: "minesia.level.event.level4" },
        5: { stoneCoin: 45, toySword: 1, message: "minesia.level.event.level5" },
        6: { stoneCoin: 60, silverCoin: 8, message: "minesia.level.event.level6" },
        7: { stoneCoin: 75, silverCoin: 15, message: "minesia.level.event.level7" },
        8: { silverCoin: 30, message: "minesia.level.event.level8" },
        9: { silverCoin: 38, message: "minesia.level.event.level9" },
        10: { silverCoin: 45, goldCoin: 8, message: "minesia.level.event.level10" },
        11: { silverCoin: 53, goldCoin: 12, message: "minesia.level.event.level11" },
        12: { silverCoin: 60, goldCoin: 15, message: "minesia.level.event.level12" },
        13: { goldCoin: 23, message: "minesia.level.event.level13" },
        14: { goldCoin: 30, message: "minesia.level.event.level14" },
        15: { goldCoin: 38, diamondCoin: 5, message: "minesia.level.event.level15" },
        16: { goldCoin: 45, diamondCoin: 8, message: "minesia.level.event.level16" },
        17: { goldCoin: 53, diamondCoin: 9, message: "minesia.level.event.level17" },
        18: { diamondCoin: 12, message: "minesia.level.event.level18" },
        19: { diamondCoin: 15, message: "minesia.level.event.level19" },
        20: { diamondCoin: 18, emeraldCoin: 2, message: "minesia.level.event.level20" },
        21: { diamondCoin: 23, emeraldCoin: 3, message: "minesia.level.event.level21" },
        22: { diamondCoin: 27, emeraldCoin: 3, message: "minesia.level.event.level22" },
        23: { diamondCoin: 30, emeraldCoin: 5, message: "minesia.level.event.level23" },
        24: { diamondCoin: 33, emeraldCoin: 5, message: "minesia.level.event.level24" },
        25: { diamondCoin: 38, emeraldCoin: 8, message: "minesia.level.event.level25" },
        26: { diamondCoin: 42, emeraldCoin: 9, message: "minesia.level.event.level26" },
        27: { diamondCoin: 45, emeraldCoin: 11, message: "minesia.level.event.level27" },
        28: { diamondCoin: 48, emeraldCoin: 12, message: "minesia.level.event.level28" },
        29: { diamondCoin: 53, emeraldCoin: 14, message: "minesia.level.event.level29" },
        30: { diamondCoin: 60, emeraldCoin: 18, message: "minesia.level.event.level30" },
        31: { diamondCoin: 63, emeraldCoin: 21, message: "minesia.level.event.level31" },
        32: { diamondCoin: 68, emeraldCoin: 24, message: "minesia.level.event.level32" },
        33: { emeraldCoin: 30, message: "minesia.level.event.level33" },
        34: { emeraldCoin: 33, message: "minesia.level.event.level34" },
        35: { emeraldCoin: 38, message: "minesia.level.event.level35" },
        36: { emeraldCoin: 42, message: "minesia.level.event.level36" },
        37: { emeraldCoin: 45, message: "minesia.level.event.level37" },
        38: { emeraldCoin: 48, message: "minesia.level.event.level38" },
        39: { emeraldCoin: 53, message: "minesia.level.event.level39" },
        40: { emeraldCoin: 60, message: "minesia.level.event.level40" },
        41: { emeraldCoin: 68, message: "minesia.level.event.level41" },
        42: { emeraldCoin: 75, message: "minesia.level.event.level42" },
        43: { emeraldCoin: 83, message: "minesia.level.event.level43" },
        44: { emeraldCoin: 90, message: "minesia.level.event.level44" },
        45: { emeraldCoin: 105, message: "minesia.level.event.level45" },
        46: { emeraldCoin: 120, message: "minesia.level.event.level46" },
        47: { emeraldCoin: 135, message: "minesia.level.event.level47" },
        48: { emeraldCoin: 150, message: "minesia.level.event.level48" },
        49: { emeraldCoin: 180, message: "minesia.level.event.level49" },
        50: { emeraldCoin: 225, message: "minesia.level.event.level50" }
    };

    static getRewardObjectiveName(level) { return `${this.rewardsObtainedObjectivePrefix}${level}`; }

    static initializeRewardsScoreboard() {
        try {
            const scoreboard = world.scoreboard;
            if (!scoreboard) { console.warn('[MinesiaEvent] 当前脚本 API 不支持 world.scoreboard，奖励追踪功能已禁用'); return false; }
            for (let level = 1; level <= 50; level++) {
                const objectiveName = this.getRewardObjectiveName(level);
                let objective = scoreboard.getObjective(objectiveName);
                if (!objective) { objective = scoreboard.addObjective(objectiveName, `Minesia Reward Lv${level}`); }
            }
            console.log('[MinesiaEvent] 奖励追踪计分板初始化成功');
            return true;
        } catch (e) { console.error('[MinesiaEvent] 初始化奖励追踪计分板失败:', e?.message ?? e); return false; }
    }

    static hasObtainedReward(player, level) {
        try {
            const scoreboard = world.scoreboard;
            if (!scoreboard) return false;
            const objectiveName = this.getRewardObjectiveName(level);
            const rewardsObj = scoreboard.getObjective(objectiveName);
            if (!rewardsObj) return false;
            let score = 0;
            try { score = rewardsObj.getScore(player); } catch (e) { return false; }
            return score === 1;
        } catch (error) { console.warn('[MinesiaEvent] 检查奖励是否已获得时出错:', error?.message ?? error); return false; }
    }

    static markRewardObtained(player, level) {
        try {
            const scoreboard = world.scoreboard;
            if (!scoreboard) return;
            const objectiveName = this.getRewardObjectiveName(level);
            const rewardsObj = scoreboard.getObjective(objectiveName);
            if (!rewardsObj) return;
            rewardsObj.setScore(player, 1);
            console.log(`[MinesiaEvent] 标记玩家 ${player.name} 已获得 ${level} 级奖励`);
        } catch (error) { console.warn('[MinesiaEvent] 标记奖励已获得时出错:', error?.message ?? error); }
    }

    static showLocalizedMessage(player, key, duration = 10000) {
        MinesiaLevelSystem.pauseLevelDisplay(player, duration);
        player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a[Minesia] "},{"translate":"${key}"}]}`);
        system.runTimeout(() => { player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a[Minesia] "},{"translate":"${key}"}]}`); }, 20);
        system.runTimeout(() => { player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a[Minesia] "},{"translate":"${key}"}]}`); }, 40);
    }

    static playLevelUpSound(player) {
        try {
            console.log('[Minesia] 尝试播放升级音效...');
            player.runCommand('playsound minesia.level_up @s');
            console.log('[Minesia] 升级音效命令已发送');
        } catch (error) {
            console.warn('[Minesia] 播放升级音效时出错:', error?.message ?? error);
            try { player.runCommand('playsound random.anvil_use @s'); console.log('[Minesia] 使用备份铁砧音效'); } catch (e2) { console.warn('[Minesia] 备份音效也失败:', e2?.message ?? e2); }
        }
    }

    static handleLevelUp(player, oldLevel, newLevel) {
        if (newLevel <= oldLevel) return;
        console.log(`[Minesia] 处理玩家 ${player.name} 从 ${oldLevel} 级升级到 ${newLevel} 级的事件`);
        try { this.playLevelUpSound(player); } catch (e) { console.warn('[Minesia] 播放音效失败:', e); }
        for (let level = oldLevel + 1; level <= newLevel; level++) { this.handleSpecificLevelReward(player, level); }
    }

    static handleSpecificLevelReward(player, level) {
        if (this.hasObtainedReward(player, level)) { console.log(`[Minesia] 玩家 ${player.name} 已获得 ${level} 级奖励，跳过`); return; }
        const reward = this.LEVEL_REWARDS[level];
        if (!reward) { console.log(`[Minesia] 等级 ${level} 没有配置奖励`); return; }
        if (reward.woodCoin) { this.giveItem(player, "minesia:wooden_coin", reward.woodCoin); }
        if (reward.stoneCoin) { this.giveItem(player, "minesia:stone_coin", reward.stoneCoin); }
        if (reward.silverCoin) { this.giveItem(player, "minesia:silver_coin", reward.silverCoin); }
        if (reward.goldCoin) { this.giveItem(player, "minesia:gold_coin", reward.goldCoin); }
        if (reward.diamondCoin) { this.giveItem(player, "minesia:diamond_coin", reward.diamondCoin); }
        if (reward.emeraldCoin) { this.giveItem(player, "minesia:emerald_coin", reward.emeraldCoin); }
        if (reward.toySword) { this.giveItem(player, "minesia:toy_sword", reward.toySword); }
        const hasHealthReward = this.LEVEL_HEALTH_REWARDS[level];
        if (hasHealthReward) { this.showCombinedMessage(player, level, reward.message, hasHealthReward); console.log(`[Minesia] 玩家 ${player.name} 达到 ${level} 级，获得 ${hasHealthReward} 点额外生命值`); }
        else if (reward.message) { this.showLocalizedMessage(player, reward.message, 10000); }
        this.markRewardObtained(player, level);
    }

    static showCombinedMessage(player, level, coinMessageKey, healthBonus) {
        MinesiaLevelSystem.pauseLevelDisplay(player, 10000);
        player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a[Minesia] "},{"translate":"${coinMessageKey}"},{"text":"\\n§a"},{"translate":"minesia.level.health_bonus"}]}`);
        system.runTimeout(() => { player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a[Minesia] "},{"translate":"${coinMessageKey}"},{"text":"\\n§a"},{"translate":"minesia.level.health_bonus"}]}`); }, 20);
        system.runTimeout(() => { player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a[Minesia] "},{"translate":"${coinMessageKey}"},{"text":"\\n§a"},{"translate":"minesia.level.health_bonus"}]}`); }, 40);
    }

    static giveItem(player, itemId, count) { try { player.runCommand(`give @s ${itemId} ${count}`); } catch (error) { console.warn('[Minesia] 给予物品时出错:', error?.message ?? error); } }
}
