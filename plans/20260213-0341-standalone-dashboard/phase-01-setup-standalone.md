# Phase 1: Standalone Environment Setup

## 🔗 Context
- **Parent Plan**: [plan.md](./plan.md)
- **Goal**: Establish the basic Node.js + HTML architecture to replace Next.js.

## 🧭 Overview
**Status**: ⏳ PENDING
**Priority**: CRITICAL
**Component**: Backend (`server.js`) & Static Assets (`dashboard.html`)

This phase focuses on creating the `server.js` file (backend proxy) and setting up the `dashboard.html` file (frontend) from the wireframe, ensuring the foundation is laid for a "pure code" experience.

## 🔑 Key Insights
- We need to reuse the **Service Account** credentials from `.env.local`.
- The `server.js` needs to use `googleapis` (already in `node_modules`) but without importing `next`.
- The HTML file needs to be accessible at `http://localhost:3001` (or 3000 once Next.js is gone).

## 📋 Requirements
- [ ] Create `server.js` in the root directory.
- [ ] Implement Google Auth logic in `server.js` (reading `.env.local`).
- [ ] Move `docs/wireframes/index.html` to `public/dashboard.html` (or root `dashboard.html`).
- [ ] Ensure `server.js` can serve `dashboard.html`.

## 🏗 Architecture
- **Backend**: Node.js `http` module + `googleapis`.
- **Config**: Custom `.env` parser (dependency-free).
- **Frontend**: Static HTML Served by Node.js.

## 📝 Implementation Steps
1.  **Create Server**: Write `server.js` in the root directory. This script will:
    - Parse `.env.local` manually.
    - Initialize `google.auth.GoogleAuth`.
    - Create an HTTP server listening on port 3001.
    - Serve static files (HTML/CSS/JS).
    - Expose `/api/data` endpoint to fetch Sheet data.
2.  **Migrate Frontend**: Copy `docs/wireframes/index.html` to `dashboard.html` in the root (for simplicity).
3.  **Verify**: Run `node server.js` and check if `http://localhost:3001` loads the dashboard.

## ✅ Success Criteria
- [ ] Running `node server.js` starts a server without errors.
- [ ] Accessing `http://localhost:3001` shows the dashboard.
- [ ] Accessing `http://localhost:3001/api/data` returns Google Sheet JSON.

## ⚠️ Risks
- **Port Conflict**: Port 3000 might be in use by Next.js. Use 3001 temporarily.
- **Env Parsing**: Manual parsing might fail on edge cases (comments, quotes). Need robust regex or simple split.

## 🛡 Security Considerations
- Ensure `.env.local` is **never** served to the client. The `server.js` must strictly control file access (no directory traversal).

## ➡️ Next Steps
- Proceed to [Phase 2: Frontend Data Integration](./phase-02-frontend-implementation.md).
