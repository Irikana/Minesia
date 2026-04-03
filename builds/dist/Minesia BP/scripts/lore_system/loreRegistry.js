// loreRegistry.js
// ===============================
// Lore处理器注册中心
// 各模块通过此注册中心注册自己的Lore处理器
// ===============================

import { debug } from "../debug/debugManager.js";

const loreHandlers = new Map();

export const LoreRegistry = {
    register(handlerId, handler) {
        if (!handlerId || typeof handlerId !== 'string') {
            debug.logError("LoreRegistry", "无效的处理器ID");
            return false;
        }

        if (!handler || typeof handler.canHandle !== 'function' || typeof handler.generateLore !== 'function') {
            debug.logError("LoreRegistry", "处理器必须包含 canHandle 和 generateLore 方法");
            return false;
        }

        if (loreHandlers.has(handlerId)) {
            debug.logWarning("LoreRegistry", `处理器 "${handlerId}" 已存在，将被覆盖`);
        }

        loreHandlers.set(handlerId, {
            id: handlerId,
            priority: handler.priority ?? 100,
            canHandle: handler.canHandle,
            generateLore: handler.generateLore,
            hasLore: handler.hasLore,
            description: handler.description ?? handlerId
        });

        return true;
    },

    unregister(handlerId) {
        return loreHandlers.delete(handlerId);
    },

    getHandler(handlerId) {
        return loreHandlers.get(handlerId);
    },

    getAllHandlers() {
        return Array.from(loreHandlers.values()).sort((a, b) => a.priority - b.priority);
    },

    getHandlersForItem(itemStack, context = {}) {
        const handlers = [];
        for (const handler of this.getAllHandlers()) {
            try {
                if (handler.canHandle(itemStack, context)) {
                    handlers.push(handler);
                }
            } catch (error) {
                debug.logError("LoreRegistry", `处理器 ${handler.id} canHandle 出错: ${error?.message ?? error}`);
            }
        }
        return handlers;
    },

    hasRegisteredHandlers() {
        return loreHandlers.size > 0;
    },

    getHandlerCount() {
        return loreHandlers.size;
    }
};
