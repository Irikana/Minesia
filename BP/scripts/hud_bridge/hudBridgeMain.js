// hudBridgeMain.js - JSON UI 与脚本的数据桥接层(轮转单值方案)
// 参考 Bedrock_Reimagined 的 data_control 模式,但改为轮转发送单值
// 每 tick 发送一个前缀标题,3 个值循环发送,每个 data_control 只捕获自己的前缀
// 关键: 累积减法解析多值存在根本缺陷(子串超出原串长度时减法返回原值),
// 改用 3 个独立 data_control 各自捕获单值,避免多值解析
import { world, system, GameMode } from "@minecraft/server";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { StaminaSystem } from "../stamina/staminaMain.js";
import { MinesiaLevelEventSystem } from "../minesia_level/minesiaLevelEvent.js";
import { debug } from "../debug/debugManager.js";

// 3 个前缀,每个 data_control 只响应自己的前缀
const PREFIX_LEVEL = "dataL";
const PREFIX_EXP = "dataE";
const PREFIX_STAMINA = "dataS";

// 轮转周期: 4 tick。phase 0=level, 1=exp, 2=stamina, 3=间隔(让值稳定)
const CYCLE_LENGTH = 4;

const playerHudCache = new Map();
let initialized = false;
let tickCounter = 0;

export function initializeHudBridge() {
    try {
        initialized = true;
        debug.logWithTag("HudBridge", "HUD 轮转单值桥接系统初始化完成");
    } catch (error) {
        debug.logError("HudBridge", `初始化失败: ${error?.message ?? error}`);
    }
}

/**
 * 发送单值到 title 通道
 * 格式: "前缀:值" (如 "dataL:5")
 */
function sendHudValue(player, prefix, value) {
    try {
        player.onScreenDisplay.setTitle(`${prefix}:${value}`);
    } catch (e) {
        // 静默失败
    }
}

/**
 * 更新所有玩家的 HUD 数据(每 tick 调用)
 * 每 tick 只发送一个值,3 个值在 4 tick 周期内轮转发送
 */
export function updateHudBridge() {
    if (!initialized) return;

    try {
        tickCounter++;
        const phase = tickCounter % CYCLE_LENGTH;

        // phase 3 是间隔 tick,不发送
        if (phase === 3) return;

        const players = world.getPlayers();
        for (const player of players) {
            const playerId = player.id;
            let cache = playerHudCache.get(playerId);
            if (!cache) {
                cache = { level: 0, expPercent: 0, staPercent: 0 };
                playerHudCache.set(playerId, cache);
            }

            // 在 phase 0 时计算所有值(每 4 tick 计算一次)
            if (phase === 0) {
                const levelProgress = MinesiaLevelSystem.getLevelProgress(player);
                cache.level = levelProgress?.level ?? 0;
                cache.expPercent = levelProgress ? Math.floor(levelProgress.progress * 100) : 0;

                const gameMode = player.getGameMode?.();
                if (gameMode !== GameMode.creative && gameMode !== GameMode.spectator) {
                    const staminaData = StaminaSystem.getPlayerData(player);
                    const maxStamina = StaminaSystem.getMaxStamina(player);
                    const stamina = staminaData?.stamina ?? maxStamina;
                    cache.staPercent = maxStamina > 0 ? Math.floor((stamina / maxStamina) * 100) : 0;
                } else {
                    cache.staPercent = 0;
                }
            }

            // 根据 phase 发送对应值
            if (phase === 0) {
                sendHudValue(player, PREFIX_LEVEL, cache.level);
            } else if (phase === 1) {
                sendHudValue(player, PREFIX_EXP, cache.expPercent);
            } else if (phase === 2) {
                sendHudValue(player, PREFIX_STAMINA, cache.staPercent);
            }
        }

        // === 调试输出(每 60 tick) ===
        if (debug.isEnabled() && (tickCounter % 60) === 0) {
            for (const player of players) {
                const cache = playerHudCache.get(player.id);
                if (cache) {
                    debug.logPlayer(player, `§b[HudBridge]§r level=${cache.level} exp=${cache.expPercent}% sta=${cache.staPercent}%`);
                }
            }
        }
    } catch (error) {
        // 静默失败
    }
}

/**
 * 玩家加入时重置缓存
 */
export function onPlayerSpawn(player) {
    playerHudCache.delete(player.id);
}
