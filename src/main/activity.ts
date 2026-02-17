import { ipcMain, powerMonitor } from "electron";
import { windowManager } from "./windows";

class ActivityManager {
    private isTimerRunning = false;
    private lastNudgeTime = 0;
    private nudgeCooldown = 30 * 60 * 1000; // 30 minutes
    private idleThreshold = 5 * 60; // 5 minutes in seconds

    init() {
        // Track timer state from renderer
        ipcMain.on("timer-status-change", (_event, isRunning: boolean) => {
            this.isTimerRunning = isRunning;
        });

        // Handle session saved - trigger "Next Patient" nudge
        ipcMain.on("session-saved", () => {
            if (windowManager.activeSaveWindow && !windowManager.activeSaveWindow.isDestroyed()) {
                windowManager.activeSaveWindow.close();
                windowManager.activeSaveWindow = null; // Immediate nullification
            }
            this.triggerNudge("ready-for-next");
        });

        // Monitor activity
        setInterval(() => {
            this.checkActivity();
        }, 60000); // Check every minute
    }

    private checkActivity() {
        if (this.isTimerRunning) return;

        const idleTime = powerMonitor.getSystemIdleTime();
        
        // If user was idle and is now back (Presence Detection)
        // Or if user has been active for a while without a timer
        // We check if we are within cooldown
        const now = Date.now();
        if (now - this.lastNudgeTime < this.nudgeCooldown) return;

        // Simple logic: If they are NOT idle (idle < 60s) but were likely idle before
        // or just active without timer. 
        // For simplicity: If not idle and timer off, and cooldown passed.
        if (idleTime < 30) { 
            this.triggerNudge("activity-detected");
        }
    }

    private triggerNudge(type: "ready-for-next" | "activity-detected") {
        this.lastNudgeTime = Date.now();
        
        // Ensure PIP window exists or create it in nudge mode
        if (windowManager.activePipWindow && !windowManager.activePipWindow.isDestroyed()) {
            windowManager.activePipWindow.webContents.send("show-nudge", type);
            windowManager.activePipWindow.focus();
        } else {
            windowManager.createSecondaryWindow('pip', undefined, type);
        }
    }

    resetCooldown() {
        this.lastNudgeTime = 0;
    }
}

export const activityManager = new ActivityManager();
