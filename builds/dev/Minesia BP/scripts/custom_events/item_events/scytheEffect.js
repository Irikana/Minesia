import { system } from "@minecraft/server";
import { registerAoeDamage, beginAoeEntity, endAoeEntity } from "./aoeDamageRegistry.js";

const SCYTHE_ITEMS = [
    "minesia:wooden_scythe",
    "minesia:stone_scythe",
    "minesia:iron_scythe",
    "minesia:golden_scythe",
    "minesia:diamond_scythe",
    "minesia:netherite_scythe",
    "minesia:steel_scythe",
    "minesia:desert_scythe"
];

const SCYTHE_EFFECT = {
    name: "镰刀横扫",
    nameEn: "Scythe Sweep",
    width: 1,
    damageRatio: 0.5
};

export function isScytheItem(itemId) {
    return SCYTHE_ITEMS.includes(itemId);
}

export function applyScytheEffect(target, attacker, baseDamage) {
    try {
        const dimension = target.dimension;
        const attackerLoc = attacker.location;
        const targetLoc = target.location;

        const direction = {
            x: targetLoc.x - attackerLoc.x,
            z: targetLoc.z - attackerLoc.z
        };
        const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);

        if (distance <= 0) return { damagedEntities: [], totalAoeDamage: 0 };

        const dirX = direction.x / distance;
        const dirZ = direction.z / distance;

        const perpX = -dirZ;
        const perpZ = dirX;

        const nearbyEntities = dimension.getEntities({
            location: attackerLoc,
            maxDistance: distance + 3,
            excludeFamilies: ["player"],
            excludeTags: ["scythe_immune"]
        });

        const aoeDamage = Math.round(baseDamage * SCYTHE_EFFECT.damageRatio * 10) / 10;
        const damagedEntities = [];
        let totalAoeDamage = 0;

        for (const entity of nearbyEntities) {
            if (entity.id === target.id) continue;
            if (entity.id === attacker.id) continue;

            const entityLoc = entity.location;

            const toEntityX = entityLoc.x - attackerLoc.x;
            const toEntityZ = entityLoc.z - attackerLoc.z;

            const dotForward = toEntityX * dirX + toEntityZ * dirZ;
            if (dotForward < 0 || dotForward > distance + 2) continue;

            const dotPerp = Math.abs(toEntityX * perpX + toEntityZ * perpZ);
            if (dotPerp > SCYTHE_EFFECT.width) continue;

            applyDamageWithEffect(entity, aoeDamage, attacker, attackerLoc);

            damagedEntities.push({
                entity: entity,
                damage: aoeDamage
            });
            totalAoeDamage += aoeDamage;
        }

        if (damagedEntities.length > 0) {
            registerAoeDamage(attacker.id, {
                source: "scythe_sweep",
                sourceName: SCYTHE_EFFECT.name,
                sourceNameEn: SCYTHE_EFFECT.nameEn,
                totalDamage: totalAoeDamage,
                targetCount: damagedEntities.length
            });
        }

        return { damagedEntities, totalAoeDamage };
    } catch (error) {
        console.error('[Scythe] 应用镰刀效果时出错:', error?.message ?? error);
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

        try {
            const direction = {
                x: entity.location.x - sourceLocation.x,
                z: entity.location.z - sourceLocation.z
            };
            const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);

            if (distance > 0) {
                const knockbackStrength = 0.4;
                const dirX = direction.x / distance;
                const dirZ = direction.z / distance;
                entity.applyKnockback(
                    { x: dirX * knockbackStrength, y: 0, z: dirZ * knockbackStrength },
                    0.2
                );
            }
        } catch (knockbackError) {
            // 某些实体不支持击退，忽略此错误
        }

    } catch (error) {
        console.error('[Scythe] 应用伤害效果时出错:', error?.message ?? error);
    }

    system.runTimeout(() => {
        endAoeEntity(entityId);
    }, 1);
}

export { SCYTHE_ITEMS, SCYTHE_EFFECT };
