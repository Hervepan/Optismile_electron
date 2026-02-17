import { BrowserWindow, screen, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { getConfig, saveConfig } from "@main/config";

export type WindowMode = 'pip' | 'save';

export class WindowManager {
  public mainWindowId: number | null = null;
  public activePipWindow: BrowserWindow | null = null;
  public activeSaveWindow: BrowserWindow | null = null;

  private preloadPath = join(__dirname, "../preload/index.mjs");
  private ALLOWED_AUTH_DOMAIN = process.env.VITE_SUPABASE_URL || "";

  createMainWindow() {
    const iconPath = is.dev 
      ? join(__dirname, "../../resources/icon.png") 
      : join(__dirname, "../renderer/icons/optismile.png")

    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      icon: iconPath,
      webPreferences: {
        preload: this.preloadPath,
        sandbox: false,
      },
    });

    this.mainWindowId = mainWindow.id;
    mainWindow.maximize();

    mainWindow.once("ready-to-show", () => mainWindow.show());

    mainWindow.webContents.setWindowOpenHandler((details) => {
      if (details.url.startsWith(this.ALLOWED_AUTH_DOMAIN)) {
        shell.openExternal(details.url);
      }
      return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }

    return mainWindow;
  }

  createSecondaryWindow(mode: WindowMode, duration?: number) {
    const isPip = mode === 'pip';
    
    // Pro Navigation Guard: 
    // 1. Focus existing window of the same mode
    const existingSame = isPip ? this.activePipWindow : this.activeSaveWindow;
    if (existingSame && !existingSame.isDestroyed()) {
      existingSame.focus();
      return existingSame;
    }

    // 2. Cross-mode Guard: Don't allow a new Timer if a Save window is still open
    if (isPip && this.activeSaveWindow && !this.activeSaveWindow.isDestroyed()) {
      this.activeSaveWindow.focus();
      return this.activeSaveWindow;
    }

    const config = getConfig();
    const configKey = isPip ? 'pipBounds' : 'saveBounds';
    const savedBounds = config[configKey];

    const width = savedBounds?.width ?? (isPip ? 400 : 650);
    const height = savedBounds?.height ?? (isPip ? 120 : 650);

    const activeDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const { x: dx, y: dy, width: dw, height: dh } = activeDisplay.workArea;
    
    const defaultX = isPip ? (dx + dw - width - 20) : (dx + (dw - width) / 2);
    const defaultY = isPip ? (dy + dh - height - 20) : (dy + (dh - height) / 2);

    const win = new BrowserWindow({
      x: savedBounds?.x ?? Math.round(defaultX),
      y: savedBounds?.y ?? Math.round(defaultY),
      width,
      height,
      show: false,
      frame: false,
      transparent: false,
      resizable: true,
      alwaysOnTop: isPip,
      hasShadow: true,
      thickFrame: true,
      backgroundColor: "#ffffff",
      webPreferences: { 
        preload: this.preloadPath, 
        sandbox: false 
      },
    });

    win.setMinimumSize(200, isPip ? 80 : 450);

    win.once("ready-to-show", () => {
      win.show();
      if (isPip) win.setAlwaysOnTop(true, "screen-saver");
    });

    const saveBounds = () => {
      if (!win.isDestroyed()) {
        saveConfig({ [configKey]: win.getBounds() });
      }
    };
    win.on("moved", saveBounds);
    win.on("resized", saveBounds);

    const rendererUrl = process.env["ELECTRON_RENDERER_URL"];
    const durationParam = duration !== undefined ? `&duration=${duration}` : '';
    
    if (is.dev && rendererUrl) {
      win.loadURL(`${rendererUrl}?mode=${mode}${durationParam}`);
    } else {
      const indexPath = join(__dirname, "../renderer/index.html");
      win.loadURL(`file://${indexPath}?mode=${mode}${durationParam}`);
    }

    if (isPip) {
        this.activePipWindow = win;
        win.on("closed", () => { this.activePipWindow = null; });
    } else {
        this.activeSaveWindow = win;
        win.on("closed", () => { this.activeSaveWindow = null; });
    }

    return win;
  }

  getMainWindow() {
    return this.mainWindowId ? BrowserWindow.fromId(this.mainWindowId) : null;
  }
}

export const windowManager = new WindowManager();
