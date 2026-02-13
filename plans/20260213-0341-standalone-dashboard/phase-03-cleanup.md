# Phase 3: Project Cleanup & Optimization

## 🔗 Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 2: Frontend Data Integration](./phase-02-frontend-implementation.md)
- **Goal**: Remove Next.js artifacts and optimize the project for standalone use.

## 🧭 Overview
**Status**: ⏳ PENDING
**Priority**: MEDIUM (Run with caution)
**Component**: Cleanup

This phase is about removing the "overhead" of the Next.js project once the standalone dashboard is operational.

## 🔑 Key Insights
- The user specifically requested "Xoá các file k cần thiết" (Delete unnecessary files).
- We should be very careful not to delete `.env.local` (credentials), `.git/`, or the new `standalone` work (root files).

## 📋 Requirements
- [ ] Remove `app/`, `components/`, `lib/` (if ported), `public/` (if empty or unused), `.next/`.
- [ ] Delete `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`.
- [ ] Simplify `package.json` (remove `next`, `react`, `typescript` dev dependencies if desired).
- [ ] Ensure `server.js` and `dashboard.html` remain functional.

## 🏗 Architecture
- **Target Structure**:
  - `server.js` (Root)
  - `dashboard.html` (Root)
  - `.env.local`
  - `node_modules/` (only essentials)
  - `package.json`

## 📝 Implementation Steps
1.  **Backup**: (Ideally user should have git). Create a temporary backup folder? Or just rely on Git. assuming user has version control.
2.  **Delete Directories**: `rm -rf app components lib plans public .next`.
3.  **Delete Config Files**: `rm next.config.ts postcss.config.mjs tsconfig.json eslint.config.mjs`.
4.  **Wait**: Ensure user confirms this destructive step explicitly.
5.  **Refine Dependencies**: `npm uninstall next react react-dom ...`. keep `googleapis`.

## ✅ Success Criteria
- [ ] Project directory is clean (minimal files).
- [ ] `npm start` (mapped to `node server.js`) works.
- [ ] Application still functions correctly.

## ⚠️ Risks
- **Data Loss**: Deleting source code (`app/`) is irreversible without git.
- **Dependency Issues**: Removing too much might break `server.js` (e.g. if I rely on `dotenv` or something installed via devDeps). `googleapis` is likely a dependency.

## 🛡 Security Considerations
- Ensure `.env.local` is preserved.

## ➡️ Next Steps
- Final implementation and handoff.
