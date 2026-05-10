import { world } from "@minecraft/server";

const PANEL_TEXTS = {
    zh_CN: {
        title: "属性面板",
        combat: "战斗属性",
        stamina: "体力属性",
        survival: "生存属性",
        level: "Minesia 等级",
        critRate: "暴击率",
        critDamage: "暴击伤害",
        currentStamina: "当前体力",
        maxStamina: "最大体力",
        maxStaminaBonus: "体力上限加成",
        consumptionMult: "消耗倍率",
        recoveryMult: "恢复倍率",
        health: "生命值",
        levelNum: "等级",
        totalExp: "总经验",
        progress: "进度",
        maxLevel: "已满级",
        close: "关闭"
    },
    en_US: {
        title: "Attribute Panel",
        combat: "Combat Attributes",
        stamina: "Stamina Attributes",
        survival: "Survival Attributes",
        level: "Minesia Level",
        critRate: "Critical Rate",
        critDamage: "Critical Damage",
        currentStamina: "Current Stamina",
        maxStamina: "Max Stamina",
        maxStaminaBonus: "Max Stamina Bonus",
        consumptionMult: "Consumption Rate",
        recoveryMult: "Recovery Rate",
        health: "Health",
        levelNum: "Level",
        totalExp: "Total Experience",
        progress: "Progress",
        maxLevel: "MAX LEVEL",
        close: "Close"
    }
};

export const ATTRIBUTE_PANEL_ITEM_ID = "minesia:attribute_panel";
export const ATTRIBUTE_PANEL_SLOT = 8;

export function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective("minesia_language");
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 0) return "en_US";
        }
    } catch (_e) { }
    return "zh_CN";
}

export function getPanelTexts(locale = "zh_CN") {
    return PANEL_TEXTS[locale] || PANEL_TEXTS.zh_CN;
}
