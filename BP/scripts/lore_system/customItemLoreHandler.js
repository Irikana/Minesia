// customItemLoreHandler.js
// ===============================
// 自定义物品 Lore 处理器
// 为自定义物品添加特殊的 Lore 描述
// ===============================

import { LoreRegistry } from "../lore_system/index.js";

const CUSTOM_ITEM_LORE = {
    "minesia:toy_sword": {
        lore: { zh_CN: "它真的能用来战斗吗？", en_US: "Can it really be used for battle?" }
    },
    "minesia:desert_walker": {
        lore: { zh_CN: "攻击目标时，有50%的概率使目标获得1秒的减速效果", en_US: "When attacking, 50% chance to apply Slowness I for 1 second" }
    },
    "minesia:tina": {
        lore: [
            { zh_CN: "登峰造极", en_US: "Reaching the Peak" },
            { zh_CN: "攻击时对周围5格内同类实体造成1~5点伤害", en_US: "Attacks deal 1~5 damage to same-type entities within 5 blocks" }
        ]
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
            const loreData = config.lore;

            if (Array.isArray(loreData)) {
                return loreData.map(line => {
                    const text = line[locale] || line.zh_CN;
                    return `§r§7${text}`;
                });
            }

            const loreText = loreData[locale] || loreData.zh_CN;
            return [`§r§7${loreText}`];
        }
    });

    console.log('[CustomItemLore] 自定义物品 Lore 处理器已注册');
}
