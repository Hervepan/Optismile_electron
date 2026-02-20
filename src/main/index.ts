import { app, BrowserWindow, ipcMain, globalShortcut, shell } from "electron";
import { join } from "path";
import { getConfig, saveConfig, resetConfig, resetNudgeConfig } from "@main/config";
import { windowManager } from "@main/windows";
import { trayManager } from "@main/tray";
import { activityManager } from "@main/activity";

// --- IPC Handlers ---

ipcMain.handle("reset-nudge-settings", () => {
  resetNudgeConfig();
  return true;
});

ipcMain.handle("reset-settings", () => {
  const newConfig = resetConfig();
  registerPipShortcut({ shortcut: newConfig.shortcut, camouflageShortcut: newConfig.camouflageShortcut });
  return true;
});

ipcMain.on("open-external-secure", (_event, url: string) => {
  if (/^https?:\/\//.test(url)) {
    shell.openExternal(url);
  }
});

ipcMain.on("timer-finished", (_event, duration: number) => {
  if (windowManager.activePipWindow && !windowManager.activePipWindow.isDestroyed()) {
    windowManager.activePipWindow.close();
  }
  windowManager.createSecondaryWindow('save', duration);
});

ipcMain.on("close-pip", () => {
  if (windowManager.activePipWindow && !windowManager.activePipWindow.isDestroyed()) {
    windowManager.activePipWindow.close();
  }
});

// ActivityManager now handles "session-saved" and "timer-status-change"
activityManager.init();

ipcMain.handle("update-shortcut", (_event, newShortcut: string) => {
  const config = getConfig();
  const success = registerPipShortcut({ shortcut: newShortcut, camouflageShortcut: config.camouflageShortcut });
  if (success) saveConfig({ shortcut: newShortcut });
  return success;
});

ipcMain.handle("get-shortcut", () => getConfig().shortcut);
ipcMain.handle("get-camouflage-shortcut", () => getConfig().camouflageShortcut);

ipcMain.handle("update-camouflage-shortcut", (_event, newShortcut: string) => {
  const config = getConfig();
  const success = registerPipShortcut({ shortcut: config.shortcut, camouflageShortcut: newShortcut });
  if (success) saveConfig({ camouflageShortcut: newShortcut });
  return success;
});

ipcMain.handle("get-nudge-seconds", () => getConfig().nudgeDelay);
ipcMain.handle("update-nudge-seconds", (_event, seconds: number) => {
  saveConfig({ nudgeDelay: seconds });
  return true;
});

ipcMain.handle("get-nudge-timeout", () => getConfig().nudgeTimeout);
ipcMain.handle("update-nudge-timeout", (_event, timeout: number) => {
  saveConfig({ nudgeTimeout: timeout });
  return true;
});

function registerPipShortcut(config: { shortcut: string; camouflageShortcut: string }) {
  globalShortcut.unregisterAll();
  try {
    if (config.shortcut) {
      globalShortcut.register(config.shortcut, () => {
        if (windowManager.activePipWindow && !windowManager.activePipWindow.isDestroyed()) {
          windowManager.activePipWindow.webContents.send("shortcut-pressed");
        } else {
          windowManager.createSecondaryWindow('pip');
        }
      });
    }

    if (config.camouflageShortcut) {
      globalShortcut.register(config.camouflageShortcut, () => {
        if (windowManager.activePipWindow && !windowManager.activePipWindow.isDestroyed()) {
          windowManager.activePipWindow.webContents.send("toggle-camouflage");
        }
      });
    }
    return true;
  } catch (e) { return false; }
}

// --- Deep Linking & Lifecycle ---

function handleDeepLink(url: string) {
  const main = windowManager.getMainWindow();
  if (main) {
    if (main.isMinimized()) main.restore();
    main.focus();
    main.webContents.send("deep-link", url);
  }
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('optismile', process.execPath, [join(__dirname, "../../")])
  }
} else {
  app.setAsDefaultProtocolClient('optismile')
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const url = argv.find(arg => arg.startsWith('optismile://'));
    if (url) {
      handleDeepLink(url);
    } else {
      const main = windowManager.getMainWindow();
      if (main) {
        if (main.isMinimized()) main.restore();
        main.focus();
      }
    }
  });

  app.on('open-url', (_event, url) => {
    handleDeepLink(url);
  });

  app.whenReady().then(() => {
    windowManager.createMainWindow();
    trayManager.createTray();
    const config = getConfig();
    registerPipShortcut({ shortcut: config.shortcut, camouflageShortcut: config.camouflageShortcut });
  });
}

app.on("window-all-closed", () => {
  if (process.platform === "darwin") {
    app.dock?.hide();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
