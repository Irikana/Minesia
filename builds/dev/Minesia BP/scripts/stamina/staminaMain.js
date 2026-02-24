import { world, system, GameMode } from "@minecraft/server";
import { STAMINA_CONFIG, getStaminaTexts } from "./config.js";
import { ActionBarManager, DISPLAY_PRIORITIES } from "../action_bar/index.js";
import { getWeaponStaminaCost, isStaminaWeapon } from "./weaponStaminaConfig.js";

const playerStaminaData = new Map();
const playerDisplayState = new Map();
const LANGUAGE_OBJECTIVE = "minesia_language";
const DEFAULT_LOCALE = "zh_CN";

function getPlayerLocale(player) {
    try {
        const scoreboard = world.scoreboard;
        const langObj = scoreboard?.getObjective(LANGUAGE_OBJECTIVE);
        if (langObj) {
            const score = langObj.getScore(player);
            if (score === 0) return "en_US";
            return "zh_CN";
        }
    } catch (e) { }
    return DEFAULT_LOCALE;
}

class StaminaSystem {
    static playerStates = new Map();
    static displayPaused = new Map();
    static consumptionModifiers = new Map();
    static recoveryModifiers = new Map();

    static initialize() {
        console.log('[Stamina] 体力值系统初始化完成');
    }

    static getPlayerData(player) {
        let data = playerStaminaData.get(player.id);
        if (!data) {
            data = {
                stamina: STAMINA_CONFIG.maxStamina,
                lastPosition: { x: player.location.x, y: player.location.y, z: player.location.z },
                lastTick: system.currentTick,
                isExhausted: false,
                isRecovering: false,
                lastConsumptionTick: 0,
                lastDisplayTick: 0,
                wasMoving: false,
                wasSprinting: false,
                lastY: player.location.y,
                jumpCooldown: 0,
                wasDisplaying: false,
                consumptionMultiplier: 1,
                recoveryMultiplier: 1,
                maxStaminaBonus: 0,
                lastStamina: STAMINA_CONFIG.maxStamina
            };
            playerStaminaData.set(player.id, data);
        }
        return data;
    }

    static getStamina(player) {
        const data = this.getPlayerData(player);
        return data.stamina;
    }

    static getMaxStamina(player) {
        const data = this.getPlayerData(player);
        return STAMINA_CONFIG.maxStamina + data.maxStaminaBonus;
    }

    static getStaminaPercentage(player) {
        const data = this.getPlayerData(player);
        const maxStamina = this.getMaxStamina(player);
        return data.stamina / maxStamina;
    }

    static isExhausted(player) {
        const data = this.getPlayerData(player);
        return data.isExhausted;
    }

    static isRecovering(player) {
        const data = this.getPlayerData(player);
        return data.isRecovering;
    }

    static setStamina(player, value, triggerDisplay = false) {
        const data = this.getPlayerData(player);
        const maxStamina = this.getMaxStamina(player);
        const oldValue = data.stamina;
        data.stamina = Math.max(0, Math.min(maxStamina, value));

        if (data.stamina !== oldValue) {
            this.triggerDisplay(player, data);
        }

        if (data.stamina <= 0) {
            this.handleExhaustion(player, data);
        } else if (data.isExhausted && data.stamina > STAMINA_CONFIG.exhaustionThreshold) {
            data.isExhausted = false;
            this.clearExhaustionEffects(player);
        }

        return data.stamina;
    }

    static consumeStamina(player, amount, ignoreMultiplier = false) {
        const data = this.getPlayerData(player);
        const multiplier = ignoreMultiplier ? 1 : data.consumptionMultiplier;
        const finalAmount = amount * multiplier;
        const newStamina = this.setStamina(player, data.stamina - finalAmount);
        data.lastConsumptionTick = system.currentTick;
        data.isRecovering = false;

        return newStamina;
    }

    static recoverStamina(player, amount, ignoreMultiplier = false) {
        const data = this.getPlayerData(player);
        const multiplier = ignoreMultiplier ? 1 : data.recoveryMultiplier;
        const finalAmount = amount * multiplier;
        const newStamina = this.setStamina(player, data.stamina + finalAmount, false);

        return newStamina;
    }

    static setConsumptionMultiplier(player, multiplier) {
        const data = this.getPlayerData(player);
        data.consumptionMultiplier = Math.max(0, multiplier);
    }

    static setRecoveryMultiplier(player, multiplier) {
        const data = this.getPlayerData(player);
        data.recoveryMultiplier = Math.max(0, multiplier);
    }

    static setMaxStaminaBonus(player, bonus) {
        const data = this.getPlayerData(player);
        data.maxStaminaBonus = Math.max(0, bonus);
    }

    static addConsumptionModifier(player, modifierId, multiplier) {
        if (!this.consumptionModifiers.has(player.id)) {
            this.consumptionModifiers.set(player.id, new Map());
        }
        this.consumptionModifiers.get(player.id).set(modifierId, multiplier);
        this.recalculateMultipliers(player);
    }

    static removeConsumptionModifier(player, modifierId) {
        const playerModifiers = this.consumptionModifiers.get(player.id);
        if (playerModifiers) {
            playerModifiers.delete(modifierId);
            this.recalculateMultipliers(player);
        }
    }

    static addRecoveryModifier(player, modifierId, multiplier) {
        if (!this.recoveryModifiers.has(player.id)) {
            this.recoveryModifiers.set(player.id, new Map());
        }
        this.recoveryModifiers.get(player.id).set(modifierId, multiplier);
        this.recalculateMultipliers(player);
    }

    static removeRecoveryModifier(player, modifierId) {
        const playerModifiers = this.recoveryModifiers.get(player.id);
        if (playerModifiers) {
            playerModifiers.delete(modifierId);
            this.recalculateMultipliers(player);
        }
    }

    static recalculateMultipliers(player) {
        const data = this.getPlayerData(player);

        let consumptionMult = 1;
        const consumptionMods = this.consumptionModifiers.get(player.id);
        if (consumptionMods) {
            for (const mult of consumptionMods.values()) {
                consumptionMult *= mult;
            }
        }
        data.consumptionMultiplier = consumptionMult;

        let recoveryMult = 1;
        const recoveryMods = this.recoveryModifiers.get(player.id);
        if (recoveryMods) {
            for (const mult of recoveryMods.values()) {
                recoveryMult *= mult;
            }
        }
        data.recoveryMultiplier = recoveryMult;
    }

    static forceExhaust(player) {
        const data = this.getPlayerData(player);
        this.setStamina(player, 0);
        this.handleExhaustion(player, data);
    }

    static fullRestore(player) {
        const data = this.getPlayerData(player);
        const maxStamina = this.getMaxStamina(player);
        this.setStamina(player, maxStamina);
        if (data.isExhausted) {
            data.isExhausted = false;
            this.clearExhaustionEffects(player);
        }
    }

    static handleExhaustion(player, data) {
        if (!data.isExhausted) {
            data.isExhausted = true;
            this.applyExhaustionEffects(player);
        }
    }

    static applyExhaustionEffects(player) {
        try {
            const slowness = STAMINA_CONFIG.effects.slowness;
            const miningFatigue = STAMINA_CONFIG.effects.miningFatigue;

            player.addEffect("minecraft:slowness", slowness.duration, {
                amplifier: slowness.amplifier,
                showParticles: false
            });

            player.addEffect("minecraft:mining_fatigue", miningFatigue.duration, {
                amplifier: miningFatigue.amplifier,
                showParticles: false
            });
        } catch (error) {
            console.error('[Stamina] 应用疲劳效果失败:', error?.message ?? error);
        }
    }

    static clearExhaustionEffects(player) {
        try {
            player.removeEffect("minecraft:slowness");
            player.removeEffect("minecraft:mining_fatigue");
        } catch (error) {
            console.error('[Stamina] 清除疲劳效果失败:', error?.message ?? error);
        }
    }

    static triggerDisplay(player, data) {
        data.lastDisplayTick = system.currentTick;
        playerDisplayState.set(player.id, {
            shouldDisplay: true,
            displayTick: system.currentTick
        });
    }

    static shouldDisplayStamina(playerId) {
        const data = playerStaminaData.get(playerId);
        if (!data) return false;

        if (data.stamina !== data.lastStamina) {
            return true;
        }

        const state = playerDisplayState.get(playerId);
        if (!state) return false;

        const elapsed = system.currentTick - state.displayTick;
        return elapsed < STAMINA_CONFIG.displayDuration;
    }

    static pauseDisplay(player, duration) {
        this.displayPaused.set(player.id, true);
        system.runTimeout(() => {
            this.displayPaused.delete(player.id);
        }, Math.floor(duration / 50));
    }

    static isDisplayPaused(playerId) {
        return this.displayPaused.has(playerId);
    }
}

function updatePlayerStamina(player) {
    if (!STAMINA_CONFIG.enabled) return;

    if (player.getGameMode() === GameMode.Creative) return;

    const data = StaminaSystem.getPlayerData(player);
    const currentTick = system.currentTick;
    const currentPos = player.location;
    const isSprinting = player.isSprinting;
    const isSwimming = player.isSwimming;
    const isOnGround = player.isOnGround;

    data.lastStamina = data.stamina;

    const dx = currentPos.x - data.lastPosition.x;
    const dy = currentPos.y - data.lastPosition.y;
    const dz = currentPos.z - data.lastPosition.z;
    const horizontalSpeed = Math.sqrt(dx * dx + dz * dz);
    const verticalSpeed = dy;

    let staminaConsumed = 0;
    let isConsuming = false;

    if (isSprinting && horizontalSpeed > 0.1) {
        staminaConsumed += STAMINA_CONFIG.consumption.sprint;
        isConsuming = true;
    }

    if (isSwimming && horizontalSpeed > 0.05) {
        staminaConsumed += STAMINA_CONFIG.consumption.swim;
        isConsuming = true;
    }

    if (data.jumpCooldown > 0) {
        data.jumpCooldown--;
    }

    if (verticalSpeed > 0.4 && data.jumpCooldown === 0 && isOnGround === false) {
        const wasOnGroundRecently = data.wasOnGround;
        if (wasOnGroundRecently || Math.abs(verticalSpeed) > 0.5) {
            staminaConsumed += STAMINA_CONFIG.consumption.jump;
            isConsuming = true;
            data.jumpCooldown = 10;
        }
    }
    data.wasOnGround = isOnGround;

    if (staminaConsumed > 0) {
        StaminaSystem.consumeStamina(player, staminaConsumed);
    }

    const ticksSinceLastConsumption = currentTick - data.lastConsumptionTick;
    if (ticksSinceLastConsumption >= STAMINA_CONFIG.recoveryDelay && !isConsuming) {
        const horizontalMovement = Math.sqrt(dx * dx + dz * dz);
        const isIdle = horizontalMovement < 0.01 && Math.abs(verticalSpeed) < 0.1;

        if (isIdle || data.isExhausted) {
            const recoveryRate = data.isExhausted
                ? STAMINA_CONFIG.exhaustionRecoveryRate
                : STAMINA_CONFIG.recoveryRate;

            StaminaSystem.recoverStamina(player, recoveryRate);
            data.isRecovering = true;
        } else {
            data.isRecovering = false;
        }
    }

    if (data.isExhausted) {
        StaminaSystem.applyExhaustionEffects(player);
    }

    data.lastPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
    data.lastTick = currentTick;
    data.wasSprinting = isSprinting;
    data.lastY = currentPos.y;
}

function handlePlayerAttack(event) {
    if (!STAMINA_CONFIG.enabled) return;

    const { damageSource } = event;
    if (!damageSource || damageSource.cause !== "entityAttack") return;

    const attacker = damageSource.damagingEntity;
    if (!attacker || attacker.typeId !== "minecraft:player") return;

    if (attacker.getGameMode() === GameMode.Creative) return;

    const equippable = attacker.getComponent('minecraft:equippable');
    if (!equippable) return;

    const mainhandItem = equippable.getEquipment('Mainhand');
    if (!mainhandItem) return;

    const staminaCost = getWeaponStaminaCost(mainhandItem.typeId);
    if (staminaCost === null) return;

    StaminaSystem.consumeStamina(attacker, staminaCost);
}

export function displayStaminaBar(player) {
    if (!STAMINA_CONFIG.enabled) return;

    if (player.getGameMode() === GameMode.creative) return;

    const playerId = player.id;

    if (StaminaSystem.isDisplayPaused(playerId)) return;

    const shouldDisplay = StaminaSystem.shouldDisplayStamina(playerId);
    const data = StaminaSystem.getPlayerData(player);

    if (!shouldDisplay) {
        ActionBarManager.removeLine(playerId, 'stamina');
        data.wasDisplaying = false;
        return;
    }

    data.wasDisplaying = true;

    const locale = getPlayerLocale(player);
    const texts = getStaminaTexts(locale);

    const stamina = data.stamina;
    const maxStamina = StaminaSystem.getMaxStamina(player);
    const percentage = Math.max(0, Math.min(1, stamina / maxStamina));

    const barLength = STAMINA_CONFIG.display.barLength;
    const filled = Math.max(0, Math.min(barLength, Math.floor(percentage * barLength)));
    const empty = Math.max(0, barLength - filled);

    let barColor = "§a";
    if (percentage <= 0.25) {
        barColor = "§c";
    } else if (percentage <= 0.5) {
        barColor = "§e";
    }

    const bar = barColor + "█".repeat(filled) + "§7" + "░".repeat(empty);

    let displayText;
    if (data.isExhausted) {
        displayText = `§c${texts.exhausted} §f${bar}`;
    } else {
        displayText = `§6${texts.stamina} §f${bar}`;
    }

    ActionBarManager.setLine(playerId, 'stamina', displayText, DISPLAY_PRIORITIES.STAMINA);
    ActionBarManager.updateDisplay(player);
}

export function initializeStaminaSystem() {
    StaminaSystem.initialize();
    world.afterEvents.entityHurt.subscribe(handlePlayerAttack);

    if (world.afterEvents.scriptEventReceive) {
        world.afterEvents.scriptEventReceive.subscribe(handleScriptEvent);
    }

    console.log('[Stamina] 体力值系统初始化完成');
}

function handleScriptEvent(event) {
    const { id, sourceEntity } = event;

    if (!sourceEntity || sourceEntity.typeId !== "minecraft:player") return;

    const player = sourceEntity;

    if (id === 'minesia:stamina_restore') {
        StaminaSystem.fullRestore(player);
        player.sendMessage('§a体力值已完全恢复');
    }
    else if (id === 'minesia:stamina_exhaust') {
        StaminaSystem.forceExhaust(player);
        player.sendMessage('§c体力值已耗尽');
    }
    else if (id.startsWith('minesia:stamina_set ')) {
        const value = parseFloat(id.split(' ')[1]);
        if (!isNaN(value)) {
            StaminaSystem.setStamina(player, value);
            player.sendMessage(`§e体力值已设置为 ${value}`);
        }
    }
    else if (id.startsWith('minesia:stamina_consume ')) {
        const value = parseFloat(id.split(' ')[1]);
        if (!isNaN(value) && value > 0) {
            StaminaSystem.consumeStamina(player, value);
            player.sendMessage(`§e消耗了 ${value} 点体力值`);
        }
    }
    else if (id.startsWith('minesia:stamina_recover ')) {
        const value = parseFloat(id.split(' ')[1]);
        if (!isNaN(value) && value > 0) {
            StaminaSystem.recoverStamina(player, value);
            player.sendMessage(`§e恢复了 ${value} 点体力值`);
        }
    }
    else if (id.startsWith('minesia:stamina_max_bonus ')) {
        const value = parseFloat(id.split(' ')[1]);
        if (!isNaN(value)) {
            StaminaSystem.setMaxStaminaBonus(player, value);
            player.sendMessage(`§e最大体力值加成设置为 ${value}`);
        }
    }
    else if (id.startsWith('minesia:stamina_consumption_mult ')) {
        const value = parseFloat(id.split(' ')[1]);
        if (!isNaN(value)) {
            StaminaSystem.setConsumptionMultiplier(player, value);
            player.sendMessage(`§e体力消耗倍率设置为 ${value}`);
        }
    }
    else if (id.startsWith('minesia:stamina_recovery_mult ')) {
        const value = parseFloat(id.split(' ')[1]);
        if (!isNaN(value)) {
            StaminaSystem.setRecoveryMultiplier(player, value);
            player.sendMessage(`§e体力恢复倍率设置为 ${value}`);
        }
    }
    else if (id === 'minesia:stamina_info') {
        const stamina = StaminaSystem.getStamina(player);
        const maxStamina = StaminaSystem.getMaxStamina(player);
        const percentage = StaminaSystem.getStaminaPercentage(player);
        const isExhausted = StaminaSystem.isExhausted(player);
        const data = StaminaSystem.getPlayerData(player);

        player.sendMessage('§b=== 体力值信息 ===');
        player.sendMessage(`§e当前体力: §f${stamina.toFixed(1)} / ${maxStamina}`);
        player.sendMessage(`§e体力百分比: §f${(percentage * 100).toFixed(1)}%`);
        player.sendMessage(`§e消耗倍率: §f${data.consumptionMultiplier}`);
        player.sendMessage(`§e恢复倍率: §f${data.recoveryMultiplier}`);
        player.sendMessage(`§e状态: ${isExhausted ? '§c疲劳' : '§a正常'}`);
    }
}

export function updateStaminaSystem() {
    if (!STAMINA_CONFIG.enabled) return;

    const players = world.getPlayers();
    for (const player of players) {
        updatePlayerStamina(player);
        displayStaminaBar(player);
    }
}

export function getStaminaData(playerId) {
    return playerStaminaData.get(playerId);
}

export { StaminaSystem };
