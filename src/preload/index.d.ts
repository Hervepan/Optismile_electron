export interface IElectronAPI {
  settings: {
    getShortcut: () => Promise<string>;
    updateShortcut: (newShortcut: string) => Promise<boolean>;
  };
  auth: {
    openExternal: (url: string) => void;
    onCallback: (callback: (url: string) => void) => () => void;
    onShortcutPressed: (callback: () => void) => () => void;
  };
  timer: {
    finish: (duration: number) => void;
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
