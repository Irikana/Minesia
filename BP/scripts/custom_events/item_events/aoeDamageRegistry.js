// aoeDamageRegistry.js
// ===============================
// AOE伤害记录注册中心
// 用于统一管理所有AOE伤害记录
// ===============================

import { system } from "@minecraft/server";

const aoeDamageRecords = new Map();
const aoeProcessingEntities = new Set();

export function registerAoeDamage(playerId, data) {
    const tick = system.currentTick;

    aoeDamageRecords.set(playerId, {
        source: data.source,
        sourceName: data.sourceName,
        sourceNameEn: data.sourceNameEn,
        totalDamage: data.totalDamage,
        targetCount: data.targetCount,
        tick: tick,
        timestamp: Date.now()
    });

    system.runTimeout(() => {
        const record = aoeDamageRecords.get(playerId);
        if (record && record.tick === tick) {
            aoeDamageRecords.delete(playerId);
        }
    }, 100);
}

export function getAoeDamageRecord(playerId) {
    return aoeDamageRecords.get(playerId);
}

export function hasAoeDamageRecord(playerId) {
    return aoeDamageRecords.has(playerId);
}

export function clearAoeDamageRecord(playerId) {
    aoeDamageRecords.delete(playerId);
}

export function beginAoeEntity(entityId) {
    aoeProcessingEntities.add(entityId);
}

export function endAoeEntity(entityId) {
    aoeProcessingEntities.delete(entityId);
}

export function isAoeEntity(entityId) {
    return aoeProcessingEntities.has(entityId);
}
