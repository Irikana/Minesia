import { debug } from "../../debug/debugManager.js";

const weaponEffects = new Map();
const itemIdToEffectMap = new Map();
const tagToEffectMap = new Map();

export function registerWeaponEffect(effectConfig) {
    const { id, name, itemIds = [], tags = [], onAttack, priority = 0 } = effectConfig;
    
    if (!id || !name) {
        debug.logError("WeaponEffectRegistry", `注册失败: 缺少必要字段 id 或 name`);
        return false;
    }
    
    weaponEffects.set(id, {
        id,
        name,
        itemIds,
        tags,
        onAttack,
        priority
    });
    
    for (const itemId of itemIds) {
        if (!itemIdToEffectMap.has(itemId)) {
            itemIdToEffectMap.set(itemId, []);
        }
        itemIdToEffectMap.get(itemId).push(id);
    }
    
    for (const tag of tags) {
        if (!tagToEffectMap.has(tag)) {
            tagToEffectMap.set(tag, []);
        }
        tagToEffectMap.get(tag).push(id);
    }
    
    debug.logWithTag("WeaponEffectRegistry", `已注册武器效果: ${name} (${id})`);
    return true;
}

export function unregisterWeaponEffect(effectId) {
    const effect = weaponEffects.get(effectId);
    if (!effect) return false;
    
    for (const itemId of effect.itemIds) {
        const effects = itemIdToEffectMap.get(itemId);
        if (effects) {
            const index = effects.indexOf(effectId);
            if (index > -1) effects.splice(index, 1);
        }
    }
    
    for (const tag of effect.tags) {
        const effects = tagToEffectMap.get(tag);
        if (effects) {
            const index = effects.indexOf(effectId);
            if (index > -1) effects.splice(index, 1);
        }
    }
    
    weaponEffects.delete(effectId);
    return true;
}

export function getWeaponEffect(effectId) {
    return weaponEffects.get(effectId);
}

export function getEffectsByItemId(itemId) {
    const effectIds = itemIdToEffectMap.get(itemId) || [];
    return effectIds.map(id => weaponEffects.get(id)).filter(Boolean);
}

export function getEffectsByTag(tag) {
    const effectIds = tagToEffectMap.get(tag) || [];
    return effectIds.map(id => weaponEffects.get(id)).filter(Boolean);
}

export function getAllWeaponEffects() {
    return Array.from(weaponEffects.values());
}

export function processWeaponAttack(event) {
    const { attacker, target, mainhandItem, totalDamage, StaminaSystem } = event;
    
    if (!mainhandItem) return;
    
    const itemId = mainhandItem.typeId;
    const effects = getEffectsByItemId(itemId);
    
    effects.sort((a, b) => b.priority - a.priority);
    
    for (const effect of effects) {
        try {
            if (effect.onAttack) {
                effect.onAttack({
                    attacker,
                    target,
                    mainhandItem,
                    totalDamage,
                    StaminaSystem
                });
            }
        } catch (error) {
            debug.logError("WeaponEffectRegistry", `执行效果 ${effect.name} 失败: ${error?.message ?? error}`);
        }
    }
    
    for (const [tag, effectIds] of tagToEffectMap) {
        if (attacker.hasTag(tag)) {
            for (const effectId of effectIds) {
                const effect = weaponEffects.get(effectId);
                if (effect && effect.onAttack) {
                    try {
                        effect.onAttack({
                            attacker,
                            target,
                            mainhandItem,
                            totalDamage,
                            StaminaSystem,
                            isTagBased: true,
                            tag
                        });
                    } catch (error) {
                        debug.logError("WeaponEffectRegistry", `执行标签效果 ${effect.name} 失败: ${error?.message ?? error}`);
                    }
                }
            }
        }
    }
}

export function hasWeaponEffect(itemId) {
    return itemIdToEffectMap.has(itemId);
}

export function clearAllEffects() {
    weaponEffects.clear();
    itemIdToEffectMap.clear();
    tagToEffectMap.clear();
}
