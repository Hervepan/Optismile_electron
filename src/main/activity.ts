import { ipcMain } from "electron";
import { windowManager } from "./windows";
import { getConfig } from "./config";

class ActivityManager {
  private isTimerRunning = false;
  private lastNudgeTime = Date.now(); // Start cooldown from launch
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Track timer state from renderer
    ipcMain.on("timer-status-change", (_event, isRunning: boolean) => {
      this.isTimerRunning = isRunning;
    });

    // Handle session saved - trigger "Next Patient" nudge immediately
    ipcMain.on("session-saved", () => {
      if (
        windowManager.activeSaveWindow &&
        !windowManager.activeSaveWindow.isDestroyed()
      ) {
        windowManager.activeSaveWindow.close();
        windowManager.activeSaveWindow = null;
      }

      // Notify ALL windows (especially the Dashboard) that a save happened
      const allWindows = [
        windowManager.getMainWindow(),
        windowManager.activePipWindow,
        windowManager.activeSaveWindow
      ];
      
      allWindows.forEach(win => {
        if (win && !win.isDestroyed()) {
          win.webContents.send("session-saved-success");
        }
      });

      this.triggerNudge("ready-for-next");
    });

    // Check state frequently (every 1s) for deterministic nudges
    setInterval(() => {
      this.checkActivity();
    }, 1000);
  }

  private checkActivity() {
    // Are we currently doing something?
    const isBusy =
      this.isTimerRunning ||
      (windowManager.activeSaveWindow &&
        !windowManager.activeSaveWindow.isDestroyed()) ||
      (windowManager.activePipWindow &&
        !windowManager.activePipWindow.isDestroyed());

    if (isBusy) {
      // While busy, keep pushing the next nudge time forward.
      // This means the 5m countdown starts only AFTER all windows are closed.
      this.lastNudgeTime = Date.now();
      return;
    }

    const now = Date.now();
    const config = getConfig();
    const nudgeCooldownMs = (config.nudgeDelay || 300) * 1000;

    // If we've been "doing nothing" for the configured duration, trigger the nudge
    if (now - this.lastNudgeTime >= nudgeCooldownMs) {
      this.triggerNudge("activity-detected");
    }
  }

  private triggerNudge(type: "ready-for-next" | "activity-detected") {
    this.lastNudgeTime = Date.now();

    if (
      windowManager.activePipWindow &&
      !windowManager.activePipWindow.isDestroyed()
    ) {
      windowManager.activePipWindow.webContents.send("show-nudge", type);
      windowManager.activePipWindow.focus();
    } else {
      windowManager.createSecondaryWindow("pip", undefined, type);
    }
  }

  resetCooldown() {
    this.lastNudgeTime = Date.now();
  }
}

export const activityManager = new ActivityManager();
