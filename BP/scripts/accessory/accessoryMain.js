import { world, system, EntityComponentTypes } from "@minecraft/server";
import { ACCESSORY_CONFIG } from "./config.js";
import { debug } from "../debug/debugManager.js";

const previousAccessoryState = new Map();

export function initializeAccessorySystem() {
    // playerInventoryItemChange / PlayerInventoryType 是 beta API，2.7.0 稳定版不可用
    // 使用轮询方式检测饰品栏变化
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            checkAccessoryChanges(player);
        }
    }, 10);

    debug.logWithTag("Accessory", "饰品栏系统初始化完成（轮询模式）");
}

function checkAccessoryChanges(player) {
    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    if (!inventory?.container) return;

    const playerKey = player.id;
    const prevState = previousAccessoryState.get(playerKey) || {};

    const currentState = {};
    for (const slotIndex of ACCESSORY_CONFIG.slotIndexes) {
        const item = inventory.container.getItem(slotIndex);
        currentState[slotIndex] = item ? item.typeId : null;
    }

    for (const slotIndex of ACCESSORY_CONFIG.slotIndexes) {
        const prev = prevState[slotIndex];
        const curr = currentState[slotIndex];
        if (prev !== curr) {
            if (curr) {
                debug.logWithTag("Accessory", `${player.name} 在槽位 ${slotIndex} 放置了物品: ${curr}`);
            } else {
                debug.logWithTag("Accessory", `${player.name} 清空了槽位 ${slotIndex}`);
            }
        }
    }

    previousAccessoryState.set(playerKey, currentState);
}

export function getPlayerAccessoryItems(player) {
    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    if (!inventory?.container) return [];

    const items = [];

    for (const slotIndex of ACCESSORY_CONFIG.slotIndexes) {
        const item = inventory.container.getItem(slotIndex);
        if (item) {
            items.push({
                slotIndex,
                item
            });
        }
    }

    return items;
}

export function isAccessorySlot(slotIndex) {
    return ACCESSORY_CONFIG.slotIndexes.includes(slotIndex);
}
