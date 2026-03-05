// extraLoreHandler.js
// ===============================
// 趣味性/剧情性 Lore 处理器
// 为物品显示额外的趣味描述
// ===============================

import { LoreRegistry } from "./index.js";
import { EXTRA_LORE_CONFIG } from "./extraLoreConfig.js";
import { debug } from "../debug/debugManager.js";

export function registerExtraLoreHandler() {
    LoreRegistry.register("extra_lore", {
        priority: 40,
        description: "趣味性 Lore 处理器",

        canHandle(itemStack, context) {
            return EXTRA_LORE_CONFIG[itemStack.typeId] !== undefined;
        },

        hasLore(currentLore, itemStack, context) {
            const config = EXTRA_LORE_CONFIG[itemStack.typeId];
            if (!config || !config.extraLore) return false;

            const locale = context.locale || "zh_CN";
            const extraText = config.extraLore[locale] || config.extraLore.zh_CN;

            return currentLore.some(line => line.includes(extraText));
        },

        generateLore(itemStack, context) {
            const config = EXTRA_LORE_CONFIG[itemStack.typeId];
            if (!config || !config.extraLore) return null;

            const locale = context.locale || "zh_CN";
            const extraText = config.extraLore[locale] || config.extraLore.zh_CN;

            const currentLore = context.currentLore || [];
            if (currentLore.some(line => line.includes(extraText))) {
                return null;
            }

            return ["", `§r§7${extraText}`];
        }
    });

    debug.logWithTag("ExtraLore", "趣味性 Lore 处理器已注册");
}
