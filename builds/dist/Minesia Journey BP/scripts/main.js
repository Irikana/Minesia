// main.js - Minesia Journey 主入口文件
import { world, system } from "@minecraft/server";
import * as setEffectMain from "./set_effect/setEffectMain.js";
import * as minesiaLevelMain from "./minesia_level/minesiaLevelMain.js";
import { MinesiaLevelEventSystem } from "./minesia_level/minesiaLevelEvent.js";
import { initializeBonusDamageSystem } from "./bonus_damage/bonusDamageMain.js";
import { initializeLoreHandler } from "./bonus_damage/loreHandler.js";
import { initializeLoreSystem } from "./lore_system/index.js";
import { registerCustomItemLoreHandler } from "./lore_system/customItemLoreHandler.js";
import { registerSetEffectLoreHandler } from "./lore_system/setEffectLoreHandler.js";
import { initializeDamageDisplaySystem } from "./damage_display/damageDisplayMain.js";

console.log('[Minesia] 系统启动中...');

let systemReady = false;
let errorCount = 0;

system.runTimeout(() => {
    try {
        console.log('[Minesia] 初始化核心系统...');

        MinesiaLevelEventSystem.initializeRewardsScoreboard();
        console.log('[Minesia] ✓ 等级事件系统就绪');

        initializeBonusDamageSystem();
        console.log('[Minesia] ✓ 附加伤害系统就绪');

        initializeLoreHandler();
        console.log('[Minesia] ✓ 附加伤害Lore处理器就绪');

        registerCustomItemLoreHandler();
        console.log('[Minesia] ✓ 自定义物品Lore处理器已注册');

        registerSetEffectLoreHandler();
        console.log('[Minesia] ✓ 套装效果Lore处理器已注册');

        initializeLoreSystem({ checkInterval: 100 });
        console.log('[Minesia] ✓ 通用Lore系统就绪');

        initializeDamageDisplaySystem();
        console.log('[Minesia] ✓ 伤害显示系统就绪');

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
