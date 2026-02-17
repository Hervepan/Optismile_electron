import { Tray, Menu, nativeImage, app } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { windowManager } from "@main/windows";

export class TrayManager {
  private tray: Tray | null = null;

  public createTray() {
    if (this.tray) return;

    const iconPath = is.dev 
      ? join(__dirname, "../../resources/icon.png") 
      : join(__dirname, "../renderer/icons/optismile.png");
    
    // Process icon for System Tray (usually needs to be small)
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    this.tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Open Dashboard', 
        click: () => this.showDashboard()
      },
      { type: 'separator' },
      { 
        label: 'Quit Optismile', 
        click: () => app.quit() 
      }
    ]);

    this.tray.setToolTip('Optismile');
    this.tray.setContextMenu(contextMenu);

    this.tray.on('double-click', () => this.showDashboard());
  }

  private showDashboard() {
    const main = windowManager.getMainWindow();
    if (main) {
      if (main.isMinimized()) main.restore();
      main.show();
      main.focus();
    } else {
      windowManager.createMainWindow();
    }
  }
}

export const trayManager = new TrayManager();
