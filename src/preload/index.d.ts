export interface IElectronAPI {
  settings: {
    getShortcut: () => Promise<string>;
    updateShortcut: (newShortcut: string) => Promise<boolean>;
    getCamouflageShortcut: () => Promise<string>;
    updateCamouflageShortcut: (newShortcut: string) => Promise<boolean>;
    getNudgeSeconds: () => Promise<number>;
    updateNudgeSeconds: (seconds: number) => Promise<boolean>;
    getNudgeTimeout: () => Promise<number>;
    updateNudgeTimeout: (timeout: number) => Promise<boolean>;
    resetNudgeSettings: () => Promise<boolean>;
    resetSettings: () => Promise<boolean>;
  };
  auth: {
    openExternal: (url: string) => void;
    onCallback: (callback: (url: string) => void) => () => void;
    onShortcutPressed: (callback: () => void) => () => void;
    onSessionSaved: (callback: () => void) => () => void;
  };
  timer: {
    finish: (duration: number) => void;
    close: () => void;
    updateStatus: (isRunning: boolean) => void;
    onNudge: (callback: (type: string) => void) => () => void;
    onToggleCamouflage: (callback: () => void) => () => void;
  };
  session: {
    saved: () => void;
  };
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
