# Phase 5: Deployment & Production Testing

**Phase**: 5 of 5
**Status**: ⏳ Not Started (Depends on Phase 4)
**Priority**: P0 (Blocker for Launch)
**Duration**: 1-2 hours
**Dependencies**: All previous phases complete

---

## Context

Deploy to Vercel, configure production environment variables, verify Google Sheets connection, run performance tests, setup auto-deploy on Git push.

**Related Research**:
- [Next.js + Vercel Deployment Guide](../research/03-nextjs-vercel-deployment.md)

**Related Phases**:
- All previous phases (must be complete)

---

## Overview

**Goal**: Production-ready deployment with zero-downtime updates

**Platform**: Vercel (free tier)
**Domain**: Auto-generated `.vercel.app` (custom domain optional)
**CI/CD**: Auto-deploy on `git push`

**Date**: 2026-02-12
**Estimated Time**: 1-2 hours
**Actual Time**: _TBD_

---

## Key Insights

- Vercel free tier sufficient (100GB bandwidth/month)
- Environment variables set via Vercel dashboard
- Auto SSL certificate (HTTPS by default)
- Preview deployments for branches
- Edge caching for optimal performance

---

## Requirements

### Functional
- ✅ Production deployment on Vercel
- ✅ Environment variables configured
- ✅ Google Sheets API working in production
- ✅ Auto-deploy on Git push to main
- ✅ Custom domain (optional)

### Non-Functional
- ✅ Lighthouse score > 90
- ✅ Page load < 2 seconds
- ✅ SSL/HTTPS enabled
- ✅ Zero-downtime deployments

---

## Architecture

### Deployment Flow

```
Local git push
  ↓
GitHub repository
  ↓
Vercel webhook (auto-trigger)
  ↓
Build process (npm run build)
  ↓
Deploy to Edge Network
  ↓
Production URL live
```

---

## Related Code Files

**To Create**:
- `.vercelignore` (optional)
- `next.config.js` (production optimizations)

**To Review**:
- `.gitignore` (ensure no secrets committed)
- `.env.local` (never commit this!)

---

## Implementation Steps

### Step 1: Prepare for Deployment

**Review .gitignore**:
```bash
# Verify these are ignored
.env*.local
.next/
node_modules/
.vercel

# Check git status
git status
```

**Verify no secrets in Git history**:
```bash
git log --all --full-history -- '.env*'
# Should return nothing
```

---

### Step 2: Create Production Environment Config

File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Hide 'X-Powered-By: Next.js'
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_REFRESH_INTERVAL: process.env.NEXT_PUBLIC_REFRESH_INTERVAL,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

module.exports = nextConfig;
```

---

### Step 3: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Login to Vercel
vercel login
# Follow prompts to authenticate via email/GitHub
```

---

### Step 4: Initialize Vercel Project

```bash
# Run from project root
vercel

# Answer prompts:
# ? Set up and deploy "~/Desktop/SKLUM_Dashbroad"? Yes
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? No
# ? What's your project's name? sklum-dashboard
# ? In which directory is your code located? ./
# ? Want to override the settings? No
```

**Result**: Creates `.vercel` directory (gitignored)

---

### Step 5: Set Environment Variables in Vercel

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select project: `sklum-dashboard`
3. Settings → Environment Variables
4. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `GOOGLE_CREDENTIALS` | `{"type":"service_account",...}` | Production, Preview |
| `SHEET_ID` | `1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c` | Production, Preview |
| `ADMIN_PASSWORD` | `your-secure-password` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `SKLUM Dashboard` | Production, Preview |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | `60000` | Production, Preview |

**Option B: Via CLI**

```bash
# Add secrets
vercel env add GOOGLE_CREDENTIALS production
# Paste JSON, press Enter

vercel env add SHEET_ID production
# Enter: 1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c

vercel env add ADMIN_PASSWORD production
# Enter: your-secure-password

vercel env add NEXT_PUBLIC_SITE_NAME production
# Enter: SKLUM Dashboard

vercel env add NEXT_PUBLIC_REFRESH_INTERVAL production
# Enter: 60000
```

---

### Step 6: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Wait for build...
# Output:
# ✓ Production: https://sklum-dashboard-xxxx.vercel.app [copied]
```

**Copy the production URL** - this is your live dashboard!

---

### Step 7: Verify Production Deployment

**Manual Checks**:

1. **Open production URL**:
   ```
   https://sklum-dashboard-xxxx.vercel.app
   ```

2. **Verify dashboard loads**:
   - Summary metrics visible ✅
   - Charts rendering ✅
   - Data table populated ✅

3. **Test Google Sheets connection**:
   ```
   https://sklum-dashboard-xxxx.vercel.app/api/sheets/data
   ```
   Should return JSON with summary, tasks, chartData

4. **Test admin panel**:
   ```
   https://sklum-dashboard-xxxx.vercel.app/admin
   ```
   - Password gate shows ✅
   - Correct password unlocks ✅
   - Column toggles work ✅

5. **Test dark mode**:
   - Toggle moon/sun icon
   - Persists on refresh ✅

6. **Test auto-refresh**:
   - Wait 30 seconds
   - Check "Last updated" timestamp changes ✅

---

### Step 8: Performance Testing

**Run Lighthouse Audit**:

1. Open Chrome DevTools (F12)
2. Lighthouse tab
3. Generate report (Mobile + Desktop)

**Target Scores**:
- Performance: **> 90**
- Accessibility: **> 95**
- Best Practices: **> 95**
- SEO: **> 90**

**Common Issues & Fixes**:

| Issue | Fix |
|-------|-----|
| LCP too slow | Enable image optimization, use `priority` on hero images |
| CLS > 0.1 | Reserve space for charts with min-height |
| Missing meta tags | Add description, OG tags in layout.js |
| Slow API response | Verify ISR working (check headers) |

---

### Step 9: Setup Auto-Deploy

**Connect GitHub Repository** (if not already):

1. Vercel Dashboard → Project Settings
2. Git → Connect Git Repository
3. Select GitHub account
4. Choose repository: `SKLUM_Dashbroad`
5. **Production Branch**: `main`
6. **Deploy on push**: Enabled ✅

**Result**:
- Every `git push origin main` → auto-deploy to production
- Every `git push origin feature-branch` → preview deployment

---

### Step 10: Create README for Deployment

File: `README.md`

```markdown
# SKLUM Dashboard

Real-time project tracking dashboard powered by Google Sheets.

## Features

- 📊 Real-time metrics from Google Sheets
- 📈 Interactive charts (Donut, Bar, Line)
- 🌙 Dark mode support
- 📱 Fully responsive
- 🔒 Admin panel for configuration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Data Source**: Google Sheets API
- **Deployment**: Vercel

## Environment Variables

```bash
SHEET_ID=your-google-sheet-id
GOOGLE_CREDENTIALS={"type":"service_account",...}
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_SITE_NAME=SKLUM Dashboard
NEXT_PUBLIC_REFRESH_INTERVAL=60000
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in .env.local with your values

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Deployment

Deployed automatically via Vercel on push to `main` branch.

**Production URL**: https://sklum-dashboard.vercel.app

## Admin Panel

Access: `/admin`
Password: Set via `ADMIN_PASSWORD` environment variable

## License

MIT
```

---

## Todo List

- [ ] Review `.gitignore` - ensure no secrets
- [ ] Create/update `next.config.js` with production config
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Initialize project: `vercel`
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify production URL loads correctly
- [ ] Test Google Sheets API connection
- [ ] Test admin panel with password
- [ ] Run Lighthouse audit (target > 90)
- [ ] Connect GitHub repository for auto-deploy
- [ ] Create `README.md` with deployment instructions
- [ ] Commit final changes: `git commit -m "feat: production deployment"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify auto-deploy triggered

---

## Success Criteria

- ✅ Production URL accessible
- ✅ Dashboard displays real Google Sheets data
- ✅ Lighthouse scores > 90
- ✅ SSL/HTTPS enabled
- ✅ Auto-deploy working on Git push
- ✅ Admin panel functional
- ✅ Dark mode working
- ✅ No console errors in production
- ✅ ISR caching working (check response headers)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Environment variables not set | Medium | High | Double-check Vercel dashboard |
| Build fails on Vercel | Low | High | Test `npm run build` locally first |
| Free tier quota exceeded | Very Low | Medium | Monitor Vercel analytics |
| Google Sheets rate limit | Low | Medium | ISR caching mitigates this |

---

## Security Considerations

- ✅ Environment variables never committed to Git
- ✅ HTTPS enforced by Vercel (auto SSL)
- ✅ Service Account has readonly permissions only
- ✅ Admin password required for configuration changes
- ⚠️ Admin password visible in client bundle (acceptable for internal tool)

---

## Post-Deployment Monitoring

### Vercel Analytics

- Monitor page views, unique visitors
- Check Core Web Vitals (LCP, FID, CLS)
- Review error logs

### Google Sheets API Quota

- Monitor usage in Google Cloud Console
- Free tier: 100 requests/100 seconds/user
- With ISR, unlikely to hit limits

### Alerts to Set Up (Optional)

- Deployment failures (Vercel email notifications)
- Error rate >5% (Sentry integration)
- Response time > 2s (Vercel Speed Insights)

---

## Next Steps

After completing Phase 5:

1. ✅ **Celebrate!** 🎉 Dashboard is live!
2. ✅ Share production URL with stakeholders
3. ✅ Gather feedback for iteration
4. 📈 **Future Enhancements**:
   - Custom domain setup
   - Email notifications for overdue tasks
   - Export to PDF
   - Multi-sheet support
   - Historical data trends

---

## Support & Maintenance

**Production URL**: https://sklum-dashboard.vercel.app
**Admin Panel**: https://sklum-dashboard.vercel.app/admin

**Troubleshooting**:
- Check Vercel deployment logs for errors
- Verify Google Sheets service account is still shared
- Monitor Vercel analytics for performance issues

---

**Phase Status**: ⏳ Waiting for Phase 4

**🎯 END OF IMPLEMENTATION PLAN**
