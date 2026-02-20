import { BrowserWindow, screen, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { getConfig, saveConfig } from "@main/config";
import { debounce } from "@main/utils";
import { getIsQuitting } from "@main/index";

export type WindowMode = "pip" | "save";

export class WindowManager {
  public mainWindowId: number | null = null;
  public activePipWindow: BrowserWindow | null = null;
  public activeSaveWindow: BrowserWindow | null = null;

  private preloadPath = join(__dirname, "../preload/index.mjs");
  private ALLOWED_AUTH_DOMAIN = process.env.VITE_SUPABASE_URL || "";

  createMainWindow() {
    const iconPath = join(__dirname, "../../resources/icon.png");

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

    mainWindow.once("ready-to-show", () => {
      mainWindow.maximize();
      mainWindow.show();
    });

    // Hide on Close behavior
    mainWindow.on("close", (e) => {
      if (!getIsQuitting()) {
        e.preventDefault();
        mainWindow.hide();
      }
    });

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

  createSecondaryWindow(mode: WindowMode, duration?: number, nudge?: string) {
    const isPip = mode === "pip";

    const existingSame = isPip ? this.activePipWindow : this.activeSaveWindow;
    if (existingSame && !existingSame.isDestroyed()) {
      if (nudge) existingSame.webContents.send("show-nudge", nudge);
      existingSame.focus();
      return existingSame;
    }

    if (
      isPip &&
      !nudge &&
      this.activeSaveWindow &&
      !this.activeSaveWindow.isDestroyed()
    ) {
      this.activeSaveWindow.focus();
      return this.activeSaveWindow;
    }

    const config = getConfig();
    const configKey = isPip ? "pipBounds" : "saveBounds";
    const savedBounds = config[configKey];

    const width = savedBounds?.width ?? (isPip ? 330 : 650);
    const height = savedBounds?.height ?? (isPip ? 220 : 650);

    const activeDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const { x: dx, y: dy, width: dw, height: dh } = activeDisplay.workArea;

    const defaultX = isPip ? dx + dw - width - 20 : dx + (dw - width) / 2;
    const defaultY = isPip ? dy + dh - height - 20 : dy + (dh - height) / 2;

    const initialX = savedBounds ? savedBounds.x : Math.round(defaultX);
    const initialY = savedBounds ? savedBounds.y : Math.round(defaultY);

    const win = new BrowserWindow({
      x: initialX,
      y: initialY,
      width,
      height,
      show: false,
      frame: false,
      transparent: false,
      resizable: true,
      alwaysOnTop: true,
      hasShadow: true,
      thickFrame: true,
      backgroundColor: "#ffffff",
      webPreferences: {
        preload: this.preloadPath,
        sandbox: false,
      },
    });

    win.setMinimumSize(200, isPip ? 80 : 450);
    win.once("ready-to-show", () => win.show());

    const debouncedSaveBounds = debounce(() => {
      if (!win.isDestroyed()) {
        saveConfig({ [configKey]: win.getBounds() });
      }
    }, 500);

    win.on("moved", debouncedSaveBounds);
    win.on("resized", debouncedSaveBounds);

    const rendererUrl = process.env["ELECTRON_RENDERER_URL"];
    const durationParam = duration !== undefined ? `&duration=${duration}` : "";
    const nudgeParam = nudge ? `&nudge=${nudge}` : "";
    const queryParams = `?mode=${mode}${durationParam}${nudgeParam}`;

    if (is.dev && rendererUrl) {
      win.loadURL(`${rendererUrl}${queryParams}`);
    } else {
      const indexPath = join(__dirname, "../renderer/index.html");
      const query: Record<string, string> = { mode };
      if (duration !== undefined) query.duration = duration.toString();
      if (nudge !== undefined) query.nudge = nudge;

      win.loadFile(indexPath, { query });
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
