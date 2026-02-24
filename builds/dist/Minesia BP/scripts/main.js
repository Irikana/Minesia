// main.js - Minesia 主入口文件
import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import * as setEffectMain from "./set_effect/setEffectMain.js";
import * as minesiaLevelMain from "./minesia_level/minesiaLevelMain.js";
import { MinesiaLevelEventSystem } from "./minesia_level/minesiaLevelEvent.js";
import { initializeRandomDamageSystem } from "./random_damage/randomDamageMain.js";
import { initializeLoreHandler } from "./random_damage/loreHandler.js";
import { registerRandomDamageLoreHandler } from "./random_damage/randomDamageLoreHandler.js";
import { registerVanillaWeaponLoreHandler } from "./random_damage/vanillaWeaponLoreHandler.js";
import { initializeLoreSystem } from "./lore_system/index.js";
import { registerCustomItemLoreHandler } from "./lore_system/customItemLoreHandler.js";
import { registerSetEffectLoreHandler } from "./lore_system/setEffectLoreHandler.js";
import { initializeDamageDisplaySystem } from "./damage_display/damageDisplayMain.js";
import { initializeStaminaSystem, updateStaminaSystem } from "./stamina/staminaMain.js";
import { processStaminaSetEffects } from "./stamina/staminaSetEffectAdapter.js";
import { processItemEffects } from "./custom_events/index.js";

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
        console.log('[Minesia] scriptEventReceive 不可用，语言选择指令功能已禁用');
    }
}

console.log('[Minesia] 系统启动中...');

let systemReady = false;
let errorCount = 0;

system.runTimeout(() => {
    try {
        console.log('[Minesia] 初始化核心系统...');

        initializeWelcomeSystem();
        console.log('[Minesia] ✓ 欢迎消息系统就绪');

        MinesiaLevelEventSystem.initializeRewardsScoreboard();
        console.log('[Minesia] ✓ 等级事件系统就绪');

        initializeRandomDamageSystem();
        console.log('[Minesia] ✓ 随机伤害系统就绪');

        initializeLoreHandler();
        console.log('[Minesia] ✓ 随机伤害Lore处理器就绪');

        registerRandomDamageLoreHandler();
        console.log('[Minesia] ✓ 随机伤害Lore处理器已注册');

        registerVanillaWeaponLoreHandler();
        console.log('[Minesia] ✓ 原版武器Lore处理器已注册');

        registerCustomItemLoreHandler();
        console.log('[Minesia] ✓ 自定义物品Lore处理器已注册');

        registerSetEffectLoreHandler();
        console.log('[Minesia] ✓ 套装效果Lore处理器已注册');

        initializeLoreSystem({ checkInterval: 100 });
        console.log('[Minesia] ✓ 通用Lore系统就绪');

        initializeDamageDisplaySystem();
        console.log('[Minesia] ✓ 伤害显示系统就绪');

        initializeStaminaSystem();
        console.log('[Minesia] ✓ 体力值系统就绪');

        systemReady = true;
        console.log('[Minesia] 🎉 核心系统初始化完成!');

    } catch (error) {
        errorCount++;
        console.error('[Minesia] 初始化失败:', error.message);
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

    } catch (error) {
        errorCount++;
        console.error('[Minesia] 运行时错误:', error.message);
    }
}, 1);

system.runTimeout(() => {
    try {
        minesiaLevelMain.initializeScoreboard();
        console.log('[Minesia] ✓ 计分板系统就绪');
    } catch (error) {
        console.error('[Minesia] 计分板初始化失败:', error.message);
    }
}, 30);

console.log('[Minesia] 主系统已启动');
