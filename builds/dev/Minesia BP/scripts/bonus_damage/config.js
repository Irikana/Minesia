// config.js
// ===============================
// 附加伤害系统配置
// 所有武器的附加伤害配置集中管理
// ===============================

export const LOCALE_SETTINGS = {
    defaultLocale: "zh_CN",
    loreTexts: {
        zh_CN: {
            bonusDamage: "附加伤害"
        },
        en_US: {
            bonusDamage: "Bonus Damage"
        }
    }
};

export function getLoreText(locale = LOCALE_SETTINGS.defaultLocale) {
    const texts = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
    return texts;
}

export const BONUS_DAMAGE_WEAPONS = [
    {
        id: "minecraft:diamond_sword",
        minDamage: 1,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minecraft:netherite_sword",
        minDamage: 2,
        maxDamage: 5,
        enabled: true
    },
    {
        id: "minecraft:iron_sword",
        minDamage: 0.5,
        maxDamage: 2,
        enabled: true
    },
    {
        id: "minesia:toy_sword",
        minDamage: 0,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:steel_sword",
        minDamage: 0,
        maxDamage: 2,
        enabled: true
    },
    {
        id: "minesia:wooden_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:stone_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:iron_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:steel_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:golden_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:diamond_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:netherite_dagger",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:desert_walker",
        minDamage: 0,
        maxDamage: 3,
        enabled: true
    },
    {
        id: "minesia:tina",
        minDamage: 0,
        maxDamage: 5,
        enabled: true
    }
];

export function getWeaponConfig(itemId) {
    return BONUS_DAMAGE_WEAPONS.find(w => w.id === itemId && w.enabled);
}

export function calculateBonusDamage(minDamage, maxDamage) {
    const min = Math.min(minDamage, maxDamage);
    const max = Math.max(minDamage, maxDamage);
    const randomValue = Math.random() * (max - min) + min;
    return Math.round(randomValue * 10) / 10;
}

export function formatDamageRange(minDamage, maxDamage) {
    const formatNum = (n) => {
        return Number.isInteger(n) ? n.toString() : n.toFixed(1);
    };
    return `${formatNum(minDamage)}~${formatNum(maxDamage)}`;
}
