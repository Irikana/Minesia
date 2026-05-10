// rules.js
// ===============================
// 所有"物品触发规则"和"套装规则"都集中在这里
// 新增内容：只改这个文件
// ===============================

export const ITEM_RULES = [
  {
    id: "minesia:golden_phantom_membrane",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "golden_phantom_membrane_active", value: true }
    ]
  },

  {
    id: "minesia:desert_walker",
    slots: ["mainhand"],
    actions: [
      { kind: "state", key: "desert_walker_active", value: true }
    ]
  },

  {
    id: "minesia:tina",
    slots: ["mainhand"],
    actions: [
      { kind: "state", key: "tina_active", value: true }
    ]
  },

  {
    id: "minesia:life_stone",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "life_stone_active", value: true },
      { kind: "attribute_percent", type: "health", percent: 50 }
    ]
  },

  {
    id: "minesia:spider_leg",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "spider_leg_active", value: true }
    ]
  },

  {
    id: "minesia:statue_totem",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "statue_totem_active", value: true },
      { kind: "attribute_percent", type: "health", percent: 25 }
    ]
  },

  {
    id: "minesia:flamie",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "flamie_offhand_active", value: true }
    ]
  },

  {
    id: "minesia:ender_pearl_sword",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "ender_pearl_sword_offhand_active", value: true }
    ]
  },

  {
    id: "minesia:desert_pyramid_pearl",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "desert_pyramid_pearl_active", value: true },
      { kind: "attribute_percent", type: "health", percent: 50 },
      { kind: "attribute_percent", type: "stamina", percent: 100 }
    ]
  },

  {
    id: "minesia:desert_pyramid_eye",
    slots: ["offhand"],
    actions: [
      { kind: "state", key: "desert_pyramid_eye_active", value: true },
      { kind: "attribute_percent", type: "stamina", percent: 50 }
    ]
  }
];

export const SET_RULES = [
  {
    name: "steel_full_set",

    required: {
      head: "minesia:steel_helmet",
      chest: "minesia:steel_chestplate",
      legs: "minesia:steel_leggings",
      feet: "minesia:steel_boots"
    },

    actions: [
      { kind: "attribute", type: "health", value: 4 },
      { kind: "state", key: "steel_set", value: true }
    ]
  },
];
