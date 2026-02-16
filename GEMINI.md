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
- **UI Refinement:** Implemented a dual-window "Pro" flow (PIP Timer -> Centered Save Window) with persistent bounds and Windows resizability fixes.

## ⚠️ Known Issues & Feedback
- **Missing Close Buttons:** The `SaveSessionPage` (Category Selector window) currently lacks a close button, making it hard to cancel.
- **PIP Hover State:** The close button in the PIP Timer is hidden on hover; consider making it more visible or persistent if requested.
- **Layout:** Ensure all windows utilize the `.app-container` and `4px` padding strategy for consistent Windows resizing support.

## 🚀 Next Steps

- **Migration Completion:**
  - Finish the **History page**: Port logic and UI from the chrome extension version.
  - Finish the **Stats page**: Port logic and UI from the chrome extension version.
  - Fix **Missing Close Buttons**: Add close/cancel buttons to the `SaveSessionPage`.
  - Refine **PIP Window**: Consider making the close button more persistent for better UX.
