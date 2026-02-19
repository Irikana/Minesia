// set_effects.js
// ===============================
// 套装效果相关代码
// ===============================

// 导入所需模块
import * as rulesModule from "./rules.js";
import * as equipmentModule from "./equipment.js";
import * as actionsModule from "./actions.js";

/**
 * 处理玩家的套装效果
 * @param {Player} player - 玩家对象
 */
export function handleSetEffects(player) {
    // ===============================
    // 套装规则
    // ===============================
    const equipment = equipmentModule.collectEquipment(player);

    for (const set of rulesModule.SET_RULES) {
        let match = true;

        for (const slot in set.required) {
            if (equipment[slot] !== set.required[slot]) {
                match = false;
                break;
            }
        }

        if (match) {
            actionsModule.applyActions(player, set.actions);
        }
    }
}
