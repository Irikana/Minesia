// equipment.js
import { EquipmentSlot } from "@minecraft/server";
import { debug } from "../debug/debugManager.js";

// 统一的槽位映射
export const SLOT_MAP = {
  mainhand: EquipmentSlot.Mainhand,
  offhand: EquipmentSlot.Offhand,
  head: EquipmentSlot.Head,
  chest: EquipmentSlot.Chest,
  legs: EquipmentSlot.Legs,
  feet: EquipmentSlot.Feet
};

// 读取玩家当前装备状态
export function collectEquipment(player) {
  try {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) {
      debug.logWarning("Equipment", `玩家 ${player.name} 缺少 equippable 组件`);
      return {};
    }

    const result = {};

    for (const key in SLOT_MAP) {
      try {
        const item = equippable.getEquipment(SLOT_MAP[key]);
        if (item) {
          result[key] = item.typeId;
        }
      } catch (slotError) {
        debug.logWarning("Equipment", `获取槽位 ${key} 装备时出错: ${slotError}`);
      }
    }

    return result;
  } catch (error) {
    debug.logError("Equipment", `收集装备信息时出错: ${error}`);
    return {};
  }
}

// 获取指定槽位的装备
export function getEquipmentInSlot(player, slotName) {
  try {
    const slot = SLOT_MAP[slotName];
    if (!slot) {
      debug.logWarning("Equipment", `无效的槽位名称: ${slotName}`);
      return null;
    }
    
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return null;
    
    return equippable.getEquipment(slot);
  } catch (error) {
    debug.logError("Equipment", `获取槽位 ${slotName} 装备时出错: ${error}`);
    return null;
  }
}

// 检查玩家是否装备了特定物品
export function hasEquippedItem(player, itemId, slotNames = null) {
  try {
    const equipment = collectEquipment(player);
    
    if (slotNames) {
      // 检查指定槽位
      for (const slot of slotNames) {
        if (equipment[slot] === itemId) {
          return true;
        }
      }
    } else {
      // 检查所有槽位
      for (const slot in equipment) {
        if (equipment[slot] === itemId) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    debug.logError("Equipment", `检查装备物品时出错: ${error}`);
    return false;
  }
}