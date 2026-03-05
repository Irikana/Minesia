// vanillaWeaponLoreHandler.js
// ===============================
// 原版武器 Lore 处理器
// 为原版武器添加体力消耗 Lore 描述
// ===============================

import { LoreRegistry } from "../lore_system/index.js";
import { WEAPON_STAMINA_COST, LOCALE_SETTINGS } from "../stamina/weaponStaminaConfig.js";
import { debug } from "../debug/debugManager.js";

const STAMINA_COLOR = "§c";

export function registerVanillaWeaponLoreHandler() {
    LoreRegistry.register("vanilla_weapon_stamina", {
        priority: 15,
        description: "原版武器体力消耗 Lore 处理器",

        canHandle(itemStack, context) {
            return WEAPON_STAMINA_COST[itemStack.typeId] !== undefined &&
                   !itemStack.typeId.startsWith("minesia:");
        },

        hasLore(currentLore, itemStack, context) {
            const staminaCost = WEAPON_STAMINA_COST[itemStack.typeId];
            if (staminaCost === undefined) return false;

            const locale = context.locale || LOCALE_SETTINGS.defaultLocale;
            const loreText = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
            const expectedLore = `${STAMINA_COLOR}+${staminaCost} ${loreText.staminaCost}`;

            return currentLore.some(line => line === expectedLore);
        },

        generateLore(itemStack, context) {
            const staminaCost = WEAPON_STAMINA_COST[itemStack.typeId];
            if (staminaCost === undefined) return null;

            const locale = context.locale || LOCALE_SETTINGS.defaultLocale;
            const loreText = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];

            const currentLore = context.currentLore || [];
            const staminaLore = `${STAMINA_COLOR}+${staminaCost} ${loreText.staminaCost}`;

            if (currentLore.some(line => line === staminaLore)) {
                return null;
            }

            return ["", staminaLore];
        }
    });

    debug.logWithTag("VanillaWeaponLore", "原版武器 Lore 处理器已注册");
}
