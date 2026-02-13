# Phase 2: Frontend Data Integration

## 🔗 Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 1: Setup](./phase-01-setup-standalone.md)
- **Goal**: Connect the static `dashboard.html` to the backend API (`/api/data`).

## 🧭 Overview
**Status**: ⏳ PENDING
**Priority**: HIGH
**Component**: Frontend (JavaScript)

This phase focuses on enhancing the `dashboard.html` file to fetch data from the local API endpoint (`/api/data`) instead of using hardcoded mock data.

## 🔑 Key Insights
- The `index.html` (wireframe) currently has hardcoded tables and charts.
- We need to write vanilla JS to replace this mock data with dynamic content.
- The `/api/data` endpoint (Phase 1) will return a JSON array of rows from the sheet.

## 📋 Requirements
- [ ] Add `fetch()` logic to `dashboard.html`.
- [ ] Parse JSON response.
- [ ] Use `transformers.ts` logic (ported to JS) to shape the data for display.
- [ ] Populate the DOM elements (Table, Metrics, Charts).

## 🏗 Architecture
- **Data Flow**: `Fetch API` -> `parseSheetData()` -> `updateDashboard()`.
- **UI Logic**: Pure DOM manipulation (or minimal helpers).

## 📝 Implementation Steps
1.  **Port Transformers**: Convert `lib/transformers.ts` logic to vanilla JS inside `dashboard.html` `<script>` block (or separate file).
    - `calculateSummary()`
    - `parseSheetToObjects()` logic.
2.  **Fetch Data**: Add `fetch('/api/data')` inside `window.onload`.
3.  **Update UI**:
    - **Metrics**: Select `.metric-value` elements and update text content.
    - **Table**: Create `<tr>` elements dynamically and append to `tbody`.
    - **Charts**: Use DOM manipulation to adjust chart sizes or replace SVGs (optional: pure CSS charts via `style` updates).

## ✅ Success Criteria
- [ ] Dashboard displays real data from Google Sheet.
- [ ] Data updates on page refresh (or polling).
- [ ] CSS styling remains intact.

## ⚠️ Risks
- **Data Format Changes**: Google Sheet structure might differ from mock. Need loose matching or clear error handling.

## 🛡 Security Considerations
- Ensure input sanitization (XSS) if displaying user-generated content from the Sheet. Use `textContent` mostly.

## ➡️ Next Steps
- Proceed to [Phase 3: Cleanup](./phase-03-cleanup.md).
