import { contextBridge, ipcRenderer } from "electron";

// Semantic Bridge: Professional, secure, and ready for future expansion.
contextBridge.exposeInMainWorld("api", {
  auth: {
    onCallback: (callback: (url: string) => void) => {
      const subscription = (_event: any, url: string) => callback(url);
      ipcRenderer.on("deep-link", subscription);

      return () => {
        ipcRenderer.removeListener("deep-link", subscription);
      };
    },
  },
});
