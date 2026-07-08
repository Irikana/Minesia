import { world, system, EquipmentSlot } from "@minecraft/server";
import { debug } from "../debug/debugManager.js";

let isProcessingProjectileImmunity = false;

export function initializeShieldOfBangeSystem() {
    world.beforeEvents.entityHurt.subscribe(handleBeforeProjectileHit);
    debug.logWithTag("ShieldOfBange", "班戈之盾系统初始化完成");
}

function handleBeforeProjectileHit(event) {
    try {
        if (isProcessingProjectileImmunity) return;

        const { hurtEntity, damageSource, damage } = event;

        if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") return;
        if (!damageSource || damageSource.cause !== "projectile") return;

        const equippable = hurtEntity.getComponent('minecraft:equippable');
        if (!equippable) return;

        const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
        if (!offhandItem || offhandItem.typeId !== "minesia:shield_of_bange") return;

        event.cancel = true;

        isProcessingProjectileImmunity = true;

        const player = hurtEntity;
        const blockedDamage = damage;

        system.run(() => {
            try {
                isProcessingProjectileImmunity = false;

                if (!player.isValid()) return;

                const health = player.getComponent('minecraft:health');
                if (health) {
                    const currentHealth = health.currentValue;
                    const maxHealth = health.effectiveMax ?? 20;
                    const healAmount = Math.min(blockedDamage, maxHealth - currentHealth);
                    if (healAmount > 0) {
                        try {
                            health.setCurrentValue(currentHealth + healAmount);
                        } catch (e1) {
                            try {
                                health.currentValue = currentHealth + healAmount;
                            } catch (e2) {
                                player.addEffect("minecraft:instant_health", 1, {
                                    amplifier: Math.max(0, Math.floor(healAmount / 2) - 1),
                                    showParticles: false
                                });
                            }
                        }
                    }
                }

                debug.logWithTag("ShieldOfBange", `${player.name} 的班戈之盾挡下了 ${blockedDamage} 点弹射物伤害`);
            } catch (e) {
                isProcessingProjectileImmunity = false;
                debug.logError("ShieldOfBange", `回血失败: ${e?.message ?? e}`);
            }
        });

    } catch (error) {
        isProcessingProjectileImmunity = false;
        debug.logError("ShieldOfBange", `弹射物免疫处理失败: ${error?.message ?? error}`);
    }
}
