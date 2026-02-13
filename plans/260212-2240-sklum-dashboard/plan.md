# SKLUM Dashboard - Implementation Plan

**Project**: Real-time Google Sheets Dashboard
**Created**: 2026-02-12 22:45
**Status**: Planning Complete, Ready for Implementation

---

## Project Overview

Public dashboard displaying real-time project tracking metrics from Google Sheets. Single-page interface with cards, charts, and data table. Admin panel for configuration. Zero-cost deployment on Vercel.

**Key Features**:
- ✅ Real-time data sync from Google Sheets (60s refresh)
- ✅ Visual metrics: Donut, Bar, Line charts
- ✅ Public viewer access (no login)
- ✅ Admin panel (password-protected configuration)
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support

---

## Tech Stack

**Frontend + Backend**: Next.js 14 (App Router)
**UI**: Shadcn/ui + Tailwind CSS
**Charts**: Recharts
**Data Source**: Google Sheets API (Service Account)
**Auth**: Simple password (environment variable)
**Deploy**: Vercel (free tier)

---

## Implementation Phases

### Phase 1: Project Setup ✅ Done
**Duration**: 30 minutes
**File**: [phase-01-setup.md](./phase-01-setup.md)

Initialize Next.js project, install dependencies, configure Tailwind + Shadcn/ui, setup environment variables.

**Deliverables**:
- Next.js 14 project initialized
- Dependencies installed (recharts, googleapis, shadcn/ui)
- `.env.local` template created
- Basic folder structure

---

### Phase 2: Google Sheets API Integration ✅ Done
**Duration**: 1-2 hours
**File**: [phase-02-api.md](./phase-02-api.md)

Setup Google Sheets Service Account authentication, create API route with ISR caching, implement data transformation layer.

**Deliverables**:
- `/api/sheets/data` route with 60s ISR
- Service Account authentication working
- Data transformation utilities
- Error handling + retry logic

---

### Phase 3: Dashboard UI Components ✅ Done
**Duration**: 3-4 hours
**File**: [phase-03-ui.md](./phase-03-ui.md)

Build metric cards, charts (Donut, Bar, Line), data table, responsive layout, dark mode toggle.

**Deliverables**:
- MetricCard components (summary stats)
- Chart components (DonutChart, BarChart, LineChart)
- DataTable with sort/filter
- Responsive grid layout
- Dark mode implementation

---

### Phase 4: Admin Configuration Panel ⏳ Not Started
**Duration**: 2-3 hours
**File**: [phase-04-admin.md](./phase-04-admin.md)

Password-protected admin panel to configure visible columns, chart types, save to localStorage.

**Deliverables**:
- `/admin` route with password gate
- Column visibility toggles
- Configuration save/load
- Manual refresh trigger

---

### Phase 5: Deployment & Testing ⏳ Not Started
**Duration**: 1 hour
**File**: [phase-05-deploy.md](./phase-05-deploy.md)

Deploy to Vercel, configure environment variables, test production, setup auto-deploy on Git push.

**Deliverables**:
- Production deployment on Vercel
- Environment variables configured
- Google Sheets connection verified
- Performance metrics validated

---

## Success Criteria

- ✅ Dashboard loads in < 2 seconds
- ✅ Data refreshes every 60 seconds automatically
- ✅ All charts render correctly on mobile + desktop
- ✅ Admin panel requires password
- ✅ Dark mode toggles smoothly
- ✅ No console errors in production
- ✅ Lighthouse score > 90

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Google Sheets API rate limit hit | Low | Medium | ISR caching + exponential backoff |
| Service Account not shared on Sheet | High | High | Clear documentation in README |
| Vercel free tier exceeded | Very Low | Low | Monitor usage dashboard |
| Large datasets slow render | Medium | Medium | Pagination + virtualization if needed |

---

## Project Timeline

**Total Estimated Time**: 7-10 hours

```
Day 1 (Setup):        Phase 1 + 2 (API integration)
Day 2 (Core UI):      Phase 3 (Dashboard components)
Day 3 (Polish):       Phase 4 (Admin) + Phase 5 (Deploy)
```

---

## Next Steps

1. ✅ Review this plan with stakeholders
2. ⏳ Get Google Service Account JSON credentials
3. ⏳ Begin Phase 1: Project Setup
4. ⏳ Implement phases sequentially
5. ⏳ Deploy to production

---

**Ready to start?** Proceed to [Phase 1: Project Setup](./phase-01-setup.md)
