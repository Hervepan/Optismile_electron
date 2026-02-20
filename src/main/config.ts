import { app, Rectangle } from "electron";
import { join } from "path";
import fs from "fs";

export interface AppConfig {
  shortcut: string;
  camouflageShortcut: string;
  nudgeDelay: number;    // in seconds (How long to wait before nudge)
  nudgeTimeout: number;  // in seconds (How long nudge stays visible)
  pipBounds?: Rectangle;
  saveBounds?: Rectangle;
}

const CONFIG_PATH = join(app.getPath("userData"), "config.json");

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const defaultConfig: AppConfig = { 
    shortcut: "Alt+J",
    camouflageShortcut: "Alt+K",
    nudgeDelay: 300, // 5 minutes in seconds
    nudgeTimeout: 300 // 5 minutes in seconds
  };
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(data);
      
      // Migration: Map old nudgeDuration (mins) to nudgeDelay (secs)
      if (parsed.nudgeDuration !== undefined && parsed.nudgeDelay === undefined) {
        parsed.nudgeDelay = parsed.nudgeDuration * 60;
        delete parsed.nudgeDuration;
      }

      cachedConfig = { ...defaultConfig, ...parsed };
      return cachedConfig!;
    }
  } catch (e) {
    console.error("Failed to read config:", e);
  }
  
  cachedConfig = defaultConfig;
  return cachedConfig;
}

export function saveConfig(update: Partial<AppConfig>) {
  try {
    const current = getConfig();
    const newConfig = { ...current, ...update };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    cachedConfig = newConfig; // Update cache
  } catch (e) {}
}

export function resetNudgeConfig() {
  const defaults = {
    nudgeDelay: 300,
    nudgeTimeout: 300
  };
  saveConfig(defaults);
  return defaults;
}

export function resetConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    cachedConfig = null; // Clear cache so getConfig returns defaults
    return getConfig();
  } catch (e) {
    return getConfig();
  }
}
