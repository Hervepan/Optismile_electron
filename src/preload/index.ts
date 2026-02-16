import { contextBridge, ipcRenderer } from "electron";

// Semantic Bridge: Professional, secure, and ready for future expansion.
contextBridge.exposeInMainWorld("api", {
  settings: {
    getShortcut: () => ipcRenderer.invoke("get-shortcut"),
    updateShortcut: (newShortcut: string) => ipcRenderer.invoke("update-shortcut", newShortcut),
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
    }
  },
  timer: {
    finish: (duration: number) => ipcRenderer.send("timer-finished", duration),
  },
  session: {
    saved: () => ipcRenderer.send("session-saved"),
  }
});
