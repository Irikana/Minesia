import { debug } from "../../debug/debugManager.js";

let isApplyingExtraDamage = false;

export function isCurrentlyApplyingProofOfStrengthDamage() {
    return isApplyingExtraDamage;
}

export const PROOF_OF_STRENGTH_EFFECT = {
    name: "Proof of Strength",
    description: "攻击时额外造成(当前体力/最大体力)*10点物理伤害",
    itemId: "minesia:proof_of_strength"
};

export function applyProofOfStrengthEffect(attacker, target, StaminaSystem) {
    try {
        if (isApplyingExtraDamage) return;
        if (!StaminaSystem) return;

        const currentStamina = StaminaSystem.getStamina(attacker);
        const maxStamina = StaminaSystem.getMaxStamina(attacker);

        if (maxStamina <= 0) return;

        const extraDamage = Math.floor((currentStamina / maxStamina) * 10);

        if (extraDamage <= 0) return;

        isApplyingExtraDamage = true;
        target.applyDamage(extraDamage, {
            cause: "entityAttack",
            damagingEntity: attacker
        });

        debug.logWithTag("ProofOfStrength", `${attacker.name} 造成额外 ${extraDamage} 点伤害 (体力: ${currentStamina}/${maxStamina})`);
    } catch (error) {
        debug.logError("ProofOfStrength", `应用效果时出错: ${error?.message ?? error}`);
    } finally {
        isApplyingExtraDamage = false;
    }
}

export function isProofOfStrengthItem(itemId) {
    return itemId === "minesia:proof_of_strength";
}
