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
    showBonusDamage: false,
    showTotalDamage: true,
    debugMode: false
};

export const DISPLAY_TEXTS = {
    zh_CN: {
        damage: "伤害",
        baseDamage: "基础",
        bonusDamage: "附加",
        totalDamage: "总计"
    },
    en_US: {
        damage: "Damage",
        baseDamage: "Base",
        bonusDamage: "Bonus",
        totalDamage: "Total"
    }
};

export function getDisplayTexts(locale = "zh_CN") {
    return DISPLAY_TEXTS[locale] || DISPLAY_TEXTS.zh_CN;
}
