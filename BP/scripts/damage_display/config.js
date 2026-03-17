// config.js
// ===============================
// 伤害显示系统配置
// ===============================

export const DAMAGE_DISPLAY_CONFIG = {
    enabled: true,
    displayDuration: 40,
    comboTimeWindow: 40,
    textColor: "§f",
    showBaseDamage: false,
    showRandomDamage: false,
    showTotalDamage: true,
    debugMode: false
};

export const DISPLAY_TEXTS = {
    zh_CN: {
        damage: "伤害",
        baseDamage: "基础",
        randomDamage: "随机",
        totalDamage: "总计",
        critical: "暴击!",
        combo: "连击"
    },
    en_US: {
        damage: "Damage",
        baseDamage: "Base",
        randomDamage: "Random",
        totalDamage: "Total",
        critical: "Critical!",
        combo: "Combo"
    }
};

export function getDisplayTexts(locale = "zh_CN") {
    return DISPLAY_TEXTS[locale] || DISPLAY_TEXTS.zh_CN;
}
