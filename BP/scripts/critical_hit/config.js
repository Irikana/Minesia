export const CRITICAL_CONFIG = {
    enabled: true,
    defaultCriticalRate: 0,
    maxCriticalRate: 100,
    criticalDamageMultiplier: 1.5,
    particleEffect: "minecraft:critical_hit_emitter",
    soundEffect: "random.crit",
    weaponCriticalBonuses: {
        "minesia:black_dagger": 50,
        "minesia:frost_edge": 10,
    },
    equipmentCriticalBonuses: {
        "minesia:statue_totem": 25,
        "minesia:desert_pyramid_eye": 30,
        "minesia:shield_of_bange": 10
    },
    equipmentCriticalDamageBonuses: {
        "minesia:shield_of_bange": 25
    }
};

export function getCriticalRateConfig(itemId) {
    return CRITICAL_CONFIG.weaponCriticalBonuses[itemId] || 0;
}

export function getEquipmentCriticalBonus(itemId) {
    return CRITICAL_CONFIG.equipmentCriticalBonuses[itemId] || 0;
}

export function getEquipmentCriticalDamageBonus(itemId) {
    return CRITICAL_CONFIG.equipmentCriticalDamageBonuses[itemId] || 0;
}
