# Optismile Electron: Operational Protocol & Project Memory

you can always refer to the "chrome_extension_version" directory when trying to see what the project looked like, it's the old source code that i have from my chrome extension version, so you can refer to it at any time.

## 🛠 Asset & Pathing Protocol (CRITICAL)

- **Renderer Assets:** Always use **relative paths** for images and assets in React components (e.g., `src="icons/logo.png"` instead of `src="/icons/logo.png"`). Absolute paths starting with `/` fail to resolve correctly under the `file://` protocol used in packaged Electron apps.
- **Path Aliases:** Strictly enforced for all imports across the codebase.
    - **Renderer:** `@/` (src/renderer/src), `@lib/`, `@hooks/`, `@components/`
    - **Main Process:** `@main/` (src/main)
    - **Preload:** `@preload/` (src/preload)
- **Relative Paths:** Forbidden in production source (`../../`) to prevent technical debt and ensure maintainability.
- **Main Process Paths:** Use `join(__dirname, ...)` for all file resolutions to ensure compatibility across Dev and Production (ASAR) environments.
- **Preload Extension:** In ESM projects (`"type": "module"`), the preload script must be referenced as `index.mjs` in the Main process `webPreferences`.

## 🏗 Architecture

- **Stack:** Electron + Vite + React + Tailwind 4 + shadcn/ui.
- **Main Process:** Fully modularized for maximum maintainability:
    - `index.ts`: Central orchestration, lifecycle, and IPC handlers.
    - `windows.ts`: `WindowManager` class handling multi-window creation, monitor-aware positioning, and navigation guards.
    - `tray.ts`: `TrayManager` handling System Tray integration and background persistence.
    - `config.ts`: User preference persistence (JSON).
- **Background Persistence:** The app remains active in the System Tray when windows are closed. Global shortcuts stay responsive. Users must explicitly "Quit" from the Tray menu.
- **Statistics Engine:** Decoupled architecture. Math logic lives in pure, unit-testable functions in `@lib/stats-utils.ts`. Data is handled via specialized composable hooks (`useSessionsFetch` and `useStatistics`).
- **UI:** Powered by Tailwind 4 + shadcn/ui. Complex data views use **Skeletons** for professional loading states.
- **Bundling:** `electron-vite` v5+ (Externalization is automatic).
- **Targets:** Windows NSIS and Portable EXE.
- **Build Workflow:** Always use `npm run build:win` for production artifacts. This runs a Linux-hosted Docker container with Wine to cross-compile the Windows binaries.

## ✅ Progress Log

- **Modular Architecture:** Successfully refactored Main process into a scalable, multi-file structure.
- **System Tray:** Implemented with context menu and "minimize to tray" behavior for background productivity.
- **Deep Linking & Protocol:** `optismile://` registered and handled securely for Supabase OAuth callbacks.
- **Global Bridge (IPC):** Secured and type-safe `window.api` bridge with a dedicated `index.d.ts` declaration.
- **Authentication:** Supabase OAuth (Google) and Email/Password with professional toast feedback and `User` type safety.
- **Activity Manager:** Fully functional category CRUD with toast notifications and `AlertDialog` confirmations.
- **Session History:** Completed with chronological sorting, filtering (Date/Category), inline editing, and deletion.
- **Statistics Dashboard:** Faithfully ported from extension with Recharts (Bar/Line), Std Dev consistency metrics, and Success Rate tracking.
- **Window Management:** Dual-window "Pro" flow (PIP Timer -> Centered Save Window) with native resizing handles restored, 0-duration guards, and cross-window state blocking.
- **Deletion Protocol:**
    - **Categories:** Implemented a "Safety Lock" (pre-deletion check) preventing removal if sessions exist.
    - **Sessions:** Bulk deletion via multi-select checkboxes in History.

## 🧠 Collaboration Protocol

- **Critical Review Mandate:** For every feature request or suggestion, the Agent MUST provide a cold, honest, production-level critique. The Agent will challenge sub-optimal patterns and propose industry-standard alternatives before implementation.

## 🚀 Next Steps

- **Refinement:**
  - Fine-tune the PIP window hover states and persistence if needed.
  - Implement any additional requested productivity visualizations.
