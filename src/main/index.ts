import { app, BrowserWindow, shell, ipcMain, globalShortcut } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

const ALLOWED_AUTH_DOMAIN = "https://retnqcifgczqyygruima.supabase.co";

function createWindow() {
  const iconPath = is.dev 
    ? join(__dirname, "../../resources/icon.png") 
    : join(__dirname, "../renderer/icons/optismile.png")

  const mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    fullscreen: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // Security: Handle external links (General)
  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith(ALLOWED_AUTH_DOMAIN)) {
      shell.openExternal(details.url);
    }
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function createPipWindow() {
  const pipWindow = new BrowserWindow({
    width: 350,
    height: 120,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: true,
    hasShadow: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  // Center on screen or position bottom right
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  pipWindow.setPosition(width - 370, height - 150);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    pipWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}?mode=pip`);
  } else {
    pipWindow.loadFile(join(__dirname, "../renderer/index.html"), { query: { mode: 'pip' } });
  }
}

// IPC Handlers
ipcMain.on("open-external-secure", (_event, url: string) => {
  if (url.startsWith(ALLOWED_AUTH_DOMAIN)) {
    shell.openExternal(url);
  } else {
    console.warn("Blocked attempt to open unauthorized URL:", url);
  }
});

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_, commandLine) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const url = commandLine.find((arg) => arg.startsWith("optismile://login-callback"));
      if (url) {
        mainWindow.webContents.send("deep-link", url);
      }
    }
  });

  app.whenReady().then(() => {
    createWindow();

    // Register Alt+V as the global shortcut
    globalShortcut.register('Alt+V', () => {
      createPipWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
