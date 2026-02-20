import { contextBridge, ipcRenderer } from "electron";

// Semantic Bridge: Professional, secure, and ready for future expansion.
contextBridge.exposeInMainWorld("api", {
  settings: {
    getShortcut: () => ipcRenderer.invoke("get-shortcut"),
    updateShortcut: (newShortcut: string) => ipcRenderer.invoke("update-shortcut", newShortcut),
    getCamouflageShortcut: () => ipcRenderer.invoke("get-camouflage-shortcut"),
    updateCamouflageShortcut: (newShortcut: string) => ipcRenderer.invoke("update-camouflage-shortcut", newShortcut),
    getNudgeSeconds: () => ipcRenderer.invoke("get-nudge-seconds"),
    updateNudgeSeconds: (seconds: number) => ipcRenderer.invoke("update-nudge-seconds", seconds),
    getNudgeTimeout: () => ipcRenderer.invoke("get-nudge-timeout"),
    updateNudgeTimeout: (timeout: number) => ipcRenderer.invoke("update-nudge-timeout", timeout),
    resetNudgeSettings: () => ipcRenderer.invoke("reset-nudge-settings"),
    resetSettings: () => ipcRenderer.invoke("reset-settings"),
  },
  auth: {
    openExternal: (url: string) =>
      ipcRenderer.send("open-external-secure", url),
    onCallback: (callback: (url: string) => void) => {
      const subscription = (_event: any, url: string) => callback(url);
      ipcRenderer.on("deep-link", subscription);

      return () => {
        ipcRenderer.removeListener("deep-link", subscription);
      };
    },
    onShortcutPressed: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on("shortcut-pressed", subscription);
      return () => {
        ipcRenderer.removeListener("shortcut-pressed", subscription);
      };
    },
    onSessionSaved: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on("session-saved-success", subscription);
      return () => {
        ipcRenderer.removeListener("session-saved-success", subscription);
      };
    },
    getPendingDeepLink: () => ipcRenderer.invoke("get-pending-deeplink"),
  },
  timer: {
    finish: (duration: number) => ipcRenderer.send("timer-finished", duration),
    close: () => ipcRenderer.send("close-pip"),
    updateStatus: (isRunning: boolean) => ipcRenderer.send("timer-status-change", isRunning),
    onNudge: (callback: (type: string) => void) => {
      const subscription = (_event: any, type: string) => callback(type);
      ipcRenderer.on("show-nudge", subscription);
      return () => ipcRenderer.removeListener("show-nudge", subscription);
    },
    onToggleCamouflage: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on("toggle-camouflage", subscription);
      return () => ipcRenderer.removeListener("toggle-camouflage", subscription);
    }
  },
  session: {
    saved: () => ipcRenderer.send("session-saved"),
  }
});
