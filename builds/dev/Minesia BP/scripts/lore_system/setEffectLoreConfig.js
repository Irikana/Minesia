// setEffectLoreConfig.js
// ===============================
// 套装效果 Lore 配置
// 管理套装物品的效果描述
// ===============================

export const SET_EFFECT_CONFIG = {
    "minesia:steel_helmet": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:steel_chestplate": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:steel_leggings": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:steel_boots": {
        setName: { zh_CN: "钢铁套装", en_US: "Steel Set" },
        condition: { zh_CN: "装备全套时:", en_US: "When full set equipped:" },
        effects: [
            { zh_CN: "+4 生命值", en_US: "+4 Health" }
        ]
    },
    "minesia:golden_phantom_membrane": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "缓降 I", en_US: "Slow Falling I" },
            { zh_CN: "+20 最大体力值", en_US: "+20 Max Stamina" },
            { zh_CN: "每秒消耗1点耐久", en_US: "Consumes 1 durability per second" }
        ]
    },
    "minesia:life_stone": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "最大生命值增加50%", en_US: "Increases max health by 50%" }
        ]
    },
    "minesia:spider_leg": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "每5刻恢复1点体力值", en_US: "Recovers 1 stamina every 5 ticks" }
        ]
    },
    "minesia:statue_totem": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "增加25%最大生命值和80%体力值", en_US: "Increases max health by 25% and stamina by 80%" },
            { zh_CN: "每半秒恢复1点体力值", en_US: "Recovers 1 stamina every half second" },
            { zh_CN: "生命值低于4点时消耗物品获得增益", en_US: "Consumes item when health below 4 to grant buffs" }
        ]
    },
    "minesia:flamie": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "攻击使目标着火2秒", en_US: "Sets target on fire for 2 seconds on attack" }
        ]
    },
    "minesia:ender_pearl_sword": {
        condition: { zh_CN: "副手装备时:", en_US: "When equipped in offhand:" },
        effects: [
            { zh_CN: "攻击使目标传送至高处", en_US: "Teleports target 4 blocks up on attack" }
        ]
    }
};
