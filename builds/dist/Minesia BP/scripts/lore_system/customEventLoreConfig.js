// customEventLoreConfig.js
// ===============================
// 自定义事件 Lore 配置
// 管理武器和物品的自定义事件描述
// ===============================

export const CUSTOM_EVENT_CONFIG = {
    "minesia:toy_sword": {
        effects: [
            { zh_CN: "它真的能用来战斗吗？", en_US: "Can it really be used for battle?" }
        ]
    },
    "minesia:desert_walker": {
        effects: [
            { zh_CN: "攻击时50%概率使目标减速1秒", en_US: "50% chance to slow target for 1 second on attack" }
        ]
    },
    "minesia:desert_scythe": {
        effects: [
            { zh_CN: "攻击时25%概率使目标减速5秒", en_US: "25% chance to slow target for 5 seconds on attack" }
        ]
    },
    "minesia:tina": {
        effects: [
            { zh_CN: "攻击时对周围5格内同类实体造成1~5点伤害", en_US: "Deals 1~5 damage to same-type entities within 5 blocks on attack" }
        ]
    },
    "minesia:flamie": {
        effects: [
            { zh_CN: "攻击时使目标着火5秒", en_US: "Sets target on fire for 5 seconds on attack" }
        ]
    },
    "minesia:the_forest": {
        effects: [
            { zh_CN: "攻击时使目标中毒3秒", en_US: "Poisons target for 3 seconds on attack" },
            { zh_CN: "每次攻击恢复2点体力值", en_US: "Recovers 2 stamina on each attack" }
        ]
    },
    "minesia:ender_pearl_sword": {
        effects: [
            { zh_CN: "攻击时传送目标", en_US: "Teleports target on attack" }
        ]
    },
    "minesia:duty_ice": {
        effects: [
            { zh_CN: "攻击时25%概率使目标寒冷10秒", en_US: "25% chance to chill target for 10 seconds on attack" }
        ]
    },
    "minesia:pioneer": {
        effects: [
            { zh_CN: "攻击时25%概率使目标缓慢III持续5秒", en_US: "25% chance to slow target III for 5 seconds on attack" },
            { zh_CN: "触发时额外消耗5点体力值", en_US: "Consumes 5 extra stamina when triggered" }
        ]
    },
    "minesia:selfish": {
        effects: [
            { zh_CN: "攻击时25%概率使目标虚弱5秒", en_US: "25% chance to weaken target for 5 seconds on attack" }
        ]
    },
    "minesia:black_dagger": {
        effects: [
            { zh_CN: "攻击时25%概率使目标凋谢2秒", en_US: "25% chance to wither target for 2 seconds on attack" }
        ]
    },
    "minesia:white_golden_sword": {
        effects: [
            { zh_CN: "攻击时额外随机消耗0到2点耐久度", en_US: "Randomly consumes 0-2 durability on each attack" }
        ]
    }
};
