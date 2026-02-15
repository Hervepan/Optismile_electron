import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

const ALLOWED_AUTH_DOMAIN = "https://retnqcifgczqyygruima.supabase.co";

// Register 'optismile' as the default protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("optismile", process.execPath, [
      join(__dirname, process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("optismile");
}

function createWindow() {
  // Path to the icon that works in both dev and production
  const iconPath = is.dev 
    ? join(__dirname, "../../resources/icon.png") 
    : join(__dirname, "../renderer/icons/optismile.png")

  const mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    show: false,
    autoHideMenuBar: true,
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
        console.log("Deep link received (second instance):", url);
        mainWindow.webContents.send("deep-link", url);
      }
    }
  });

  app.whenReady().then(() => {
    createWindow();

    // Handle protocol launch on Windows/Linux
    const url = process.argv.find((arg) => arg.startsWith("optismile://login-callback"));
    if (url) {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.on("did-finish-load", () => {
          mainWindow.webContents.send("deep-link", url);
        });
      }
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
