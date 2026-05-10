import { world, system, ItemStack, ItemLockMode } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { ATTRIBUTE_PANEL_ITEM_ID, ATTRIBUTE_PANEL_SLOT, getPlayerLocale, getPanelTexts } from "./config.js";
import { calculatePlayerAttributes, formatAttributeBar, formatProgressBar, formatMultiplier, formatBonus } from "./attributeCalculator.js";
import { debug } from "../debug/debugManager.js";

const playerReceivedPanel = new Map();

export function initializeAttributePanelSystem() {
    world.afterEvents.playerSpawn.subscribe(handlePlayerSpawn);
    world.afterEvents.itemUse.subscribe(handleItemUse);
    
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
        if (existingItem.lockMode !== ItemLockMode.slot) {
            existingItem.lockMode = ItemLockMode.slot;
            container.setItem(ATTRIBUTE_PANEL_SLOT, existingItem);
        }
        return;
    }
    
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
    panelItem.lockMode = ItemLockMode.slot;
    container.setItem(ATTRIBUTE_PANEL_SLOT, panelItem);
    
    const locale = getPlayerLocale(player);
    const texts = getPanelTexts(locale);
    player.sendMessage(`§a${locale === "zh_CN" ? "已获得属性面板物品，放置在第9个槽位" : "Received Attribute Panel item, placed in slot 9"}`);
    
    debug.logWithTag("AttributePanel", `${player.name} 获得属性面板物品`);
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
    
    const form = new ActionFormData()
        .title(`§6§l${texts.title}`)
        .divider()
        
        .header(`§e${texts.combat}`)
        .label(`§9${texts.critRate}: §f${attributes.critRate.toFixed(1)}%%`)
        .label(`§9${texts.critDamage}: §f+${attributes.critDamagePercent}%%`)
        .divider()
        
        .header(`§b${texts.stamina}`)
        .label(`§c${texts.currentStamina}: ${staminaBar} §f${attributes.stamina}/${attributes.maxStamina}`)
        .label(`§c${texts.maxStaminaBonus}: §f${formatBonus(attributes.maxStaminaBonus, locale)}`)
        .label(`§c${texts.consumptionMult}: §f${formatMultiplier(attributes.consumptionMultiplier, locale)}`)
        .label(`§c${texts.recoveryMult}: §f${formatMultiplier(attributes.recoveryMultiplier, locale)}`)
        .divider()
        
        .header(`§a${texts.survival}`)
        .label(`§a${texts.health}: ${healthBar} §f${attributes.health}/${attributes.maxHealth}`)
        .divider()
        
        .header(`§6${texts.level}`)
        .label(`§e${texts.levelNum}: §fLv.${attributes.level}`)
        .label(`§e${texts.totalExp}: §f${attributes.totalExp}`);
    
    if (attributes.level < 50 && attributes.expNeeded > 0) {
        const progressBar = formatProgressBar(attributes.progress, 12);
        form.label(`§e${texts.progress}: ${progressBar} §7${Math.floor(attributes.progress * 100)}%%`);
    } else {
        form.label(`§6§l${texts.maxLevel}`);
    }
    
    form.divider()
        .button(texts.close);
    
    form.show(player).then((response) => {
        if (response.canceled) {
            debug.logWithTag("AttributePanel", `${player.name} 关闭了属性面板`);
        }
    }).catch((error) => {
        debug.logError("AttributePanel", `显示属性面板失败: ${error?.message ?? error}`);
    });
}

export { ATTRIBUTE_PANEL_ITEM_ID, ATTRIBUTE_PANEL_SLOT };
