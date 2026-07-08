import { world, system, GameMode } from "@minecraft/server";
import { STAMINA_CONFIG, getStaminaTexts } from "./config.js";
import { ActionBarManager, DISPLAY_PRIORITIES } from "../action_bar/index.js";
import { getWeaponStaminaCost, isStaminaWeapon } from "./weaponStaminaConfig.js";
import { debug } from "../debug/debugManager.js";
import { MinesiaLevelSystem } from "../minesia_level/level_system.js";
import { MinesiaLevelEventSystem } from "../minesia_level/minesiaLevelEvent.js";
import { getPlayerLocale } from "../language.js";

// DynamicProperty 标识符(必须放在使用前)
const STAMINA_PROPERTY_ID = "minesia:stamina";
const STAMINA_BONUS_PROPERTY_ID = "minesia:stamina_bonus";

const playerStaminaData = new Map();
const playerDisplayState = new Map();
const playerGameModeMap = new Map();

function getPlayerGameMode(player) {
    try {
        return player.getGameMode?.() ?? null;
    } catch (e) {
        const storedMode = playerGameModeMap.get(player.id);
        return storedMode ?? null;
    }
}

function isCreativeOrSpectator(player) {
    const gameMode = getPlayerGameMode(player);
    return gameMode === GameMode.creative || gameMode === GameMode.spectator ||
           gameMode === "creative" || gameMode === "spectator";
}

class StaminaSystem {
    static playerStates = new Map();
    static displayPaused = new Map();
    static consumptionModifiers = new Map();
    static recoveryModifiers = new Map();
    static exhaustedDamageWarnings = new Map();

    static initialize() {
        debug.logWithTag("Stamina", "体力值系统初始化完成");
    }

    static setExhaustedDamageWarning(playerId, value) {
        if (value) {
            this.exhaustedDamageWarnings.set(playerId, true);
        } else {
            this.exhaustedDamageWarnings.delete(playerId);
        }
    }

    static hasExhaustedDamageWarning(playerId) {
        return this.exhaustedDamageWarnings.has(playerId);
    }

    static clearExhaustedDamageWarning(playerId) {
        this.exhaustedDamageWarnings.delete(playerId);
    }

    static getPlayerData(player) {
        let data = playerStaminaData.get(player.id);
        if (!data) {
            // 创建默认数据(不读 DynamicProperty,由 handlePlayerSpawn 显式赋值)
            // 参考 0.0.16 工作版本
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
                levelStaminaBonus: 0,
                spawnGraceTicks: 0,
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
        return STAMINA_CONFIG.maxStamina + data.levelStaminaBonus + data.maxStaminaBonus;
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
        if (isCreativeOrSpectator(player)) return 0;

        const data = this.getPlayerData(player);
        const multiplier = ignoreMultiplier ? 1 : data.consumptionMultiplier;
        const finalAmount = amount * multiplier;
        const newStamina = this.setStamina(player, data.stamina - finalAmount);
        data.lastConsumptionTick = system.currentTick;
        data.isRecovering = false;

        return newStamina;
    }

    static recoverStamina(player, amount, ignoreMultiplier = false) {
        if (isCreativeOrSpectator(player)) return 0;

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

    /**
     * 设置等级体力加成(独立于装备/套装加成,不会被 clearStates 覆盖)
     */
    static setLevelStaminaBonus(player, bonus) {
        const data = this.getPlayerData(player);
        const oldMaxStamina = STAMINA_CONFIG.maxStamina + data.levelStaminaBonus + data.maxStaminaBonus;
        const newMaxStamina = STAMINA_CONFIG.maxStamina + Math.max(0, bonus) + data.maxStaminaBonus;
        if (data.stamina >= oldMaxStamina) {
            data.stamina = newMaxStamina;
        }
        data.levelStaminaBonus = Math.max(0, bonus);
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
            debug.logError("Stamina", `应用疲劳效果失败: ${error?.message ?? error}`);
        }
    }

    static clearExhaustionEffects(player) {
        try {
            player.removeEffect("minecraft:slowness");
            player.removeEffect("minecraft:mining_fatigue");
        } catch (error) {
            debug.logError("Stamina", `清除疲劳效果失败: ${error?.message ?? error}`);
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

    if (isCreativeOrSpectator(player)) return;

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

    // spawn grace 期间跳过恢复(防止世界加载期间体力自动恢复)
    // 玩家实际移动后(表示世界已加载,玩家可操作)立即清除 grace 并重置恢复计时器
    if (data.spawnGraceTicks > 0) {
        if (horizontalSpeed > 0.1) {
            data.spawnGraceTicks = 0;
            data.lastConsumptionTick = currentTick;
        } else {
            data.spawnGraceTicks--;
            data.lastPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
            data.lastTick = currentTick;
            data.wasSprinting = isSprinting;
            data.lastY = currentPos.y;
            return;
        }
    }

    const ticksSinceLastConsumption = currentTick - data.lastConsumptionTick;
    if (ticksSinceLastConsumption >= STAMINA_CONFIG.recoveryDelay && !isConsuming) {
        const horizontalMovement = Math.sqrt(dx * dx + dz * dz);
        const isIdle = horizontalMovement < 0.01 && Math.abs(verticalSpeed) < 0.1;

        let hungerComponent = null;
        let currentHunger = 20;
        let maxHunger = 20;
        try {
            hungerComponent = player.getComponent('minecraft:player.hunger');
            if (hungerComponent) {
                currentHunger = hungerComponent.currentValue ?? 20;
                maxHunger = hungerComponent.effectiveMax ?? 20;
            }
        } catch (e) { }

        const isHungerEmpty = currentHunger <= 0;
        const isHungerFull = currentHunger >= maxHunger;
        const hungerRecoveryMultiplier = isHungerFull ? 2 : 1;

        if (isHungerEmpty) {
            data.isRecovering = false;
        } else if (data.isExhausted) {
            StaminaSystem.recoverStamina(player, STAMINA_CONFIG.exhaustionRecoveryRate * hungerRecoveryMultiplier);
            data.isRecovering = true;
        } else if (isIdle) {
            StaminaSystem.recoverStamina(player, STAMINA_CONFIG.recoveryRate * hungerRecoveryMultiplier);
            data.isRecovering = true;
        } else if (horizontalMovement > 0.01 && !isSprinting) {
            StaminaSystem.recoverStamina(player, STAMINA_CONFIG.walkingRecoveryRate * hungerRecoveryMultiplier);
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

    if (isCreativeOrSpectator(attacker)) return;

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

    // 直接使用 player.getGameMode() 检查,不依赖缓存
    const gameMode = player.getGameMode?.();
    if (gameMode === GameMode.creative || gameMode === GameMode.spectator ||
        gameMode === "creative" || gameMode === "spectator") {
        ActionBarManager.removeLine(player.id, 'stamina');
        ActionBarManager.updateDisplay(player);
        const data = StaminaSystem.getPlayerData(player);
        data.wasDisplaying = false;
        return;
    }

    const playerId = player.id;

    if (StaminaSystem.isDisplayPaused(playerId)) return;

    const shouldDisplay = StaminaSystem.shouldDisplayStamina(playerId);
    const data = StaminaSystem.getPlayerData(player);
    const hasExhaustedWarning = StaminaSystem.hasExhaustedDamageWarning(playerId);

    if (!shouldDisplay && !hasExhaustedWarning) {
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

    const bar = buildEnhancedStaminaBar(percentage, Math.floor(stamina), maxStamina, data.isExhausted, texts, locale, hasExhaustedWarning);

    ActionBarManager.setLine(playerId, 'stamina', bar, DISPLAY_PRIORITIES.STAMINA);
    ActionBarManager.updateDisplay(player);

    if (hasExhaustedWarning) {
        system.runTimeout(() => {
            StaminaSystem.clearExhaustedDamageWarning(playerId);
        }, 40);
    }
}

function buildEnhancedStaminaBar(percentage, currentStamina, maxStamina, isExhausted, texts, locale = "zh_CN", hasExhaustedWarning = false) {
    const barLength = 12;
    const filled = Math.max(0, Math.min(barLength, Math.floor(percentage * barLength)));
    const empty = Math.max(0, barLength - filled);

    const filledChar = "■";

    let fillColor, emptyColor, pulse;
    if (percentage > 0.6) {
        fillColor = "§a";
        emptyColor = "§8";
        pulse = "";
    } else if (percentage > 0.3) {
        fillColor = "§e";
        emptyColor = "§8";
        pulse = "";
    } else {
        fillColor = "§c";
        emptyColor = "§8";
        pulse = "§l";
    }

    const bar = pulse + fillColor + filledChar.repeat(filled) + emptyColor + filledChar.repeat(empty);

    const staminaText = Math.floor(currentStamina).toString().padStart(3, " ");
    const maxText = maxStamina.toString();
    const percentText = Math.floor(percentage * 100).toString().padStart(3, " ");

    if (hasExhaustedWarning) {
        const warningText = locale === "zh_CN" ? "§c§l体力耗尽，伤害减半！" : "§c§lExhausted! Damage Halved!";
        return warningText + "\n" + `§6${texts.stamina} ${bar} §7${staminaText}/${maxText} §f${percentText}%`;
    }

    if (isExhausted) {
        return `§c${texts.exhausted} ${bar} §7${staminaText}/${maxText} §f${percentText}%`;
    }

    return `§6${texts.stamina} ${bar} §7${staminaText}/${maxText} §f${percentText}%`;
}

export function initializeStaminaSystem() {
    StaminaSystem.initialize();
    world.afterEvents.entityHurt.subscribe(handlePlayerAttack);
    world.afterEvents.playerSpawn.subscribe(handlePlayerSpawn);
    world.afterEvents.itemCompleteUse.subscribe(handleItemCompleteUse);
    world.beforeEvents.playerLeave.subscribe(handlePlayerLeave);
    system.runInterval(checkPlayerSleep, 20);

    try {
        world.afterEvents.playerGameModeChange.subscribe((event) => {
            try {
                const { player, newGameMode } = event;
                playerGameModeMap.set(player.id, newGameMode);
                if (newGameMode === GameMode.creative || newGameMode === GameMode.spectator ||
                    newGameMode === "creative" || newGameMode === "spectator") {
                    ActionBarManager.removeLine(player.id, 'stamina');
                    ActionBarManager.updateDisplay(player);
                    const data = StaminaSystem.getPlayerData(player);
                    if (data) data.wasDisplaying = false;
                }
            } catch (e) { }
        });
    } catch (e) {
        debug.logError("Stamina", `playerGameModeChange 事件订阅失败: ${e?.message ?? e}`);
    }

    // 定期保存所有玩家的体力值和加成到 DynamicProperty(每5秒,防止 beforeEvents 保存失败)
    system.runInterval(() => {
        try {
            const players = world.getPlayers();
            for (const player of players) {
                try {
                    const data = playerStaminaData.get(player.id);
                    if (data) {
                        player.setDynamicProperty(STAMINA_PROPERTY_ID, data.stamina);
                        player.setDynamicProperty(STAMINA_BONUS_PROPERTY_ID, data.maxStaminaBonus);
                    }
                } catch (_e) { }
            }
        } catch (_e) { }
    }, 100);

    if (world.afterEvents.scriptEventReceive) {
        world.afterEvents.scriptEventReceive.subscribe(handleScriptEvent);
    }

    debug.logWithTag("Stamina", "体力值系统初始化完成");
}

const playerSleepState = new Map();
const playerSleepTime = new Map();

function checkPlayerSleep() {
    const players = world.getPlayers();
    for (const player of players) {
        const playerId = player.id;
        const wasSleeping = playerSleepState.get(playerId) || false;
        const isSleeping = player.isSleeping;

        if (isSleeping && !wasSleeping) {
            playerSleepTime.set(playerId, world.getTimeOfDay());
        }

        if (wasSleeping && !isSleeping) {
            const sleepStartTime = playerSleepTime.get(playerId);
            const currentTime = world.getTimeOfDay();
            const timeSlept = currentTime < sleepStartTime
                ? (24000 - sleepStartTime) + currentTime
                : currentTime - sleepStartTime;

            if (timeSlept > 100 || (sleepStartTime > 12542 && currentTime < 12542)) {
                StaminaSystem.fullRestore(player);
            }
        }

        playerSleepState.set(playerId, isSleeping);
    }
}

function applyLevelStaminaBonus(player) {
    if (isCreativeOrSpectator(player)) return true;
    
    const totalExp = MinesiaLevelSystem.getTotalExperience(player);
    if (totalExp === null) return false;
    const currentLevel = MinesiaLevelSystem.calculateLevel(totalExp);
    const staminaBonus = MinesiaLevelEventSystem.calculateLevelStaminaBonus(currentLevel);
    StaminaSystem.setLevelStaminaBonus(player, staminaBonus);
    return true;
}

function handlePlayerSpawn(event) {
    const { player, initialSpawn } = event;
    if (!player) return;

    // 创造/旁观模式直接跳过所有体力逻辑
    if (isCreativeOrSpectator(player)) {
        ActionBarManager.removeLine(player.id, 'stamina');
        ActionBarManager.updateDisplay(player);
        return;
    }

    try {
        const gm = player.getGameMode?.();
        if (gm) playerGameModeMap.set(player.id, gm);
    } catch (e) { }

    // 0.0.16 工作方式:先创建默认数据,再显式读取 DynamicProperty 赋值
    const savedStamina = player.getDynamicProperty(STAMINA_PROPERTY_ID);
    const data = StaminaSystem.getPlayerData(player);

    if (!initialSpawn) {
        // 死亡重生:体力值恢复满
        StaminaSystem.fullRestore(player);
    } else if (savedStamina !== undefined && savedStamina !== null) {
        data.stamina = savedStamina;
        if (data.stamina <= 0) {
            data.isExhausted = true;
        }
    } else {
        StaminaSystem.fullRestore(player);
    }

    // 阻止进服瞬间开始恢复(否则 savedStamina 会在世界加载期间恢复到满)
    // spawnGraceTicks 提供最长 20 秒恢复冷却期,玩家实际移动后立即清除
    data.lastConsumptionTick = system.currentTick;
    data.spawnGraceTicks = 400;

    // 读取计分板计算等级体力加成(每次 playerSpawn 重新计算,无需持久化 bonus)
    applyLevelStaminaBonus(player);

    if (!initialSpawn) {
        system.runTimeout(() => {
            try {
                const healthComponent = player.getComponent('minecraft:health');
                if (healthComponent) {
                    const maxHealth = healthComponent.effectiveMax ?? 10;
                    healthComponent.setCurrentValue(maxHealth);
                }
            } catch (e) {
                debug.logError("Stamina", `恢复生命值失败: ${e?.message ?? e}`);
            }
        }, 5);
    }
}

function handlePlayerLeave(event) {
    const { player } = event;
    if (!player) return;

    // 清理内存数据
    playerStaminaData.delete(player.id);
    playerGameModeMap.delete(player.id);
}

function handleItemCompleteUse(event) {
    if (!STAMINA_CONFIG.enabled) return;

    const { source, itemStack } = event;
    if (!source || source.typeId !== "minecraft:player") return;
    if (!itemStack) return;

    const player = source;
    if (isCreativeOrSpectator(player)) return;

    const itemId = itemStack.typeId;
    let nutrition = STAMINA_CONFIG.vanillaFoodNutrition?.[itemId] ?? 0;

    if (nutrition === 0) {
        const foodComponent = itemStack.getComponent('minecraft:food');
        if (foodComponent) {
            nutrition = foodComponent.nutrition;
        }
    }

    if (nutrition > 0) {
        const staminaRecovery = nutrition * STAMINA_CONFIG.foodRecoveryRatio;
        StaminaSystem.recoverStamina(player, staminaRecovery);
    }
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
