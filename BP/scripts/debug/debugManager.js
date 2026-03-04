import { world, system } from "@minecraft/server";

let isDebugEnabled = false;

const DEBUG_PREFIX = "§7[§eMinesia Debug§7]§r";

export const debug = {
    isEnabled() {
        return isDebugEnabled;
    },

    enable() {
        isDebugEnabled = true;
        world.sendMessage(`${DEBUG_PREFIX} §a调试模式已开启`);
    },

    disable() {
        isDebugEnabled = false;
        world.sendMessage(`${DEBUG_PREFIX} §c调试模式已关闭`);
    },

    toggle() {
        if (isDebugEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return isDebugEnabled;
    },

    log(message) {
        if (!isDebugEnabled) return;
        world.sendMessage(`${DEBUG_PREFIX} ${message}`);
    },

    logPlayer(player, message) {
        if (!isDebugEnabled) return;
        player.sendMessage(`${DEBUG_PREFIX} ${message}`);
    },

    logWithTag(tag, message) {
        if (!isDebugEnabled) return;
        world.sendMessage(`${DEBUG_PREFIX} §b[${tag}]§r ${message}`);
    },

    logError(tag, message) {
        world.sendMessage(`${DEBUG_PREFIX} §c[${tag}] 错误: ${message}§r`);
    },

    logWarning(tag, message) {
        if (!isDebugEnabled) return;
        world.sendMessage(`${DEBUG_PREFIX} §e[${tag}] 警告: ${message}§r`);
    },

    status() {
        const status = isDebugEnabled ? "§a开启" : "§c关闭";
        world.sendMessage(`${DEBUG_PREFIX} 调试模式状态: ${status}§r`);
        return isDebugEnabled;
    }
};

export function initializeDebugSystem() {
    if (world.afterEvents.scriptEventReceive) {
        world.afterEvents.scriptEventReceive.subscribe((event) => {
            const { id, sourceEntity } = event;

            switch (id) {
                case "minesia:debug_on":
                    debug.enable();
                    break;
                case "minesia:debug_off":
                    debug.disable();
                    break;
                case "minesia:debug_toggle":
                    debug.toggle();
                    break;
                case "minesia:debug_status":
                    debug.status();
                    break;
            }
        });
    }

    console.log("[Minesia] 调试系统已初始化");
    return debug;
}

export default debug;
