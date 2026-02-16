import { app, BrowserWindow, ipcMain, globalShortcut, shell } from "electron";
import { join } from "path";
import { getConfig, saveConfig } from "./config";
import { windowManager } from "./windows";

// --- IPC Handlers ---

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

ipcMain.on("session-saved", () => {
  if (windowManager.activeSaveWindow && !windowManager.activeSaveWindow.isDestroyed()) {
    windowManager.activeSaveWindow.close();
  }
});

ipcMain.handle("update-shortcut", (_event, newShortcut: string) => {
  const success = registerPipShortcut(newShortcut);
  if (success) saveConfig({ shortcut: newShortcut });
  return success;
});

ipcMain.handle("get-shortcut", () => getConfig().shortcut);

function registerPipShortcut(shortcut: string) {
  globalShortcut.unregisterAll();
  try {
    return globalShortcut.register(shortcut, () => {
      if (windowManager.activePipWindow && !windowManager.activePipWindow.isDestroyed()) {
        windowManager.activePipWindow.webContents.send("shortcut-pressed");
      } else {
        windowManager.createSecondaryWindow('pip');
      }
    });
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
    registerPipShortcut(getConfig().shortcut || "Alt+J");
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
