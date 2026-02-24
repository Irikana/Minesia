// actionBarManager.js
// ===============================
// ActionBar 统一管理系统
// 支持多行同时显示，按优先级排列
// ===============================

import { world, system } from "@minecraft/server";

const playerActionBarState = new Map();

const DISPLAY_PRIORITIES = {
    LEVEL: 1,
    STAMINA: 2,
    DAMAGE: 3,
    AOE: 4
};

class ActionBarManager {
    static DISPLAY_PRIORITIES = DISPLAY_PRIORITIES;

    static setLine(playerId, lineKey, text, priority) {
        if (!playerActionBarState.has(playerId)) {
            playerActionBarState.set(playerId, new Map());
        }
        const playerLines = playerActionBarState.get(playerId);
        playerLines.set(lineKey, { text, priority });
    }

    static removeLine(playerId, lineKey) {
        const playerLines = playerActionBarState.get(playerId);
        if (playerLines) {
            playerLines.delete(lineKey);
        }
    }

    static clearAllLines(playerId) {
        playerActionBarState.delete(playerId);
    }

    static buildDisplayText(playerId) {
        const playerLines = playerActionBarState.get(playerId);
        if (!playerLines || playerLines.size === 0) {
            return null;
        }

        const lines = Array.from(playerLines.values())
            .sort((a, b) => a.priority - b.priority)
            .map(line => line.text);

        return lines.join('\n');
    }

    static updateDisplay(player) {
        const playerId = player.id;
        const displayText = this.buildDisplayText(playerId);

        if (displayText) {
            player.onScreenDisplay.setActionBar(displayText);
        }
    }

    static hasLines(playerId) {
        const playerLines = playerActionBarState.get(playerId);
        return playerLines && playerLines.size > 0;
    }

    static hasLine(playerId, lineKey) {
        const playerLines = playerActionBarState.get(playerId);
        return playerLines && playerLines.has(lineKey);
    }
}

export { ActionBarManager, DISPLAY_PRIORITIES };
