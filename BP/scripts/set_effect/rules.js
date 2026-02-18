// rules.js
// ===============================
// 所有"物品触发规则"和"套装规则"都集中在这里
// 新增内容：只改这个文件
// ===============================

export const ITEM_RULES = [
  {
    id: "minecraft:amethyst_shard",

    slots: ["mainhand"],

    actions: [
      { kind: "effect", type: "strength", amplifier: 0 },
      { kind: "attribute", type: "health", value: 8 },
      { kind: "state", key: "amethyst_active", value: true }
    ]
  },

  {
    id: "minecraft:totem_of_undying",
    slots: ["mainhand", "offhand"],

    actions: [
      { kind: "effect", type: "resistance", amplifier: 0 }
    ]
  },


];

export const SET_RULES = [
  {
    name: "shield_set",

    required: {
      offhand: "minecraft:shield",
    },
    actions: [
      { kind: "attribute", type: "health", value: 8 },
      { kind: "state", key: "shield_set", value: true }
    ]
  },
  {
    name: "diamond_full_set",

    required: {
      head: "minecraft:diamond_helmet",
      chest: "minecraft:diamond_chestplate",
      legs: "minecraft:diamond_leggings",
      feet: "minecraft:diamond_boots"
    },

    actions: [
      { kind: "effect", type: "resistance", amplifier: 1 },
      { kind: "attribute", type: "health", value: 8 },
      { kind: "state", key: "diamond_set", value: true }
    ]
  },
  {
    name: "steel_full_set",

    required: {
      head: "minesia_journey:steel_helmet",
      chest: "minesia_journey:steel_chestplate",
      legs: "minesia_journey:steel_leggings",
      feet: "minesia_journey:steel_boots"
    },

    actions: [
      { kind: "attribute", type: "health", value: 4 },
      { kind: "state", key: "steel_set", value: true }
    ]
  },
];

// 示例规则：展示如何使用新的属性系统
// 可以根据需要取消注释使用
/*
export const EXAMPLE_RULES = [
  {
    id: "minecraft:golden_apple",
    slots: ["mainhand"],
    actions: [
      { kind: "attribute_percent", type: "health", percent: 30 }
    ]
  },
  {
    id: "minecraft:nether_star",
    slots: ["offhand"],
    actions: [
      { kind: "attribute", type: "health", value: 10 }
    ]
  }
];
*/