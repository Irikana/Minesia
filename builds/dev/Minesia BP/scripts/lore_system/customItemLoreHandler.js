// customItemLoreHandler.js
// ===============================
// 自定义物品 Lore 处理器
// 为自定义物品添加特殊的 Lore 描述
// ===============================

import { LoreRegistry } from "../lore_system/index.js";

const CUSTOM_ITEM_LORE = {
    "minesia:toy_sword": {
        lore: { zh_CN: "它真的能用来战斗吗？", en_US: "Can it really be used for battle?" }
    }
};

export function registerCustomItemLoreHandler() {
    LoreRegistry.register("custom_item_lore", {
        priority: 100,
        description: "自定义物品 Lore 处理器",

        canHandle(itemStack, context) {
            return CUSTOM_ITEM_LORE[itemStack.typeId] !== undefined;
        },

        hasLore(currentLore, itemStack, context) {
            const config = CUSTOM_ITEM_LORE[itemStack.typeId];
            if (!config) return false;

            const locale = context.locale || "zh_CN";
            const expectedLore = config.lore[locale] || config.lore.zh_CN;

            return currentLore.some(line => line.includes(expectedLore));
        },

        generateLore(itemStack, context) {
            const config = CUSTOM_ITEM_LORE[itemStack.typeId];
            if (!config) return null;

            const locale = context.locale || "zh_CN";
            const loreText = config.lore[locale] || config.lore.zh_CN;

            return [`§r§7${loreText}`];
        }
    });

    console.log('[CustomItemLore] 自定义物品 Lore 处理器已注册');
}
