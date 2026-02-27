// weaponStaminaConfig.js
// ===============================
// 武器体力消耗配置
// 所有武器的体力消耗配置集中管理
// ===============================

export const WEAPON_STAMINA_COST = {
    "minecraft:wooden_sword": 2,
    "minecraft:stone_sword": 2,
    "minecraft:iron_sword": 2,
    "minecraft:golden_sword": 2,
    "minecraft:diamond_sword": 2,
    "minecraft:netherite_sword": 2,
    "minecraft:wooden_axe": 3,
    "minecraft:stone_axe": 3,
    "minecraft:iron_axe": 3,
    "minecraft:golden_axe": 3,
    "minecraft:diamond_axe": 3,
    "minecraft:netherite_axe": 3,
    "minecraft:trident": 2,
    "minecraft:mace": 3,
    "minesia:toy_sword": 2,
    "minesia:steel_sword": 2,
    "minesia:wooden_dagger": 1,
    "minesia:copper_dagger": 1,
    "minesia:stone_dagger": 1,
    "minesia:iron_dagger": 1,
    "minesia:steel_dagger": 1,
    "minesia:golden_dagger": 1,
    "minesia:diamond_dagger": 1,
    "minesia:netherite_dagger": 1,
    "minesia:desert_walker": 2,
    "minesia:desert_scythe": 4,
    "minesia:tina": 3,
    "minesia:wooden_scythe": 4,
    "minesia:stone_scythe": 4,
    "minesia:iron_scythe": 4,
    "minesia:golden_scythe": 4,
    "minesia:diamond_scythe": 4,
    "minesia:netherite_scythe": 4,
    "minesia:steel_scythe": 4,
    "minesia:flamie": 4,
    "minesia:the_forest": 1,
    "minesia:ender_pearl_sword": 4,
    "minesia:duty_ice": 3,
    "minesia:pioneer": 5,
    "minesia:selfish": 3,
    "minesia:black_dagger": 2,
    "minesia:white_golden_sword": 2
};

export function getWeaponStaminaCost(itemId) {
    return WEAPON_STAMINA_COST[itemId] || null;
}

export function isStaminaWeapon(itemId) {
    return WEAPON_STAMINA_COST[itemId] !== undefined;
}

export const LOCALE_SETTINGS = {
    defaultLocale: "zh_CN",
    loreTexts: {
        zh_CN: {
            staminaCost: "体力消耗"
        },
        en_US: {
            staminaCost: "Stamina Cost"
        }
    }
};

export function getLoreText(locale = LOCALE_SETTINGS.defaultLocale) {
    return LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
}
