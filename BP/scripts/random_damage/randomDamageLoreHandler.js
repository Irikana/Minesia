// randomDamageLoreHandler.js
// ===============================
// 随机伤害 Lore 处理器
// 为武器添加随机伤害和体力消耗 Lore 描述
// ===============================

import { LoreRegistry } from "../lore_system/index.js";
import { getWeaponConfig, formatDamageRange, LOCALE_SETTINGS } from "./config.js";
import { getWeaponStaminaCost, LOCALE_SETTINGS as STAMINA_LOCALE } from "../stamina/weaponStaminaConfig.js";

const LORE_COLOR = "§r§9";
const STAMINA_COLOR = "§r§c";

export function registerRandomDamageLoreHandler() {
    LoreRegistry.register("random_damage_lore", {
        priority: 10,
        description: "随机伤害 Lore 处理器",

        canHandle(itemStack, context) {
            const config = getWeaponConfig(itemStack.typeId);
            return config !== undefined && config.enabled;
        },

        hasLore(currentLore, itemStack, context) {
            const config = getWeaponConfig(itemStack.typeId);
            if (!config) return false;

            const locale = context.locale || LOCALE_SETTINGS.defaultLocale;
            const loreText = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
            const staminaLoreText = STAMINA_LOCALE.loreTexts[locale] || STAMINA_LOCALE.loreTexts[STAMINA_LOCALE.defaultLocale];
            const damageRange = formatDamageRange(config.minDamage, config.maxDamage);
            const staminaCost = getWeaponStaminaCost(itemStack.typeId);
            const expectedDamageLore = `${LORE_COLOR}+${damageRange} ${loreText.attackDamage}`;
            const expectedStaminaLore = `${STAMINA_COLOR}+${staminaCost} ${staminaLoreText.staminaCost}`;

            return currentLore.some(line => line === expectedDamageLore) &&
                currentLore.some(line => line === expectedStaminaLore);
        },

        generateLore(itemStack, context) {
            const config = getWeaponConfig(itemStack.typeId);
            if (!config) return null;

            const locale = context.locale || LOCALE_SETTINGS.defaultLocale;
            const loreText = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
            const staminaLoreText = STAMINA_LOCALE.loreTexts[locale] || STAMINA_LOCALE.loreTexts[STAMINA_LOCALE.defaultLocale];
            const damageRange = formatDamageRange(config.minDamage, config.maxDamage);
            const staminaCost = getWeaponStaminaCost(itemStack.typeId);

            return [
                "",
                `${LORE_COLOR}+${damageRange} ${loreText.attackDamage}`,
                `${STAMINA_COLOR}+${staminaCost} ${staminaLoreText.staminaCost}`
            ];
        }
    });

    console.log('[RandomDamageLore] 随机伤害 Lore 处理器已注册');
}
