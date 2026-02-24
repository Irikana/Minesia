import { system } from "@minecraft/server";
import { registerAoeDamage, beginAoeEntity, endAoeEntity } from "./aoeDamageRegistry.js";

export const TINA_EFFECT = {
    name: "缇娜",
    nameEn: "Tina",
    description: "攻击时生成落叶粒子，对周围5格内同类实体造成1~5点伤害",
    itemId: "minesia:tina",
    tag: "tina_active",
    range: 5,
    minDamage: 1,
    maxDamage: 5,
    particleCount: 10
};

export function applyTinaEffect(target, attacker) {
    try {
        const dimension = target.dimension;
        const targetLocation = target.location;
        const targetType = target.typeId;

        for (let i = 0; i < TINA_EFFECT.particleCount; i++) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = Math.random() * 3;
            const offsetZ = (Math.random() - 0.5) * 10;
            dimension.spawnParticle("minecraft:falling_leaf_particle", {
                x: targetLocation.x + offsetX,
                y: targetLocation.y + offsetY,
                z: targetLocation.z + offsetZ
            });
        }

        const nearbyEntities = dimension.getEntities({
            location: targetLocation,
            maxDistance: TINA_EFFECT.range,
            excludeFamilies: ["player"],
            excludeTags: ["tina_immune"]
        });

        const damagedEntities = [];
        let totalAoeDamage = 0;

        for (const entity of nearbyEntities) {
            if (entity.id === target.id) continue;
            if (entity.typeId !== targetType) continue;

            const randomDamage = Math.floor(Math.random() * (TINA_EFFECT.maxDamage - TINA_EFFECT.minDamage + 1)) + TINA_EFFECT.minDamage;

            applyDamageWithEffect(entity, randomDamage, attacker, targetLocation);

            damagedEntities.push({
                entity: entity,
                damage: randomDamage
            });
            totalAoeDamage += randomDamage;
        }

        if (damagedEntities.length > 0) {
            registerAoeDamage(attacker.id, {
                source: TINA_EFFECT.itemId,
                sourceName: TINA_EFFECT.name,
                sourceNameEn: TINA_EFFECT.nameEn,
                totalDamage: totalAoeDamage,
                targetCount: damagedEntities.length
            });
        }

        console.log(`[Tina] ${attacker.name} 的缇娜触发了落叶效果，对 ${damagedEntities.length} 个同类实体造成伤害`);

        return { damagedEntities, totalAoeDamage };
    } catch (error) {
        console.error('[Tina] 应用缇娜效果时出错:', error?.message ?? error);
        return { damagedEntities: [], totalAoeDamage: 0 };
    }
}

function applyDamageWithEffect(entity, damage, attacker, sourceLocation) {
    const entityId = entity.id;
    beginAoeEntity(entityId);

    try {
        entity.applyDamage(damage, {
            cause: "entityAttack",
            damagingEntity: attacker
        });

        const direction = {
            x: entity.location.x - sourceLocation.x,
            z: entity.location.z - sourceLocation.z
        };
        const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);

        if (distance > 0) {
            const knockbackStrength = 0.5;
            const dirX = direction.x / distance;
            const dirZ = direction.z / distance;
            entity.applyKnockback(
                { x: dirX * knockbackStrength, y: 0, z: dirZ * knockbackStrength },
                0.3
            );
        }

    } catch (error) {
        console.error('[Tina] 应用伤害效果时出错:', error?.message ?? error);
    }
    system.runTimeout(() => {
        endAoeEntity(entityId);
    }, 1);
}
