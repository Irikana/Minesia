import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { ATTRIBUTE_PANEL_ITEM_ID, ATTRIBUTE_PANEL_SLOT, getPanelTexts } from "./config.js";
import { getPlayerLocale, setPlayerLocale } from "../language.js";
import { calculatePlayerAttributes, formatAttributeBar, formatProgressBar, formatMultiplier, formatBonus } from "./attributeCalculator.js";
import { debug } from "../debug/debugManager.js";

const playerReceivedPanel = new Map();

export function initializeAttributePanelSystem() {
    world.afterEvents.playerSpawn.subscribe(handlePlayerSpawn);
    world.afterEvents.itemUse.subscribe(handleItemUse);

    // 轮询确保属性面板物品不被移走（ItemLockMode 是 beta API，稳定版不可用）
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            ensurePlayerHasPanel(player);
        }
    }, 100);

    debug.logWithTag("AttributePanel", "属性面板系统初始化完成");
}

function handlePlayerSpawn(event) {
    const { player, initialSpawn } = event;
    if (!player || !initialSpawn) return;
    
    system.runTimeout(() => {
        ensurePlayerHasPanel(player);
    }, 60);
}

function ensurePlayerHasPanel(player) {
    const inventory = player.getComponent('minecraft:inventory');
    if (!inventory) return;

    const container = inventory.container;
    if (!container) return;

    const existingItem = container.getItem(ATTRIBUTE_PANEL_SLOT);
    if (existingItem && existingItem.typeId === ATTRIBUTE_PANEL_ITEM_ID) {
        return;
    }

    // 槽位被其他物品占用，移到其他空位
    if (existingItem) {
        for (let i = 0; i < container.size; i++) {
            if (i === ATTRIBUTE_PANEL_SLOT) continue;
            const item = container.getItem(i);
            if (!item) {
                container.setItem(i, existingItem);
                break;
            }
        }
    }

    const panelItem = new ItemStack(ATTRIBUTE_PANEL_ITEM_ID, 1);
    container.setItem(ATTRIBUTE_PANEL_SLOT, panelItem);

    const playerKey = player.id;
    if (!playerReceivedPanel.has(playerKey)) {
        playerReceivedPanel.set(playerKey, true);
        const locale = getPlayerLocale(player);
        player.sendMessage(`§a${locale === "zh_CN" ? "已获得属性面板物品，放置在第9个槽位" : "Received Attribute Panel item, placed in slot 9"}`);
        debug.logWithTag("AttributePanel", `${player.name} 获得属性面板物品`);
    }
}

function handleItemUse(event) {
    const { source, itemStack } = event;
    
    if (!source || source.typeId !== "minecraft:player") return;
    if (!itemStack || itemStack.typeId !== ATTRIBUTE_PANEL_ITEM_ID) return;
    
    const player = source;
    
    showAttributePanel(player);
    
    event.cancel = true;
}

export function showAttributePanel(player) {
    const locale = getPlayerLocale(player);
    const texts = getPanelTexts(locale);
    const attributes = calculatePlayerAttributes(player);

    const staminaBar = formatAttributeBar(attributes.stamina, attributes.maxStamina, 12);
    const healthBar = formatAttributeBar(attributes.health, attributes.maxHealth, 12);

    let levelInfo = "";
    if (attributes.level < 50 && attributes.expNeeded > 0) {
        const progressBar = formatProgressBar(attributes.progress, 12);
        levelInfo = `§e${texts.progress}: ${progressBar} §7${Math.floor(attributes.progress * 100)}%%`;
    } else {
        levelInfo = `§6§l${texts.maxLevel}`;
    }

    const bodyText = [
        `§e━━━ ${texts.combat} ━━━`,
        `§9${texts.critRate}: §f${attributes.critRate.toFixed(1)}%%`,
        `§9${texts.critDamage}: §f+${attributes.critDamagePercent}%%`,
        ``,
        `§b━━━ ${texts.stamina} ━━━`,
        `§c${texts.currentStamina}: ${staminaBar} §f${attributes.stamina}/${attributes.maxStamina}`,
        `§c${texts.maxStaminaBonus}: §f${formatBonus(attributes.maxStaminaBonus, locale)}`,
        `§c${texts.consumptionMult}: §f${formatMultiplier(attributes.consumptionMultiplier, locale)}`,
        `§c${texts.recoveryMult}: §f${formatMultiplier(attributes.recoveryMultiplier, locale)}`,
        ``,
        `§a━━━ ${texts.survival} ━━━`,
        `§a${texts.health}: ${healthBar} §f${attributes.health}/${attributes.maxHealth}`,
        ``,
        `§6━━━ ${texts.level} ━━━`,
        `§e${texts.levelNum}: §fLv.${attributes.level}`,
        `§e${texts.totalExp}: §f${attributes.totalExp}`,
        levelInfo
    ].join("\n");

    const form = new ActionFormData()
        .title(texts.title)
        .body(bodyText)
        .button(texts.settings)
        .button(texts.close);

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === 0) {
            showSettingsPanel(player);
        }
    }).catch((error) => {
        debug.logError("AttributePanel", `显示属性面板失败: ${error?.message ?? error}`);
    });
}

function showSettingsPanel(player) {
    const locale = getPlayerLocale(player);
    const texts = getPanelTexts(locale);
    
    const settingsTexts = {
        zh_CN: {
            title: "设置",
            language: "语言",
            languageOptions: ["中文", "English"],
            close: "关闭"
        },
        en_US: {
            title: "Settings",
            language: "Language",
            languageOptions: ["Chinese", "English"],
            close: "Close"
        }
    };
    
    const st = settingsTexts[locale] || settingsTexts.zh_CN;
    const currentLangIndex = locale === "zh_CN" ? 0 : 1;
    
    const form = new ModalFormData()
        .title(st.title)
        .dropdown(st.language, st.languageOptions, currentLangIndex);
    
    form.show(player).then((response) => {
        if (response.canceled) return;
        
        const selectedLangIndex = response.formValues[0];
        const newLocale = selectedLangIndex === 0 ? "zh_CN" : "en_US";
        
        if (newLocale !== locale) {
            setPlayerLocale(player, newLocale);
            if (newLocale === "en_US") {
                player.sendMessage('§aLanguage set to English.');
            } else {
                player.sendMessage('§a语言已设置为中文。');
            }
        }
    }).catch((error) => {
        debug.logError("AttributePanel", `显示设置面板失败: ${error?.message ?? error}`);
    });
}

export { ATTRIBUTE_PANEL_ITEM_ID, ATTRIBUTE_PANEL_SLOT };
