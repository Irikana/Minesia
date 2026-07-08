// hudBridgeMain.js - JSON UI 与脚本的数据桥接层
// 通过计分板把等级/体力数据传递给 JSON UI 自定义 HUD
import { world, system, GameMode } from "@minecraft/server";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { StaminaSystem } from "../stamina/staminaMain.js";
import { debug } from "../debug/debugManager.js";

// 计分板目标名称
const OBJECTIVES = {
    // 经验条宽度(像素值 0-180,用于 size binding)
    EXP_BAR_WIDTH: "minesia_hud_exp_w",
    // 体力条宽度(像素值 0-180,用于 size binding)
    STA_BAR_WIDTH: "minesia_hud_sta_w",
    // 等级数字(用于 label text binding)
    LEVEL: "minesia_hud_lvl",
    // 经验百分比(0-100,用于 label text binding)
    EXP_PERCENT: "minesia_hud_exp_pct",
    // 体力百分比(0-100,用于 label text binding)
    STA_PERCENT: "minesia_hud_sta_pct",
    // HUD 可见性(0=隐藏,1=显示,用于控制自定义HUD显隐)
    VISIBLE: "minesia_hud_visible"
};

// 进度条总宽度(像素),需与 minesia_hud.json 中的容器宽度一致
const BAR_TOTAL_WIDTH = 180;

let initialized = false;

/**
 * 初始化 HUD 桥接系统:创建所有计分项
 */
export function initializeHudBridge() {
    try {
        const scoreboard = world.scoreboard;

        // 创建所有计分项(dummy 类型,仅用于数据存储)
        for (const objName of Object.values(OBJECTIVES)) {
            if (!scoreboard.getObjective(objName)) {
                scoreboard.addObjective(objName, "dummy");
            }
        }

        initialized = true;
        debug.logWithTag("HudBridge", "HUD 桥接计分板初始化完成");
    } catch (error) {
        debug.logError("HudBridge", `初始化失败: ${error?.message ?? error}`);
    }
}

/**
 * 获取或创建计分项
 */
function getOrCreateObjective(name) {
    const scoreboard = world.scoreboard;
    let obj = scoreboard.getObjective(name);
    if (!obj) {
        obj = scoreboard.addObjective(name, "dummy");
    }
    return obj;
}

/**
 * 设置玩家的计分项分数
 */
function setScore(player, objectiveName, value) {
    try {
        const obj = getOrCreateObjective(objectiveName);
        obj.setScore(player, Math.round(value));
    } catch (error) {
        // 静默失败,避免刷屏
    }
}

/**
 * 更新单个玩家的 HUD 数据
 * 从 MinesiaLevelSystem 和 StaminaSystem 读取数据,写入计分板
 */
export function updatePlayerHud(player) {
    if (!initialized) return;

    try {
        // 默认显示 HUD
        setScore(player, OBJECTIVES.VISIBLE, 1);

        // === 等级数据 ===
        const levelProgress = MinesiaLevelSystem.getLevelProgress(player);
        if (levelProgress) {
            const expWidth = Math.max(0, Math.min(BAR_TOTAL_WIDTH, Math.floor(levelProgress.progress * BAR_TOTAL_WIDTH)));
            setScore(player, OBJECTIVES.EXP_BAR_WIDTH, expWidth);
            setScore(player, OBJECTIVES.LEVEL, levelProgress.level);
            setScore(player, OBJECTIVES.EXP_PERCENT, Math.floor(levelProgress.progress * 100));
        } else {
            setScore(player, OBJECTIVES.EXP_BAR_WIDTH, 0);
            setScore(player, OBJECTIVES.LEVEL, 0);
            setScore(player, OBJECTIVES.EXP_PERCENT, 0);
        }

        // === 体力数据 ===
        const gameMode = player.getGameMode?.();
        if (gameMode === GameMode.creative || gameMode === GameMode.spectator) {
            // 创造/旁观模式不显示体力条
            setScore(player, OBJECTIVES.STA_BAR_WIDTH, 0);
            setScore(player, OBJECTIVES.STA_PERCENT, 0);
        } else {
            const staminaData = StaminaSystem.getPlayerData(player);
            const maxStamina = StaminaSystem.getMaxStamina(player);
            const stamina = staminaData?.stamina ?? maxStamina;
            const staRatio = maxStamina > 0 ? stamina / maxStamina : 0;
            const staWidth = Math.max(0, Math.min(BAR_TOTAL_WIDTH, Math.floor(staRatio * BAR_TOTAL_WIDTH)));
            setScore(player, OBJECTIVES.STA_BAR_WIDTH, staWidth);
            setScore(player, OBJECTIVES.STA_PERCENT, Math.floor(staRatio * 100));
        }
    } catch (error) {
        // 静默失败
    }
}

/**
 * 更新所有玩家的 HUD 数据(每 tick 调用)
 */
export function updateHudBridge() {
    if (!initialized) return;

    try {
        const players = world.getPlayers();
        for (const player of players) {
            updatePlayerHud(player);
        }
    } catch (error) {
        // 静默失败
    }
}

/**
 * 隐藏玩家的自定义 HUD
 */
export function hidePlayerHud(player) {
    setScore(player, OBJECTIVES.VISIBLE, 0);
}

/**
 * 显示玩家的自定义 HUD
 */
export function showPlayerHud(player) {
    setScore(player, OBJECTIVES.VISIBLE, 1);
}

export const HUD_BRIDGE_OBJECTIVES = OBJECTIVES;
