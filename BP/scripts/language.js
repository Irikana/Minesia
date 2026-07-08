// language.js
// ===============================
// 共享语言管理模块
// 使用 DynamicProperty 替代计分板存储语言偏好
// ===============================

const LANGUAGE_PROPERTY = "minesia:language";
const DEFAULT_LOCALE = "zh_CN";

export function getPlayerLocale(player) {
    try {
        const lang = player.getDynamicProperty(LANGUAGE_PROPERTY);
        if (lang === "en_US" || lang === "zh_CN") return lang;
    } catch (_e) { }
    return DEFAULT_LOCALE;
}

export function setPlayerLocale(player, locale) {
    try {
        player.setDynamicProperty(LANGUAGE_PROPERTY, locale);
    } catch (_e) { }
}

export function hasPlayerSelectedLanguage(player) {
    try {
        const lang = player.getDynamicProperty(LANGUAGE_PROPERTY);
        return lang === "en_US" || lang === "zh_CN";
    } catch (_e) { }
    return false;
}
