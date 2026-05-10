import { registerWeaponEffect } from "./weaponEffectRegistry.js";
import { applyTinaEffect } from "./tinaEffect.js";
import { applyScytheEffect } from "./scytheEffect.js";
import { applyFlamieEffect } from "./flamieEffect.js";
import { applyTheForestEffect } from "./theForestEffect.js";
import { applyEnderPearlSwordEffect } from "./enderPearlSwordEffect.js";
import { applyDutyIceEffect } from "./dutyIceEffect.js";
import { applyPioneerEffect } from "./pioneerEffect.js";
import { applySelfishEffect } from "./selfishEffect.js";
import { applyBlackDaggerEffect } from "./blackDaggerEffect.js";
import { applyWhiteGoldenSwordEffect } from "./whiteGoldenSwordEffect.js";
import { applyDesertSnowEffect } from "./desertSnowEffect.js";

export function initializeWeaponEffects() {
    registerWeaponEffect({
        id: "desert_walker",
        name: "沙漠行者",
        tags: ["desert_walker_active"],
        priority: 10,
        onAttack: ({ target }) => {
            if (Math.random() < 0.5) {
                target.addEffect("minecraft:slowness", 20, {
                    amplifier: 0,
                    showParticles: true
                });
            }
        }
    });

    registerWeaponEffect({
        id: "desert_scythe",
        name: "沙漠镰刀",
        itemIds: ["minesia:desert_scythe"],
        priority: 10,
        onAttack: ({ target }) => {
            if (Math.random() < 0.25) {
                target.addEffect("minecraft:slowness", 100, {
                    amplifier: 0,
                    showParticles: true
                });
            }
        }
    });

    registerWeaponEffect({
        id: "tina",
        name: "Tina",
        tags: ["tina_active"],
        priority: 10,
        onAttack: ({ target, attacker }) => {
            applyTinaEffect(target, attacker);
        }
    });

    registerWeaponEffect({
        id: "scythe",
        name: "镰刀",
        itemIds: [
            "minesia:wooden_scythe",
            "minesia:stone_scythe", 
            "minesia:iron_scythe",
            "minesia:copper_scythe",
            "minesia:golden_scythe",
            "minesia:diamond_scythe",
            "minesia:netherite_scythe",
            "minesia:steel_scythe"
        ],
        priority: 20,
        onAttack: ({ target, attacker, totalDamage }) => {
            applyScytheEffect(target, attacker, totalDamage);
        }
    });

    registerWeaponEffect({
        id: "flamie_mainhand",
        name: "Flamie (主手)",
        itemIds: ["minesia:flamie"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyFlamieEffect(target, attacker, false);
        }
    });

    registerWeaponEffect({
        id: "flamie_offhand",
        name: "Flamie (副手)",
        tags: ["flamie_offhand_active"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyFlamieEffect(target, attacker, true);
        }
    });

    registerWeaponEffect({
        id: "the_forest",
        name: "森林之剑",
        itemIds: ["minesia:the_forest"],
        priority: 15,
        onAttack: ({ target, attacker, StaminaSystem }) => {
            applyTheForestEffect(target, attacker, StaminaSystem);
        }
    });

    registerWeaponEffect({
        id: "ender_pearl_sword_mainhand",
        name: "末影珍珠剑 (主手)",
        itemIds: ["minesia:ender_pearl_sword"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyEnderPearlSwordEffect(target, attacker, false);
        }
    });

    registerWeaponEffect({
        id: "ender_pearl_sword_offhand",
        name: "末影珍珠剑 (副手)",
        tags: ["ender_pearl_sword_offhand_active"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyEnderPearlSwordEffect(target, attacker, true);
        }
    });

    registerWeaponEffect({
        id: "duty_ice",
        name: "职责之冰",
        itemIds: ["minesia:duty_ice"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyDutyIceEffect(target, attacker);
        }
    });

    registerWeaponEffect({
        id: "pioneer",
        name: "先驱者",
        itemIds: ["minesia:pioneer"],
        priority: 15,
        onAttack: ({ target, attacker, StaminaSystem }) => {
            applyPioneerEffect(target, attacker, StaminaSystem);
        }
    });

    registerWeaponEffect({
        id: "selfish",
        name: "自私",
        itemIds: ["minesia:selfish"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applySelfishEffect(target, attacker);
        }
    });

    registerWeaponEffect({
        id: "black_dagger",
        name: "黑匕首",
        itemIds: ["minesia:black_dagger"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyBlackDaggerEffect(target, attacker);
        }
    });

    registerWeaponEffect({
        id: "white_golden_sword",
        name: "白金剑",
        itemIds: ["minesia:white_golden_sword"],
        priority: 15,
        onAttack: ({ attacker, mainhandItem }) => {
            applyWhiteGoldenSwordEffect(attacker, mainhandItem);
        }
    });

    registerWeaponEffect({
        id: "desert_snow",
        name: "沙漠暴雪",
        itemIds: ["minesia:desert_snow"],
        priority: 15,
        onAttack: ({ target, attacker }) => {
            applyDesertSnowEffect(target, attacker);
        }
    });
}
