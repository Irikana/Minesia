// customEventLoreHandler.js
// ===============================
// 自定义事件 Lore 处理器
// 为武器和物品显示自定义事件描述
// ===============================

import { LoreRegistry } from "./index.js";
import { CUSTOM_EVENT_CONFIG } from "./customEventLoreConfig.js";
import { debug } from "../debug/debugManager.js";

export function registerCustomEventLoreHandler() {
    LoreRegistry.register("custom_event_lore", {
        priority: 20,
        description: "自定义事件 Lore 处理器",

        canHandle(itemStack, context) {
            return CUSTOM_EVENT_CONFIG[itemStack.typeId] !== undefined;
        },

        hasLore(currentLore, itemStack, context) {
            const config = CUSTOM_EVENT_CONFIG[itemStack.typeId];
            if (!config || !config.effects || config.effects.length === 0) return false;

            const locale = context.locale || "zh_CN";
            const firstEffect = config.effects[0];
            const effectText = firstEffect[locale] || firstEffect.zh_CN;

            return currentLore.some(line => line.includes(effectText));
        },

        generateLore(itemStack, context) {
            const config = CUSTOM_EVENT_CONFIG[itemStack.typeId];
            if (!config) return null;

            const locale = context.locale || "zh_CN";
            const currentLore = context.currentLore || [];
            const colorCode = config.color || "9";

            const loreLines = [""];

            for (const effect of config.effects) {
                const effectText = effect[locale] || effect.zh_CN;
                if (!currentLore.some(line => line.includes(effectText))) {
                    loreLines.push(`§r§${colorCode}${effectText}`);
                }
            }

            if (loreLines.length === 1) return null;

            return loreLines;
        }
    });

    debug.logWithTag("CustomEventLore", "自定义事件 Lore 处理器已注册");
}
