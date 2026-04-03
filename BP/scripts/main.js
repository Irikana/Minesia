// main.js - Minesia 主入口文件
import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { initializeDebugSystem, debug } from "./debug/debugManager.js";
import * as setEffectMain from "./set_effect/setEffectMain.js";
import * as minesiaLevelMain from "./minesia_level/minesiaLevelMain.js";
import { MinesiaLevelEventSystem } from "./minesia_level/minesiaLevelEvent.js";
import { initializeRandomDamageSystem } from "./random_damage/randomDamageMain.js";
import { initializeDamageDisplaySystem } from "./damage_display/damageDisplayMain.js";
import { initializeStaminaSystem, updateStaminaSystem } from "./stamina/staminaMain.js";
import { processStaminaSetEffects } from "./stamina/staminaSetEffectAdapter.js";
import { processItemEffects } from "./custom_events/index.js";
import { initHealthBoostManager } from "./set_effect/healthBoostManager.js";
import { initializeWeaponEffects } from "./custom_events/item_events/weaponEffectConfig.js";
import { initializeCriticalHitSystem } from "./critical_hit/criticalHitMain.js";
import { initializeDynamicLightSystem, updateDynamicLightSystem } from "./dynamic_light/index.js";
import { initializeAttributePanelSystem } from "./attribute_panel/index.js";

const LANGUAGE_OBJECTIVE = 'minesia_language';

function hasPlayerSelectedLanguage(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard.getObjective(LANGUAGE_OBJECTIVE);
        if (!langObj) return false;
        const score = langObj.getScore(player);
        return score === 0 || score === 1;
    } catch (_e) {
        return false;
    }
}

function setPlayerLanguage(player, language) {
    try {
        const scoreboard = world.scoreboard;
        let langObj = scoreboard.getObjective(LANGUAGE_OBJECTIVE);
        if (!langObj) {
            langObj = scoreboard.addObjective(LANGUAGE_OBJECTIVE, 'Minesia Language');
        }
        const score = language === 'en_US' ? 0 : 1;
        langObj.setScore(player, score);
    } catch (_e) { }
}

function showLanguageSelectionForm(player) {
    const form = new ActionFormData();
    form.title('§eMinesia §r- Language / 语言');
    form.body('Please select your language / 请选择您的语言:');
    form.button('English');
    form.button('中文');
    form.show(player).then((response) => {
        if (response.canceled) {
            system.runTimeout(() => showLanguageSelectionForm(player), 60);
            return;
        }
        const selectedLang = response.selection === 0 ? 'en_US' : 'zh_CN';
        setPlayerLanguage(player, selectedLang);
        if (selectedLang === 'en_US') {
            player.sendMessage('§aLanguage set to English.');
        } else {
            player.sendMessage('§a语言已设置为中文。');
        }
    }).catch(() => {
        system.runTimeout(() => showLanguageSelectionForm(player), 60);
    });
}

function sendWelcomeMessage(player) {
    player.sendMessage('§c本模组正在前期开发中 / This mod is in early development');
    player.sendMessage('§a请使用命令 /scoreboard players set @s minesia_language 0 切换英文，1 切换中文');
    player.sendMessage('§aUse command /scoreboard players set @s minesia_language 0 for English, 1 for Chinese');
}

function initializeWelcomeSystem() {
    world.afterEvents.playerSpawn.subscribe((event) => {
        const { player, initialSpawn } = event;
        if (!player || !initialSpawn) return;
        system.runTimeout(() => {
            sendWelcomeMessage(player);
            if (!hasPlayerSelectedLanguage(player)) {
                showLanguageSelectionForm(player);
            }
        }, 40);
    });

    if (world.afterEvents.scriptEventReceive) {
        world.afterEvents.scriptEventReceive.subscribe((event) => {
            const { id, sourceEntity } = event;
            if (id === 'minesia:language' && sourceEntity && sourceEntity.typeId === 'minecraft:player') {
                showLanguageSelectionForm(sourceEntity);
            }
        });
    } else {
        debug.logWarning("Minesia", "scriptEventReceive 不可用，语言选择指令功能已禁用");
    }
}

let systemReady = false;
let errorCount = 0;

system.runTimeout(() => {
    try {
        initializeDebugSystem();
        debug.logWithTag("Minesia", "系统启动中...");
        debug.logWithTag("Minesia", "初始化核心系统...");
        debug.logWithTag("Minesia", "✓ 调试系统就绪");

        initializeWelcomeSystem();
        debug.logWithTag("Minesia", "✓ 欢迎消息系统就绪");

        MinesiaLevelEventSystem.initializeRewardsScoreboard();
        debug.logWithTag("Minesia", "✓ 等级事件系统就绪");

        initializeRandomDamageSystem();
        debug.logWithTag("Minesia", "✓ 随机伤害系统就绪");

        initializeWeaponEffects();
        debug.logWithTag("Minesia", "✓ 武器效果注册表就绪");

        initializeDamageDisplaySystem();
        debug.logWithTag("Minesia", "✓ 伤害显示系统就绪");

        initializeStaminaSystem();
        debug.logWithTag("Minesia", "✓ 体力值系统就绪");

        initHealthBoostManager();
        debug.logWithTag("Minesia", "✓ 生命提升管理器就绪");

        setEffectMain.initializeSetEffectSystem();
        debug.logWithTag("Minesia", "✓ 套装效果系统就绪");

        initializeCriticalHitSystem();
        debug.logWithTag("Minesia", "✓ 暴击系统就绪");

        initializeDynamicLightSystem();
        debug.logWithTag("Minesia", "✓ 动态光源系统就绪");

        initializeAttributePanelSystem();
        debug.logWithTag("Minesia", "✓ 属性面板系统就绪");

        systemReady = true;
        debug.logWithTag("Minesia", "🎉 核心系统初始化完成!");

    } catch (error) {
        errorCount++;
        debug.logError("Minesia", `初始化失败: ${error.message}`);
    }
}, 20);

system.runInterval(() => {
    if (!systemReady) return;

    try {
        setEffectMain.handleAllPlayersSetEffects();

        minesiaLevelMain.updateMinesiaSystem();

        updateStaminaSystem();

        const players = world.getPlayers();
        for (const player of players) {
            processStaminaSetEffects(player);
            processItemEffects(player);
        }

        updateDynamicLightSystem();

    } catch (error) {
        errorCount++;
        debug.logError("Minesia", `运行时错误: ${error.message}`);
    }
}, 1);

system.runTimeout(() => {
    try {
        minesiaLevelMain.initializeScoreboard();
        debug.logWithTag("Minesia", "✓ 计分板系统就绪");
    } catch (error) {
        debug.logError("Minesia", `计分板初始化失败: ${error.message}`);
    }
}, 30);
