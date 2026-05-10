import { world, EntityComponentTypes, PlayerInventoryType } from "@minecraft/server";
import { ACCESSORY_CONFIG } from "./config.js";
import { debug } from "../debug/debugManager.js";

export function initializeAccessorySystem() {
    if (world.afterEvents.playerInventoryItemChange) {
        world.afterEvents.playerInventoryItemChange.subscribe(
            handleInventoryChange,
            {
                allowedSlots: ACCESSORY_CONFIG.slotIndexes,
                inventoryType: PlayerInventoryType.Inventory
            }
        );
        debug.logWithTag("Accessory", "物品变化事件监听已注册");
    }
    
    debug.logWithTag("Accessory", "饰品栏系统初始化完成");
}

function handleInventoryChange(event) {
    const { player, slot, itemStack } = event;
    
    if (itemStack) {
        debug.logWithTag("Accessory", `${player.name} 在槽位 ${slot} 放置了物品: ${itemStack.typeId}`);
    } else {
        debug.logWithTag("Accessory", `${player.name} 清空了槽位 ${slot}`);
    }
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
