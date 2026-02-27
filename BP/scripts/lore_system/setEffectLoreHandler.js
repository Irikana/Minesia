// setEffectLoreHandler.js
// ===============================
// 套装效果 Lore 处理器
// 为套装物品显示套装效果信息
// ===============================

import { LoreRegistry } from "./index.js";
import { SET_EFFECT_CONFIG } from "./setEffectLoreConfig.js";

export function registerSetEffectLoreHandler() {
    LoreRegistry.register("set_effect_lore", {
        priority: 30,
        description: "套装效果 Lore 处理器",

        canHandle(itemStack, context) {
            return SET_EFFECT_CONFIG[itemStack.typeId] !== undefined;
        },

        hasLore(currentLore, itemStack, context) {
            const config = SET_EFFECT_CONFIG[itemStack.typeId];
            if (!config) return false;

            const locale = context.locale || "zh_CN";

            if (config.setName) {
                const setName = config.setName[locale] || config.setName.zh_CN;
                return currentLore.some(line => line.includes(setName));
            }

            if (config.condition) {
                const condition = config.condition[locale] || config.condition.zh_CN;
                return currentLore.some(line => line.includes(condition));
            }

            return false;
        },

        generateLore(itemStack, context) {
            const config = SET_EFFECT_CONFIG[itemStack.typeId];
            if (!config) return null;

            const locale = context.locale || "zh_CN";
            const loreLines = [""];

            if (config.setName) {
                const setName = config.setName[locale] || config.setName.zh_CN;
                loreLines.push(`§r§7${setName}`);
            }

            if (config.condition) {
                const condition = config.condition[locale] || config.condition.zh_CN;
                loreLines.push(`§r§7${condition}`);
            }

            for (const effect of config.effects) {
                const effectText = effect[locale] || effect.zh_CN;
                loreLines.push(`§r§9${effectText}`);
            }

            return loreLines;
        }
    });

    console.log('[SetEffectLore] 套装效果 Lore 处理器已注册');
}
