# Standalone Dashboard Migration Plan

**Goal**: Transition the SKLUM Dashboard from Next.js to a lightweight, standalone Node.js architecture using pure HTML/JS for the frontend and a simple server for Google Sheets API access.

**Status**: 🚧 **IN PROGRESS**
**Date**: 2026-02-13

## 📋 Implementation Phases

### Phase 1: Standalone Environment Setup
> Create the server infrastructure and prepare the HTML file.
- **Status**: ⏳ PENDING
- **File**: [Phase 1: Setup](./phase-01-setup-standalone.md)

### Phase 2: Frontend Data Integration
> Connect `index.html` to the local API endpoint using vanilla fetch.
- **Status**: ⏳ PENDING
- **File**: [Phase 2: Frontend](./phase-02-frontend-implementation.md)

### Phase 3: Project Cleanup & Optimization
> Remove Next.js artifacts and optimize dependencies for a clean slate.
- **Status**: ⏳ PENDING
- **File**: [Phase 3: Cleanup](./phase-03-cleanup.md)

---

## 🔗 Context
- **Parent Plan**: N/A (Direct migration request)
- **Key Constraints**:
  - **No React**: Pure HTML/JS/CSS.
  - **Secure API**: Backend proxy for Google Auth.
  - **Existing Assets**: Reuse wireframe and service account credentials.

## ⚠️ Notes
- This is a DESTRUCTIVE migration. Ensure backups of `app/` and `components/` if needed before Phase 3.
