// Minesia等级系统扩展功能
import { world, system } from "@minecraft/server";
import { ActionBarManager, DISPLAY_PRIORITIES } from "../action_bar/index.js";

const LEVEL_DISPLAY_TEXTS = {
    zh_CN: {
        level: "创世等级",
        max: "满级"
    },
    en_US: {
        level: "Minesia Level",
        max: "MAX"
    }
};

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective("minesia_language");
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 0) return "en_US";
        }
    } catch (_e) { }
    return "zh_CN";
}

function getLevelDisplayTexts(locale = "zh_CN") {
    return LEVEL_DISPLAY_TEXTS[locale] || LEVEL_DISPLAY_TEXTS.zh_CN;
}

export class MinesiaLevelSystem {
    static playerStats = new Map();
    static displayPaused = new Map();
    static LEVEL_EXP = [
        0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
        3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
        11550, 12750, 14050, 15450, 16950, 18550, 20250, 22050, 23950, 25950,
        28150, 30550, 33150, 35950, 38950, 42150, 45550, 49150, 52950, 56950,
        61150, 65550, 70150, 74950, 79950, 85150, 90550, 96150, 101950, 108000,
        115000
    ];

    static getTotalExperience(player) {
        try {
            const scoreboard = world.scoreboard;
            const expObj = scoreboard?.getObjective("minesia_exp");
            if (expObj) {
                const score = expObj.getScore(player);
                if (typeof score === "number" && !Number.isNaN(score)) {
                    return score;
                }
            }
        } catch (_e) {
            return null;
        }
        return null;
    }

    static getLocalizedText(player, key, ...args) {
        try {
            const englishTexts = {
                "minesia.level.title": "Minesia Level",
                "minesia.level.level_up": "Congratulations! Your level has been upgraded to level %s!",
                "minesia.level.total_exp": "Total Experience Gained",
                "minesia.level.level_ups": "Level Ups",
                "minesia.level.play_time": "Play Time",
                "minesia.level.experience": "Experience",
                "minesia.level.progress": "Progress",
                "minesia.level.total_experience": "Total Experience",
                "minesia.level.max_level": "Max Level"
            };

            let text = englishTexts[key] || key;

            if (args.length > 0) {
                text = text.replace(/%s/g, (match, index) => {
                    return args.shift() || match;
                });
            }

            return text;
        } catch (error) {
            console.warn('[Minesia] 获取文本失败:', error?.message ?? error);
            return key;
        }
    }

    static calculateLevel(exp) {
        const LEVEL_EXP = this.LEVEL_EXP;

        if (exp >= LEVEL_EXP[LEVEL_EXP.length - 1]) {
            return LEVEL_EXP.length - 1;
        }

        for (let level = 1; level < LEVEL_EXP.length; level++) {
            if (exp < LEVEL_EXP[level]) {
                return level - 1;
            }
        }

        return LEVEL_EXP.length - 1;
    }

    static getLevelProgress(player) {
        const totalExp = this.getTotalExperience(player);
        if (totalExp === null) return null;
        const currentLevel = this.calculateLevel(totalExp);
        const maxLevel = this.LEVEL_EXP.length - 1;

        if (currentLevel >= maxLevel) {
            return {
                level: maxLevel,
                totalExp: totalExp,
                expInCurrentLevel: 0,
                expNeeded: 0,
                progress: 1,
                nextLevelExp: this.LEVEL_EXP[maxLevel]
            };
        }

        const nextLevelExp = this.getExpForLevel(currentLevel + 1);
        const currentLevelExp = this.getExpForLevel(currentLevel);
        const expInCurrentLevel = totalExp - currentLevelExp;
        const expNeeded = nextLevelExp - currentLevelExp;
        const progress = expNeeded > 0 ? expInCurrentLevel / expNeeded : 1;

        return {
            level: currentLevel,
            totalExp: totalExp,
            expInCurrentLevel: expInCurrentLevel,
            expNeeded: expNeeded,
            progress: progress,
            nextLevelExp: nextLevelExp
        };
    }

    static getExpForLevel(level) {
        const LEVEL_EXP = this.LEVEL_EXP;
        return level < LEVEL_EXP.length
            ? LEVEL_EXP[level]
            : LEVEL_EXP[LEVEL_EXP.length - 1];
    }

    static showLevelProgress(player) {
        const progress = this.getLevelProgress(player);
        if (!progress) return;

        const progressBar = "█".repeat(Math.max(0, Math.min(20, Math.floor(progress.progress * 20)))) +
            "░".repeat(Math.max(0, 20 - Math.floor(progress.progress * 20)));

        const title = this.getLocalizedText(player, "minesia.level.title");
        const experienceText = this.getLocalizedText(player, "minesia.level.experience");
        const progressText = this.getLocalizedText(player, "minesia.level.progress");
        const totalExperienceText = this.getLocalizedText(player, "minesia.level.total_experience");

        player.sendMessage(`§b=== ${title} Info ===`);
        player.sendMessage(`§eLevel: §f${progress.level}`);
        player.sendMessage(`§e${experienceText}: §f${progress.expInCurrentLevel}/${progress.expNeeded}`);
        player.sendMessage(`§e${progressText}: §f${progressBar} ${(progress.progress * 100).toFixed(1)}%`);
        player.sendMessage(`§e${totalExperienceText}: §f${progress.totalExp}`);
    }

    static updatePlayerStats(player, expGained, currentLevel) {
        const playerId = player.id;
        if (!this.playerStats.has(playerId)) {
            this.playerStats.set(playerId, {
                totalExpGained: 0,
                levelUps: 0,
                playTime: 0,
                lastUpdate: Date.now(),
                highestLevel: 0
            });
        }

        const stats = this.playerStats.get(playerId);
        if (expGained > 0) {
            stats.totalExpGained += expGained;
        }
        stats.playTime += (Date.now() - stats.lastUpdate) / 1000;
        stats.lastUpdate = Date.now();

        if (currentLevel > stats.highestLevel) {
            stats.levelUps++;
            stats.highestLevel = currentLevel;
        }
    }

    static showPlayerStats(player) {
        const stats = this.playerStats.get(player.id);
        if (!stats) {
            player.sendMessage("§cNo stats available");
            return;
        }

        const hours = Math.floor(stats.playTime / 3600);
        const minutes = Math.floor((stats.playTime % 3600) / 60);

        const title = this.getLocalizedText(player, "minesia.level.title");
        const totalExpText = this.getLocalizedText(player, "minesia.level.total_exp");
        const levelUpsText = this.getLocalizedText(player, "minesia.level.level_ups");
        const playTimeText = this.getLocalizedText(player, "minesia.level.play_time");

        player.sendMessage(`§b=== ${title} Stats ===`);
        player.sendMessage(`§e${totalExpText}: §f${stats.totalExpGained}`);
        player.sendMessage(`§e${levelUpsText}: §f${stats.levelUps}`);
        player.sendMessage(`§e${playTimeText}: §f${hours}h ${minutes}m`);
    }

    static updateLevelDisplay(player) {
        const playerId = player.id;

        if (this.displayPaused.has(playerId)) {
            return;
        }

        const progress = this.getLevelProgress(player);
        if (!progress) {
            ActionBarManager.removeLine(playerId, 'level');
            return;
        }

        const locale = getPlayerLocale(player);
        const texts = getLevelDisplayTexts(locale);
        const maxLevel = this.LEVEL_EXP.length - 1;

        let displayText;
        if (progress.level >= maxLevel) {
            displayText = `§b${texts.level} Lv.${progress.level} §6§l${texts.max}§r`;
        } else {
            const barLength = 12;
            const filled = Math.max(0, Math.min(barLength, Math.floor(progress.progress * barLength)));
            const empty = Math.max(0, barLength - filled);
            const bar = "§a" + "■".repeat(filled) + "§8" + "■".repeat(empty);
            const expText = `${progress.expInCurrentLevel}/${progress.expNeeded}`;
            const percentText = Math.floor(progress.progress * 100).toString().padStart(3, " ");
            displayText = `§b${texts.level} Lv.${progress.level} ${bar} §7${expText} §f${percentText}%`;
        }

        ActionBarManager.setLine(playerId, 'level', displayText, DISPLAY_PRIORITIES.LEVEL);
        ActionBarManager.updateDisplay(player);
    }

    static pauseLevelDisplay(player, duration) {
        const playerId = player.id;
        this.displayPaused.set(playerId, true);
        system.runTimeout(() => {
            this.displayPaused.delete(playerId);
        }, Math.floor(duration / 50));
    }
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "minesia:level_info") {
        const player = event.sourceEntity;
        if (player && player.typeId === "minecraft:player") {
            MinesiaLevelSystem.showLevelProgress(player);
        }
    } else if (event.id === "minesia:stats") {
        const player = event.sourceEntity;
        if (player && player.typeId === "minecraft:player") {
            MinesiaLevelSystem.showPlayerStats(player);
        }
    }
});
