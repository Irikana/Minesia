// customItemLoreHandler.js
// ===============================
// 自定义物�?Lore 处理�?// 为特定物品添加自定义描述
// ===============================

import { LoreRegistry } from "../lore_system/index.js";

const CUSTOM_ITEM_LORES = {
    "minesia:toy_sword": {
        zh_CN: "它真的能用来战斗吗？",
        en_US: "Can this really be used for combat?"
    },
    "minesia:steel_sword": {
        zh_CN: "看起来坚硬无�?,
        en_US: "Looks incredibly hard"
    }
};

export function registerCustomItemLoreHandler() {
    LoreRegistry.register("custom_item_lore", {
        priority: 5,
        description: "自定义物�?Lore 处理�?,

        canHandle(itemStack, context) {
            return CUSTOM_ITEM_LORES[itemStack.typeId] !== undefined;
        },

        hasLore(currentLore, itemStack, context) {
            const loreConfig = CUSTOM_ITEM_LORES[itemStack.typeId];
            if (!loreConfig) return false;

            const zhText = loreConfig.zh_CN;
            const enText = loreConfig.en_US;

            return currentLore.some(line =>
                line.includes(zhText) || line.includes(enText)
            );
        },

        generateLore(itemStack, context) {
            const loreConfig = CUSTOM_ITEM_LORES[itemStack.typeId];
            if (!loreConfig) return null;

            const locale = context.locale || "zh_CN";
            const loreText = loreConfig[locale] || loreConfig.zh_CN;

            return `§7${loreText}`;
        }
    });

    console.log('[CustomItemLore] Lore 处理器已注册');
}
