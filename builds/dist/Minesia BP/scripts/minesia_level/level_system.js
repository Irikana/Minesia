// Minesia等级系统扩展功能
import { world, system } from "@minecraft/server";

// 经验显示和统计功能
export class MinesiaLevelSystem {
    static playerStats = new Map();
    static playerDisplayPaused = new Map(); // 记录玩家进度条显示是否暂停

    /**
     * 暂停玩家的等级进度条显示
     * @param {Player} player - 玩家
     * @param {number} duration - 暂停时长（毫秒）
     */
    static pauseLevelDisplay(player, duration) {
        const playerId = player.id;
        this.playerDisplayPaused.set(playerId, true);

        // 清除当前的进度条显示
        player.onScreenDisplay.setActionBar("");

        // 在指定时间后恢复显示
        system.runTimeout(() => {
            this.resumeLevelDisplay(player);
        }, Math.floor(duration / 50)); // 转换为游戏刻
    }

    /**
     * 恢复玩家的等级进度条显示
     * @param {Player} player - 玩家
     */
    static resumeLevelDisplay(player) {
        const playerId = player.id;
        this.playerDisplayPaused.delete(playerId);

        // 立即更新进度条显示
        this.updateLevelDisplay(player);
    }

    // 全局等级经验表（唯一真源）
    static LEVEL_EXP = [
        0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
        3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
        11550, 12750, 14050, 15450, 16950, 18550, 20250, 22050, 23950, 25950,
        28150, 30550, 33150, 35950, 38950, 42150, 45550, 49150, 52950, 56950,
        61150, 65550, 70150, 74950, 79950, 85150, 90550, 96150, 101950, 108000,
        115000
    ];

    // 安全获取玩家「创世总经验」（优先使用计分板 minesia_exp）
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

    // 获取文本 - 只使用英文
    static getLocalizedText(player, key, ...args) {
        try {
            // 只使用英文文本
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

            // 获取英文文本
            let text = englishTexts[key] || key;

            // 替换参数
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

    // 计算等级 - 简化版，确保准确性
    static calculateLevel(exp) {
        const LEVEL_EXP = this.LEVEL_EXP;

        // 检查是否达到或超过最大等级
        if (exp >= LEVEL_EXP[LEVEL_EXP.length - 1]) {
            return LEVEL_EXP.length - 1;
        }

        // 从1级开始查找
        for (let level = 1; level < LEVEL_EXP.length; level++) {
            if (exp < LEVEL_EXP[level]) {
                return level - 1;
            }
        }

        return LEVEL_EXP.length - 1;
    }

    // 获取玩家等级进度信息
    static getLevelProgress(player) {
        const totalExp = this.getTotalExperience(player);
        if (totalExp === null) return null;
        const currentLevel = this.calculateLevel(totalExp);
        const maxLevel = this.LEVEL_EXP.length - 1;

        // 如果达到最高等级，返回特殊的进度信息
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

    // 获取指定等级所需经验
    static getExpForLevel(level) {
        const LEVEL_EXP = this.LEVEL_EXP;
        return level < LEVEL_EXP.length
            ? LEVEL_EXP[level]
            : LEVEL_EXP[LEVEL_EXP.length - 1];
    }

    // 显示等级进度给玩家
    static showLevelProgress(player) {
        const progress = this.getLevelProgress(player);
        if (!progress) return;

        const progressBar = "█".repeat(Math.floor(progress.progress * 20)) +
            "░".repeat(20 - Math.floor(progress.progress * 20));

        // 使用本地化文本
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

    // 统计玩家游戏数据（基于创世等级 & 正向经验）
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
        stats.playTime += (Date.now() - stats.lastUpdate) / 1000; // 秒
        stats.lastUpdate = Date.now();

        if (currentLevel > stats.highestLevel) {
            stats.levelUps++;
            stats.highestLevel = currentLevel;
        }
    }

    // 显示玩家统计数据
    static showPlayerStats(player) {
        const stats = this.playerStats.get(player.id);
        if (!stats) {
            player.sendMessage("§cNo stats available");
            return;
        }

        const hours = Math.floor(stats.playTime / 3600);
        const minutes = Math.floor((stats.playTime % 3600) / 60);

        // 使用本地化文本
        const title = this.getLocalizedText(player, "minesia.level.title");
        const totalExpText = this.getLocalizedText(player, "minesia.level.total_exp");
        const levelUpsText = this.getLocalizedText(player, "minesia.level.level_ups");
        const playTimeText = this.getLocalizedText(player, "minesia.level.play_time");

        player.sendMessage(`§b=== ${title} Stats ===`);
        player.sendMessage(`§e${totalExpText}: §f${stats.totalExpGained}`);
        player.sendMessage(`§e${levelUpsText}: §f${stats.levelUps}`);
        player.sendMessage(`§e${playTimeText}: §f${hours}h ${minutes}m`);
    }

    // Update top title bar to display Minesia level progress bar
    static updateLevelTitleBar(player) {
        try {
            const progress = this.getLevelProgress(player);
            if (!progress) return;

            // Build progress bar (20 characters length)
            const barLength = 20;
            const filled = Math.floor(progress.progress * barLength);
            const empty = barLength - filled;
            const bar = "█".repeat(filled) + "░".repeat(empty);

            // Only use English, remove language detection
            // Build title text: left level + middle progress bar
            const titleText = `§bMinesia Lv.${progress.level} §f${bar}`;

            // Use setTitle to display (without subtitle, let JSON UI "Next Level" text display below)
            player.onScreenDisplay.setTitle(titleText, {
                stayDuration: 2147483647, // Permanent display
                fadeInDuration: 0,
                fadeOutDuration: 0
            });

            // Update JSON UI global variables
            this.updateGlobalUIVariables(player);

            // Directly create and control level system UI in script
            this.createAndControlLevelUI(player);
        } catch (error) {
            console.warn('[Minesia] Failed to update title bar:', error?.message ?? error);
        }
    }

    // Update JSON UI global variables
    static updateGlobalUIVariables(player) {
        try {
            const progress = this.getLevelProgress(player);
            if (!progress) return;

            // Build progress bar (20 characters length)
            const barLength = 20;
            const filled = Math.floor(progress.progress * barLength);
            const empty = barLength - filled;
            const progressBar = "█".repeat(filled) + "░".repeat(empty);

            // Calculate required experience for next level
            const expNeeded = progress.expNeeded;
            const nextLevelText = `Next: ${Math.floor(expNeeded)}`;

            // Update global variables (need to implement according to actual global variable system)
            // Note: Minecraft Bedrock's global variable system may require different implementation
            // Using placeholder implementation here, need to adjust according to specific API in actual project
            console.log('[Minesia] UI Variables - Level:', progress.level, 'Progress:', progressBar, 'Next:', nextLevelText);

        } catch (error) {
            console.warn('[Minesia] Failed to update UI variables:', error?.message ?? error);
        }
    }

    // Directly create and control level system UI in script
    static createAndControlLevelUI(player) {
        try {
            const progress = this.getLevelProgress(player);
            if (!progress) return;

            // Build progress bar (20 characters length)
            const barLength = 20;
            const filled = Math.floor(progress.progress * barLength);
            const empty = barLength - filled;
            const bar = "█".repeat(filled) + "░".repeat(empty);

            // Build title text: left level + middle progress bar
            const titleText = `§bMinesia Lv.${progress.level} §f${bar}`;

            // Use setTitle to display at the top
            // Note: Minecraft Bedrock's setTitle method itself doesn't support directly setting size and position
            // But we can control display effect through text format and length
            player.onScreenDisplay.setTitle(titleText, {
                stayDuration: 2147483647, // Permanent display
                fadeInDuration: 0,
                fadeOutDuration: 0,
                // Note: Different versions of Minecraft Bedrock may support different parameters
                // Some versions may support position parameter to control display position
            });

            // Try to use setVariable method to set global variables, which may affect UI display
            try {
                // Set UI size variables
                player.onScreenDisplay.setVariable('minesia_level_ui_width', 100);
                player.onScreenDisplay.setVariable('minesia_level_ui_height', 10);

                // Set UI position variables
                player.onScreenDisplay.setVariable('minesia_level_ui_x', 0);
                player.onScreenDisplay.setVariable('minesia_level_ui_y', 10);

                console.log('[Minesia] Directly set level system UI in script - Width: 100, Height: 10, Position: Top center');
            } catch (e) {
                // If setVariable method is not available, ignore error
                console.log('[Minesia] setVariable method not available, using default display mode');
            }

        } catch (error) {
            console.warn('[Minesia] Failed to create and control level system UI:', error?.message ?? error);
        }
    }

    // Refactored display system - Use actionbar to implement top center display
    static updateLevelDisplay(player) {
        try {
            // 检查是否暂停了进度条显示
            if (this.playerDisplayPaused.has(player.id)) {
                return;
            }

            const progress = this.getLevelProgress(player);
            if (!progress) return;

            const maxLevel = this.LEVEL_EXP.length - 1;

            // 检查是否达到最高级或更高
            if (progress.level >= maxLevel) {
                // 最高级及以上，只显示等级和最高等级声明 - 使用titleraw命令支持本地化
                player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§b"},{"translate":"minesia.level.title"},{"text":" Lv.${progress.level} §6"},{"translate":"minesia.level.max_level"}]}`);
            } else {
                // 未达到最高级，显示等级和进度条
                // Build progress bar (20 characters length)
                const barLength = 20;
                const filled = Math.floor(progress.progress * barLength);
                const empty = barLength - filled;
                const bar = "█".repeat(filled) + "░".repeat(empty);

                // 使用titleraw命令支持本地化
                player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§b"},{"translate":"minesia.level.title"},{"text":" Lv.${progress.level} §f${bar}"}]}`);
            }

        } catch (error) {
            console.warn('[Minesia] Failed to update level display:', error?.message ?? error);
        }
    }
}

// Register command handler
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