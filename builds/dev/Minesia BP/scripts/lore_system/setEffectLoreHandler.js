// setEffectLoreHandler.js
// ===============================
// 套装效果 Lore 处理器
// 为套装物品显示套装效果信息
// ===============================

import { LoreRegistry } from "../lore_system/index.js";

const SET_EQUIPMENT_CONFIG = {
    "minecraft:shield": {
        setName: { zh_CN: "盾牌套装", en_US: "Shield Set" },
        condition: { zh_CN: "装备盾牌时:", en_US: "When equipped with shield:" },
        effects: [
            { zh_CN: "+8 生命值", en_US: "+8 Health" }
        ]
    },
    "minecraft:diamond_helmet": {
        setName: { zh_CN: "钻石套装", en_US: "Diamond Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "抗性提升 II", en_US: "Resistance II" },
            { zh_CN: "+8 生命值", en_US: "+8 Health" }
        ]
    },
    "minecraft:diamond_chestplate": {
        setName: { zh_CN: "钻石套装", en_US: "Diamond Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "抗性提升 II", en_US: "Resistance II" },
            { zh_CN: "+8 生命值", en_US: "+8 Health" }
        ]
    },
    "minecraft:diamond_leggings": {
        setName: { zh_CN: "钻石套装", en_US: "Diamond Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "抗性提升 II", en_US: "Resistance II" },
            { zh_CN: "+8 生命值", en_US: "+8 Health" }
        ]
    },
    "minecraft:diamond_boots": {
        setName: { zh_CN: "钻石套装", en_US: "Diamond Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "抗性提升 II", en_US: "Resistance II" },
            { zh_CN: "+8 生命值", en_US: "+8 Health" }
        ]
    },
    "minesia:steel_helmet": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:steel_chestplate": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:steel_leggings": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:steel_boots": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:golden_phantom_membrane": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "缓降 I", en_US: "Slow Falling I" },
            { zh_CN: "+20 最大体力值", en_US: "+20 Max Stamina" },
            { zh_CN: "每秒消耗1点耐久", en_US: "Consumes 1 durability per second" }
        ]
    }
};

export function registerSetEffectLoreHandler() {
    LoreRegistry.register("set_effect_lore", {
        priority: 50,
        description: "套装效果 Lore 处理器",

        canHandle(itemStack, context) {
            return SET_EQUIPMENT_CONFIG[itemStack.typeId] !== undefined;
        },

        hasLore(currentLore, itemStack, context) {
            const config = SET_EQUIPMENT_CONFIG[itemStack.typeId];
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
            const config = SET_EQUIPMENT_CONFIG[itemStack.typeId];
            if (!config) return null;

            const locale = context.locale || "zh_CN";
            const loreLines = [];

            if (config.setName) {
                const setName = config.setName[locale] || config.setName.zh_CN;
                loreLines.push(`§r§9${setName}`);
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
