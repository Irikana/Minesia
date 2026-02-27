// config.js
// ===============================
// 随机伤害系统配置
// 所有武器的随机伤害配置集中管理
// ===============================

export const LOCALE_SETTINGS = {
    defaultLocale: "zh_CN",
    loreTexts: {
        zh_CN: {
            attackDamage: "攻击伤害"
        },
        en_US: {
            attackDamage: "Attack Damage"
        }
    }
};

export function getLoreText(locale = LOCALE_SETTINGS.defaultLocale) {
    const texts = LOCALE_SETTINGS.loreTexts[locale] || LOCALE_SETTINGS.loreTexts[LOCALE_SETTINGS.defaultLocale];
    return texts;
}

export const RANDOM_DAMAGE_WEAPONS = [
    {
        id: "minesia:toy_sword",
        minDamage: 0,
        maxDamage: 8,
        enabled: true
    },
    {
        id: "minesia:steel_sword",
        minDamage: 7,
        maxDamage: 9,
        enabled: true
    },
    {
        id: "minesia:wooden_dagger",
        minDamage: 1,
        maxDamage: 4,
        enabled: true
    },
    {
        id: "minesia:copper_dagger",
        minDamage: 2,
        maxDamage: 4,
        enabled: true
    },
    {
        id: "minesia:stone_dagger",
        minDamage: 2,
        maxDamage: 5,
        enabled: true
    },
    {
        id: "minesia:iron_dagger",
        minDamage: 3,
        maxDamage: 6,
        enabled: true
    },
    {
        id: "minesia:steel_dagger",
        minDamage: 4,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:golden_dagger",
        minDamage: 1,
        maxDamage: 4,
        enabled: true
    },
    {
        id: "minesia:diamond_dagger",
        minDamage: 4,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:netherite_dagger",
        minDamage: 5,
        maxDamage: 8,
        enabled: true
    },
    {
        id: "minesia:desert_walker",
        minDamage: 4,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:desert_scythe",
        minDamage: 7,
        maxDamage: 10,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:tina",
        minDamage: 8,
        maxDamage: 13,
        enabled: true
    },
    {
        id: "minesia:wooden_scythe",
        minDamage: 5,
        maxDamage: 7,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:stone_scythe",
        minDamage: 6,
        maxDamage: 8.5,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:iron_scythe",
        minDamage: 7,
        maxDamage: 10,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:golden_scythe",
        minDamage: 5,
        maxDamage: 7,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:diamond_scythe",
        minDamage: 8,
        maxDamage: 11.5,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:netherite_scythe",
        minDamage: 8,
        maxDamage: 12,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:steel_scythe",
        minDamage: 8,
        maxDamage: 11.5,
        isScythe: true,
        enabled: true
    },
    {
        id: "minesia:flamie",
        minDamage: 4,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:the_forest",
        minDamage: 5,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:ender_pearl_sword",
        minDamage: 5,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:duty_ice",
        minDamage: 5,
        maxDamage: 8,
        enabled: true
    },
    {
        id: "minesia:pioneer",
        minDamage: 10,
        maxDamage: 15,
        enabled: true
    },
    {
        id: "minesia:selfish",
        minDamage: 5,
        maxDamage: 10,
        enabled: true
    },
    {
        id: "minesia:black_dagger",
        minDamage: 2,
        maxDamage: 7,
        enabled: true
    },
    {
        id: "minesia:white_golden_sword",
        minDamage: 7,
        maxDamage: 9,
        enabled: true
    }
];

export function getWeaponConfig(itemId) {
    return RANDOM_DAMAGE_WEAPONS.find(w => w.id === itemId && w.enabled);
}

export function calculateRandomDamage(minDamage, maxDamage) {
    const min = Math.min(minDamage, maxDamage);
    const max = Math.max(minDamage, maxDamage);

    if (min === max) {
        return min;
    }

    const steps = Math.round((max - min) * 10);
    const randomStep = Math.floor(Math.random() * (steps + 1));
    const damage = min + randomStep / 10;

    return Math.round(damage * 10) / 10;
}

export function formatDamageRange(minDamage, maxDamage) {
    const formatNum = (n) => {
        return Number.isInteger(n) ? n.toString() : n.toFixed(1);
    };
    return `${formatNum(minDamage)}~${formatNum(maxDamage)}`;
}
