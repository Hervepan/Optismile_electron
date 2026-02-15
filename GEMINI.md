# Optismile Electron: Operational Protocol & Project Memory

## 🛠 Asset & Pathing Protocol (CRITICAL)
*   **Renderer Assets:** Always use **relative paths** for images and assets in React components (e.g., `src="icons/logo.png"` instead of `src="/icons/logo.png"`). Absolute paths starting with `/` fail to resolve correctly under the `file://` protocol used in packaged Electron apps.
*   **Main Process Paths:** Use `join(__dirname, ...)` for all file resolutions to ensure compatibility across Dev and Production (ASAR) environments.
*   **Preload Extension:** In ESM projects (`"type": "module"`), the preload script must be referenced as `index.mjs` in the Main process `webPreferences`.

## 🏗 Architecture
*   **Stack:** Electron + Vite + React + Tailwind 4 + shadcn/ui.
*   **Bundling:** `electron-vite` v5+ (Externalization is automatic).
*   **Targets:** Windows NSIS and Portable EXE.
