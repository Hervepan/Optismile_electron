import { app, Rectangle } from "electron";
import { join } from "path";
import fs from "fs";

export interface AppConfig {
  shortcut: string;
  nudgeDuration: number; // in minutes
  pipBounds?: Rectangle;
  saveBounds?: Rectangle;
}

const CONFIG_PATH = join(app.getPath("userData"), "config.json");

export function getConfig(): AppConfig {
  const defaultConfig: AppConfig = { 
    shortcut: "Alt+J",
    nudgeDuration: 5
  };
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return { ...defaultConfig, ...parsed };
    }
  } catch (e) {
    console.error("Failed to read config:", e);
  }
  return defaultConfig;
}

export function saveConfig(update: Partial<AppConfig>) {
  try {
    const current = getConfig();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...current, ...update }, null, 2));
  } catch (e) {}
}
