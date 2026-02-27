// actionBarManager.js
// ===============================
// ActionBar 统一管理系统
// 支持多行同时显示，按优先级排列
// 支持动态居中对齐（进度条优先对齐）
// ===============================

import { world, system } from "@minecraft/server";

const playerActionBarState = new Map();

const DISPLAY_PRIORITIES = {
    LEVEL: 1,
    STAMINA: 2,
    DAMAGE: 3,
    AOE: 4
};

function getCharWidth(char) {
    const code = char.charCodeAt(0);
    if (code >= 0x4E00 && code <= 0x9FFF) return 2;
    if (code >= 0x3000 && code <= 0x303F) return 2;
    if (code >= 0xFF00 && code <= 0xFFEF) return 2;
    if (code >= 0xAC00 && code <= 0xD7AF) return 2;
    if (code >= 0x3040 && code <= 0x309F) return 2;
    if (code >= 0x30A0 && code <= 0x30FF) return 2;
    if (code >= 0x2500 && code <= 0x257F) return 2;
    if (code >= 0x2580 && code <= 0x259F) return 2;
    if (code >= 0x25A0 && code <= 0x25FF) return 2;
    return 1;
}

function getDisplayWidth(text) {
    let width = 0;
    let inColorCode = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '§') {
            inColorCode = true;
            continue;
        }
        if (inColorCode) {
            inColorCode = false;
            continue;
        }
        width += getCharWidth(char);
    }
    return width;
}

function findProgressBarIndex(text) {
    const barChars = ['■', '█', '░', '□'];
    let firstBarIndex = -1;
    let inColorCode = false;
    let visualIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '§') {
            inColorCode = true;
            continue;
        }
        if (inColorCode) {
            inColorCode = false;
            continue;
        }
        if (barChars.includes(char) && firstBarIndex === -1) {
            firstBarIndex = visualIndex;
            break;
        }
        visualIndex += getCharWidth(char);
    }
    return firstBarIndex;
}

function hasProgressBar(text) {
    const barChars = ['■', '█', '░', '□'];
    return barChars.some(char => text.includes(char));
}

function getProgressBarWidth(text) {
    const barChars = ['■', '█', '░', '□'];
    let width = 0;
    let inColorCode = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '§') {
            inColorCode = true;
            continue;
        }
        if (inColorCode) {
            inColorCode = false;
            continue;
        }
        if (barChars.includes(char)) {
            width += getCharWidth(char);
        }
    }
    return width;
}

function padLeft(text, targetWidth) {
    const currentWidth = getDisplayWidth(text);
    const padding = Math.max(0, targetWidth - currentWidth);
    return ' '.repeat(Math.floor(padding / 2)) + text;
}

function padToAlign(text, targetBarIndex, currentBarIndex) {
    if (currentBarIndex < 0 || targetBarIndex < 0) return text;
    const padding = targetBarIndex - currentBarIndex;
    if (padding <= 0) return text;
    return ' '.repeat(padding) + text;
}

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

        const sortedLines = Array.from(playerLines.entries())
            .sort((a, b) => a[1].priority - b[1].priority);

        const lines = sortedLines.map(([key, line]) => ({
            key,
            text: line.text,
            hasBar: hasProgressBar(line.text),
            barIndex: findProgressBarIndex(line.text),
            barWidth: getProgressBarWidth(line.text),
            displayWidth: getDisplayWidth(line.text)
        }));

        const linesWithBar = lines.filter(l => l.hasBar && l.barIndex >= 0);
        const linesWithoutBar = lines.filter(l => !l.hasBar);

        let maxBarIndex = 0;
        let maxBarWidth = 0;
        let maxTotalWidth = 0;

        if (linesWithBar.length > 0) {
            maxBarIndex = Math.max(...linesWithBar.map(l => l.barIndex));
            maxBarWidth = Math.max(...linesWithBar.map(l => l.barWidth));
        }

        for (const line of lines) {
            if (line.hasBar) {
                const afterBarWidth = line.displayWidth - line.barIndex - line.barWidth;
                const totalWidth = maxBarIndex + maxBarWidth + afterBarWidth;
                maxTotalWidth = Math.max(maxTotalWidth, totalWidth);
            } else {
                maxTotalWidth = Math.max(maxTotalWidth, line.displayWidth);
            }
        }

        const alignedLines = lines.map(line => {
            if (line.hasBar && line.barIndex >= 0) {
                return padToAlign(line.text, maxBarIndex, line.barIndex);
            } else if (linesWithBar.length > 0) {
                const targetCenter = maxBarIndex + Math.floor(maxBarWidth / 2);
                const lineCenter = Math.floor(line.displayWidth / 2);
                const padding = Math.max(0, targetCenter - lineCenter);
                return ' '.repeat(padding) + line.text;
            } else {
                return padLeft(line.text, maxTotalWidth);
            }
        });

        return alignedLines.join('\n');
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
