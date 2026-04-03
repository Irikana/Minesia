import { world, system, EquipmentSlot, BlockPermutation } from "@minecraft/server";
import { LIGHT_ITEM_CONFIG, DYNAMIC_LIGHT_CONFIG } from "./config.js";
import { debug } from "../debug/debugManager.js";

const playerLightSources = new Map();
let tickCounter = 0;

function getLightLevel(item) {
    if (!item) return 0;
    return LIGHT_ITEM_CONFIG[item.typeId] || 0;
}

function getHeldLightLevel(player) {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return 0;

    const mainhandItem = equippable.getEquipment(EquipmentSlot.Mainhand);
    const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);

    const mainhandLevel = getLightLevel(mainhandItem);
    const offhandLevel = getLightLevel(offhandItem);

    return Math.max(mainhandLevel, offhandLevel);
}

function createLightBlock(level) {
    try {
        const blockLevel = Math.min(15, Math.max(0, Math.floor(level)));
        return BlockPermutation.resolve(`${DYNAMIC_LIGHT_CONFIG.lightBlockId}_${blockLevel}`);
    } catch (error) {
        debug.logWarning("DynamicLight", `创建光源方块失败: ${error}`);
        return null;
    }
}

function placeLightBlock(dimension, location, level) {
    try {
        const block = dimension.getBlock(location);
        if (!block) return false;

        const currentBlock = block.typeId;
        if (currentBlock !== "minecraft:air" && !currentBlock.startsWith("minecraft:light_block")) {
            return false;
        }

        const permutation = createLightBlock(level);
        if (!permutation) return false;

        block.setPermutation(permutation);
        return true;
    } catch (error) {
        debug.logWarning("DynamicLight", `放置光源方块失败: ${error}`);
        return false;
    }
}

function removeLightBlock(dimension, location) {
    try {
        const block = dimension.getBlock(location);
        if (!block) return false;

        const currentBlock = block.typeId;
        if (currentBlock.startsWith("minecraft:light_block")) {
            block.setType("minecraft:air");
            return true;
        }
        return false;
    } catch (error) {
        debug.logWarning("DynamicLight", `移除光源方块失败: ${error}`);
        return false;
    }
}

function updatePlayerLight(player) {
    const playerId = player.id;
    const dimension = player.dimension;
    const currentLocation = player.location;

    const floorLocation = {
        x: Math.floor(currentLocation.x),
        y: Math.floor(currentLocation.y),
        z: Math.floor(currentLocation.z)
    };

    const lightLevel = getHeldLightLevel(player);
    const previousSource = playerLightSources.get(playerId);

    if (lightLevel === 0) {
        if (previousSource) {
            removeLightBlock(dimension, previousSource.location);
            playerLightSources.delete(playerId);
        }
        return;
    }

    const newLocation = floorLocation;

    if (previousSource) {
        const prevLoc = previousSource.location;
        if (prevLoc.x === newLocation.x && prevLoc.y === newLocation.y && prevLoc.z === newLocation.z) {
            if (previousSource.level !== lightLevel) {
                placeLightBlock(dimension, newLocation, lightLevel);
                playerLightSources.set(playerId, { location: newLocation, level: lightLevel });
            }
            return;
        }

        removeLightBlock(dimension, prevLoc);
    }

    if (placeLightBlock(dimension, newLocation, lightLevel)) {
        playerLightSources.set(playerId, { location: newLocation, level: lightLevel });
    }
}

export function updateDynamicLightSystem() {
    tickCounter++;
    if (tickCounter < DYNAMIC_LIGHT_CONFIG.updateInterval) {
        return;
    }
    tickCounter = 0;

    const players = world.getPlayers();

    for (const player of players) {
        try {
            updatePlayerLight(player);
        } catch (error) {
            debug.logError("DynamicLight", `更新玩家 ${player.name} 光源时出错: ${error}`);
        }
    }
}

export function cleanupPlayerLight(playerId, dimension) {
    const source = playerLightSources.get(playerId);
    if (source) {
        try {
            removeLightBlock(dimension, source.location);
        } catch (error) {
            // 忽略清理错误
        }
        playerLightSources.delete(playerId);
    }
}

export function initializeDynamicLightSystem() {
    world.beforeEvents.playerLeave.subscribe((event) => {
        if (event.player) {
            const source = playerLightSources.get(event.player.id);
            if (source) {
                system.runTimeout(() => {
                    try {
                        const dimension = world.getDimension(event.player.dimension);
                        removeLightBlock(dimension, source.location);
                    } catch (error) {
                        // 忽略
                    }
                }, 1);
            }
            playerLightSources.delete(event.player.id);
        }
    });

    debug.logWithTag("DynamicLight", "动态光源系统初始化完成");
}
