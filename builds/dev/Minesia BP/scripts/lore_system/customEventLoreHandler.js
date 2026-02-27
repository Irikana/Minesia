// customEventLoreHandler.js
// ===============================
// 自定义事件 Lore 处理器
// 为武器和物品显示自定义事件描述
// ===============================

import { LoreRegistry } from "./index.js";
import { CUSTOM_EVENT_CONFIG } from "./customEventLoreConfig.js";

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
            const loreLines = [""];

            for (const effect of config.effects) {
                const effectText = effect[locale] || effect.zh_CN;
                loreLines.push(`§r§9${effectText}`);
            }

            return loreLines;
        }
    });

    console.log('[CustomEventLore] 自定义事件 Lore 处理器已注册');
}
