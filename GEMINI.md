# Optismile Electron: Operational Protocol & Project Memory

you can always refer to the "chrome_extension_version" directory when trying to see what the project looked like, it's the old source code that i have from my chrome extension version, so you can refer to it at any time.

## 🛠 Asset & Pathing Protocol (CRITICAL)

- **Renderer Assets:** Always use **relative paths** for images and assets in React components (e.g., `src="icons/logo.png"` instead of `src="/icons/logo.png"`). Absolute paths starting with `/` fail to resolve correctly under the `file://` protocol used in packaged Electron apps.
- **Main Process Paths:** Use `join(__dirname, ...)` for all file resolutions to ensure compatibility across Dev and Production (ASAR) environments.
- **Preload Extension:** In ESM projects (`"type": "module"`), the preload script must be referenced as `index.mjs` in the Main process `webPreferences`.

## 🏗 Architecture

- **Stack:** Electron + Vite + React + Tailwind 4 + shadcn/ui.
- **Bundling:** `electron-vite` v5+ (Externalization is automatic).
- **Targets:** Windows NSIS and Portable EXE.
- **Build Workflow:** Always use `npm run build:win` for production artifacts. This runs a Linux-hosted Docker container with Wine to cross-compile the Windows binaries.

## ✅ Progress Log

- **Project Scaffolded:** Clean Electron-Vite setup with React 19 and Tailwind 4.
- **Build System Verified:** Successfully cross-compiled a Windows NSIS installer via Docker.
- **Asset Pathing:** Implemented relative pathing for renderer assets and robust native icon resolution.
- **UI Foundation:** Initial Login UI created and 15 shadcn/ui components installed/configured.
- **Protocol & Deep Linking:** `optismile://login-callback` registered and single-instance lock implemented with robust `.find()` argument parsing.
- **Authentication:** Supabase OAuth (Google) and Email/Password implemented with secure IPC bridge and `.env` support.

## 🚀 Next Steps

- **Session Focus: Supabase OAuth**
  - Port Supabase client and auth logic.
  - Implement the bridge between the browser OAuth flow and the Electron app.
  - Verify deep-link token handling (`optismile://auth-callback`) to ensure the session is correctly established in the native app.
