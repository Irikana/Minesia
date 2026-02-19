// bonusDamageLoreHandler.js
// ===============================
// 附加伤害 Lore 处理器
// 为武器添加附加伤害 Lore 描述
// ===============================

import { LoreRegistry } from "../lore_system/index.js";
import { getWeaponConfig, formatDamageRange, LOCALE_SETTINGS } from "./config.js";

const LORE_COLOR = "§r§9";

export function registerBonusDamageLoreHandler() {
    LoreRegistry.register("bonus_damage_lore", {
        priority: 10,
        description: "附加伤害 Lore 处理器",

        canHandle(itemStack, context) {
            const config = getWeaponConfig(itemStack.typeId);
            return config !== undefined && config.enabled;
        },

        hasLore(currentLore, itemStack, context) {
            const config = getWeaponConfig(itemStack.typeId);
            if (!config) return false;

            const locale = context.locale || LOCALE_SETTINGS.defaultLocale;
            const loreText = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
            const damageRange = formatDamageRange(config.minDamage, config.maxDamage);
            const expectedLore = `${LORE_COLOR}+${damageRange} ${loreText.bonusDamage}`;

            return currentLore.some(line => line === expectedLore);
        },

        generateLore(itemStack, context) {
            const config = getWeaponConfig(itemStack.typeId);
            if (!config) return null;

            const locale = context.locale || LOCALE_SETTINGS.defaultLocale;
            const loreText = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
            const damageRange = formatDamageRange(config.minDamage, config.maxDamage);

            return [`${LORE_COLOR}+${damageRange} ${loreText.bonusDamage}`];
        }
    });

    console.log('[BonusDamageLore] 附加伤害 Lore 处理器已注册');
}
