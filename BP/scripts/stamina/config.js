// ==========================================
// 体力值系统配置文件
// Stamina System Configuration
// ==========================================
// 
// 本配置文件控制体力值系统的所有参数
// 修改后需要重新加载附加包才能生效
//
// ==========================================

export const STAMINA_CONFIG = {
    // ------------------------------------------
    // 基础设置
    // ------------------------------------------

    // 是否启用体力值系统
    // 设为 false 可完全禁用体力值系统
    enabled: true,

    // 最大体力值
    // 玩家的体力值上限，可通过API动态增加
    maxStamina: 100,

    // 初始体力值
    // 玩家首次加入时的体力值
    initialStamina: 100,

    // ------------------------------------------
    // 显示设置
    // ------------------------------------------

    // 体力条显示持续时间（tick，20tick = 1秒）
    // 体力值变化后显示这么长时间
    displayDuration: 60,

    // ------------------------------------------
    // 恢复设置
    // ------------------------------------------

    // 恢复延迟（tick）
    // 停止消耗体力后，等待这么长时间才开始恢复
    recoveryDelay: 40,

    // 正常恢复速率（每tick恢复量）
    // 玩家静止不动时的恢复速度
    recoveryRate: 0.5,

    // ------------------------------------------
    // 疲劳设置
    // ------------------------------------------

    // 疲劳阈值
    // 体力值低于此值时视为疲劳状态
    // 疲劳状态下恢复速度更慢
    exhaustionThreshold: 10,

    // 疲劳状态恢复速率（每tick恢复量）
    // 疲劳状态下的恢复速度，通常比正常恢复慢
    exhaustionRecoveryRate: 0.3,

    // ------------------------------------------
    // 消耗设置
    // ------------------------------------------

    consumption: {
        // 奔跑消耗（每tick）
        // 玩家奔跑时每游戏刻消耗的体力值
        // 建议范围：0.05 - 0.3
        sprint: 0.15,

        // 跳跃消耗（每次跳跃）
        // 玩家跳跃一次消耗的体力值
        // 建议范围：1 - 5
        jump: 3,

        // 攻击消耗（每次攻击）
        // 玩家攻击一次消耗的体力值
        // 建议范围：1 - 5
        attack: 2,

        // 游泳消耗（每tick）
        // 玩家游泳时每游戏刻消耗的体力值
        // 建议范围：0.05 - 0.2
        swim: 0.1
    },

    // ------------------------------------------
    // 疲劳效果设置
    // ------------------------------------------

    effects: {
        // 缓慢效果
        // 体力耗尽时应用的缓慢效果参数
        slowness: {
            // 效果等级（0 = 缓慢I, 1 = 缓慢II, 以此类推）
            amplifier: 2,
            // 效果持续时间（tick）
            duration: 40
        },
        // 挖掘疲劳效果
        // 体力耗尽时应用的挖掘疲劳效果参数
        miningFatigue: {
            // 效果等级
            amplifier: 1,
            // 效果持续时间（tick）
            duration: 40
        }
    },

    // ------------------------------------------
    // 进度条显示设置
    // ------------------------------------------

    display: {
        // 进度条长度（字符数）
        barLength: 20,

        // 显示条件
        showWhen: {
            // 消耗体力时是否显示
            consuming: true,
            // 恢复体力时是否显示
            recovering: true,
            // 疲劳状态时是否显示
            exhausted: true
        }
    }
};

// ==========================================
// 文本本地化配置
// ==========================================

export const STAMINA_TEXTS = {
    zh_CN: {
        stamina: "体力",
        exhausted: "§l§c体力耗尽"
    },
    en_US: {
        stamina: "Stamina",
        exhausted: "§l§cExhausted"
    }
};

// 获取本地化文本
// @param locale - 语言代码，默认为中文
// @returns 对应语言的文本对象
export function getStaminaTexts(locale = "zh_CN") {
    return STAMINA_TEXTS[locale] || STAMINA_TEXTS.zh_CN;
}

// ==========================================
// API 使用示例
// ==========================================
//
// 1. 导入体力值系统：
//    import { StaminaSystem } from "./stamina/staminaMain.js";
//
// 2. 基础操作：
//    StaminaSystem.getStamina(player)           // 获取当前体力值
//    StaminaSystem.getMaxStamina(player)        // 获取最大体力值
//    StaminaSystem.getStaminaPercentage(player) // 获取体力百分比 (0-1)
//    StaminaSystem.isExhausted(player)          // 检查是否疲劳
//    StaminaSystem.isRecovering(player)         // 检查是否正在恢复
//
// 3. 修改体力值：
//    StaminaSystem.setStamina(player, 50)       // 设置体力值为50
//    StaminaSystem.consumeStamina(player, 10)   // 消耗10点体力
//    StaminaSystem.recoverStamina(player, 20)   // 恢复20点体力
//    StaminaSystem.fullRestore(player)          // 完全恢复体力
//    StaminaSystem.forceExhaust(player)         // 强制耗尽体力
//
// 4. 修改倍率：
//    StaminaSystem.setConsumptionMultiplier(player, 0.5)  // 消耗减半
//    StaminaSystem.setRecoveryMultiplier(player, 2.0)     // 恢复加倍
//    StaminaSystem.setMaxStaminaBonus(player, 50)         // 最大体力+50
//
// 5. 使用修饰符系统（推荐用于套装效果等）：
//    StaminaSystem.addConsumptionModifier(player, "套装ID", 0.8)  // 添加消耗修饰符
//    StaminaSystem.removeConsumptionModifier(player, "套装ID")    // 移除消耗修饰符
//    StaminaSystem.addRecoveryModifier(player, "套装ID", 1.5)     // 添加恢复修饰符
//    StaminaSystem.removeRecoveryModifier(player, "套装ID")       // 移除恢复修饰符
//
// ==========================================
// ScriptEvent 命令
// ==========================================
//
// 玩家可使用以下命令与体力值系统交互：
//
// /scriptevent minesia:stamina_info
//   - 显示当前体力值信息
//
// /scriptevent minesia:stamina_restore
//   - 完全恢复体力值
//
// /scriptevent minesia:stamina_exhaust
//   - 强制耗尽体力值
//
// /scriptevent minesia:stamina_set <数值>
//   - 设置体力值为指定值
//   - 例如：/scriptevent minesia:stamina_set 50
//
// /scriptevent minesia:stamina_consume <数值>
//   - 消耗指定体力值
//   - 例如：/scriptevent minesia:stamina_consume 10
//
// /scriptevent minesia:stamina_recover <数值>
//   - 恢复指定体力值
//   - 例如：/scriptevent minesia:stamina_recover 20
//
// /scriptevent minesia:stamina_max_bonus <数值>
//   - 设置最大体力值加成
//   - 例如：/scriptevent minesia:stamina_max_bonus 50
//
// /scriptevent minesia:stamina_consumption_mult <数值>
//   - 设置消耗倍率
//   - 例如：/scriptevent minesia:stamina_consumption_mult 0.5
//
// /scriptevent minesia:stamina_recovery_mult <数值>
//   - 设置恢复倍率
//   - 例如：/scriptevent minesia:stamina_recovery_mult 2.0
//
// ==========================================
