// minesiaLevelMain.js - 创世等级系统主逻辑

import { world, system } from "@minecraft/server";
import { MinesiaLevelSystem } from "./level_system.js";
import { MinesiaLevelEventSystem } from "./minesiaLevelEvent.js";

// 性能优化：使用Map存储每个玩家的状态
const playerStates = new Map();

// 安全获取玩家总经验
function getPlayerTotalExperience(player) {
    try {
        if (typeof player.getTotalXp === "function") {
            const total = player.getTotalXp();
            if (typeof total === "number" && !Number.isNaN(total)) {
                return total;
            }
        }
    } catch (_e) { }

    try {
        const xpComp = player.getComponent("minecraft:experience") ?? player.getComponent("minecraft:xp");
        if (!xpComp || typeof xpComp.totalExperience !== "number") {
            return null;
        }
        return xpComp.totalExperience;
    } catch (_e) {
        return null;
    }
}

// 初始化 Minesia 计分板
export function initializeScoreboard() {
    try {
        const scoreboard = world.scoreboard;
        if (!scoreboard) {
            console.warn('[Minesia] Scoreboard API不可用');
            return false;
        }

        let levelObjective = scoreboard.getObjective('minesia_level');
        if (!levelObjective) {
            levelObjective = scoreboard.addObjective('minesia_level', 'Minesia Level');
            console.log('[Minesia] 计分板 minesia_level 初始化成功');
        }

        let expObjective = scoreboard.getObjective('minesia_exp');
        if (!expObjective) {
            expObjective = scoreboard.addObjective('minesia_exp', 'Minesia Exp');
            console.log('[Minesia] 计分板 minesia_exp 初始化成功');
        }

        let langObjective = scoreboard.getObjective('minesia_language');
        if (!langObjective) {
            langObjective = scoreboard.addObjective('minesia_language', 'Minesia Language');
            console.log('[Minesia] 计分板 minesia_language 初始化成功');
        }

        return true;
    } catch (e) {
        console.error('[Minesia] 初始化计分板失败:', e?.message ?? e);
        return false;
    }
}

// 批量更新玩家等级
function updatePlayerLevels(players) {
    const updates = [];

    for (const player of players) {
        try {
            const currentExp = getPlayerTotalExperience(player);
            if (currentExp === null) continue;

            let playerState = playerStates.get(player.id);
            if (!playerState) {
                playerState = {
                    lastExp: currentExp,
                    minesiaTotalExp: currentExp,
                    currentLevel: 0,
                    lastUpdateTime: 0
                };
                playerStates.set(player.id, playerState);
            }

            const delta = currentExp - playerState.lastExp;
            let expGained = 0;

            if (delta > 0) {
                playerState.minesiaTotalExp += delta;
                expGained = delta;
            }

            const oldLevel = playerState.currentLevel;
            const newLevel = MinesiaLevelSystem.calculateLevel(playerState.minesiaTotalExp);

            if (expGained > 0 || newLevel !== oldLevel) {
                updates.push({
                    player: player,
                    level: newLevel,
                    oldLevel: oldLevel,
                    expGained: expGained,
                    totalExp: playerState.minesiaTotalExp
                });
                MinesiaLevelSystem.updatePlayerStats(player, expGained, newLevel);
            }

            if (expGained > 0 || newLevel !== oldLevel || Date.now() - playerState.lastUpdateTime > 50) {
                MinesiaLevelSystem.updateLevelDisplay(player);
                playerState.currentLevel = newLevel;
                playerState.lastExp = currentExp;
                playerState.lastUpdateTime = Date.now();
            }

        } catch (error) {
            console.warn('[Minesia] 处理玩家经验时出错:', player.name, error.message);
        }
    }

    return updates;
}

// 批量更新计分板
function batchUpdateScoreboard(updates) {
    if (updates.length === 0) return;

    try {
        const scoreboard = world.scoreboard;
        if (!scoreboard) return;

        const levelObj = scoreboard.getObjective('minesia_level');
        const expObj = scoreboard.getObjective('minesia_exp');
        if (!levelObj) return;

        for (const update of updates) {
            try {
                levelObj.setScore(update.player, update.level);
                if (expObj && typeof update.totalExp === 'number') {
                    expObj.setScore(update.player, Math.floor(update.totalExp));
                }
            } catch (error) {
                console.warn('[Minesia] 更新玩家计分板失败:', update.player.name, error?.message ?? error);
            }
        }

        for (const update of updates) {
            if (update.level > update.oldLevel) {
                console.log(`[Minesia] 玩家 ${update.player.name} 等级提升: ${update.oldLevel} -> ${update.level}`);
                MinesiaLevelEventSystem.handleLevelUp(update.player, update.oldLevel, update.level);
            }
        }

    } catch (error) {
        console.error('[Minesia] 批量更新计分板失败:', error?.message ?? error);
    }
}

// 清理离线玩家数据
function cleanupOfflinePlayers() {
    const onlinePlayerIds = new Set(world.getPlayers().map(p => p.id));
    for (const playerId of playerStates.keys()) {
        if (!onlinePlayerIds.has(playerId)) {
            playerStates.delete(playerId);
        }
    }
}

// 主更新循环
export function updateMinesiaSystem() {
    try {
        const players = world.getPlayers();
        if (players.length === 0) return;

        const updates = updatePlayerLevels(players);
        if (updates.length > 0) {
            batchUpdateScoreboard(updates);
        }

        if (Math.random() < 0.01) {
            cleanupOfflinePlayers();
        }

    } catch (error) {
        console.error('[Minesia] 系统更新错误:', error);
    }
}