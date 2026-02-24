export { ITEM_EFFECTS, getItemEffectByTag, getAllItemEffects } from "./effectRegistry.js";
export { processItemEffects, registerItemEffect, unregisterItemEffect, getActiveItemEffects } from "./effectProcessor.js";
export { applyTinaEffect, TINA_EFFECT } from "./tinaEffect.js";
export { registerAoeDamage, getAoeDamageRecord, hasAoeDamageRecord, clearAoeDamageRecord, beginAoeEntity, endAoeEntity, isAoeEntity } from "./aoeDamageRegistry.js";
export { applyScytheEffect, isScytheItem, SCYTHE_ITEMS, SCYTHE_EFFECT } from "./scytheEffect.js";
