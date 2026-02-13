# Phase 1: Project Setup & Foundation

**Phase**: 1 of 5
**Status**: ✅ Done
**Priority**: P0 (Blocker)
**Duration**: 30 minutes
**Dependencies**: None

---

## Context

Initialize Next.js 14 project with App Router, install required dependencies, configure Tailwind CSS + Shadcn/ui, setup environment variables template.

**Related Research**:
- [Next.js + Vercel Deployment](../research/03-nextjs-vercel-deployment.md)

**Related Phases**:
- Phase 2: Google Sheets API Integration (depends on this)

---

## Overview

**Goal**: Bootstrap project with zero config deployment readiness

**Key Technologies**:
- Next.js 14.2+ (App Router, Server Components, ISR)
- Tailwind CSS 3.4+
- Shadcn/ui (component library)
- TypeScript (optional but recommended)

**Date**: 2026-02-12
**Estimated Time**: 30 minutes
**Actual Time**: _TBD_

---

## Key Insights

- Next.js 14 App Router simplifies deployment (no separate backend)
- Shadcn/ui components are copy-paste (not npm package)
- Environment variables MUST be set before testing Sheet API
- TypeScript recommended for better DX (auto-complete)

---

## Requirements

### Functional
- ✅ Next.js 14 project initialized with App Router
- ✅ Tailwind CSS configured
- ✅ Shadcn/ui initialized (card, button, table components)
- ✅ Environment variables template (`.env.example`)
- ✅ Git repository initialized (already done ✅)

### Non-Functional
- ✅ Project structure follows Next.js conventions
- ✅ No build errors on fresh install
- ✅ Fast development server start (< 5 seconds)

---

## Architecture

### Project Structure

```
sklum-dashboard/
├── .next/                  # Build output (gitignored)
├── app/
│   ├── layout.js           # Root layout
│   ├── page.js             # Dashboard home
│   ├── admin/
│   │   └── page.js         # Admin panel
│   ├── api/
│   │   └── sheets/
│   │       └── route.js    # Google Sheets API
│   └── globals.css         # Tailwind imports
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── charts/             # Chart components
│   ├── DashboardLayout.jsx
│   ├── MetricCard.jsx
│   └── DataTable.jsx
├── lib/
│   ├── sheets.js           # Google Sheets client
│   ├── utils.js            # Utility functions
│   └── constants.js        # Configuration
├── public/
│   └── logo.png            # Static assets
├── .env.local              # Environment variables (gitignored)
├── .env.example            # Template for .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json           # If using TypeScript
```

---

## Implementation Steps

### Step 1: Initialize Next.js Project

```bash
# Create Next.js 14 project with App Router
npx create-next-app@latest . --app --tailwind --eslint --src-dir=false --import-alias="@/*"

# Answer prompts:
# ✔ Would you like to use TypeScript? › Yes / No
# ✔ Would you like to use ESLint? › Yes
# ✔ Would you like to use Tailwind CSS? › Yes
# ✔ Would you like to use `src/` directory? › No
# ✔ Would you like to use App Router? › Yes
# ✔ Would you like to customize the default import alias? › Yes (@/*)
```

**Verification**:
```bash
npm run dev
# Should open http://localhost:3000 with default Next.js page
```

---

### Step 2: Install Dependencies

```bash
# Chart library
npm install recharts

# Google Sheets API
npm install googleapis

# Utility libraries
npm install clsx tailwind-merge
```

**package.json** should include:
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "recharts": "^2.12.0",
    "googleapis": "^133.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1"
  }
}
```

---

### Step 3: Initialize Shadcn/ui

```bash
# Initialize Shadcn/ui (creates components.json config)
npx shadcn@latest init

# Answer prompts:
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Would you like to use CSS variables for colors? › Yes

# Install required components
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add switch
```

**Verification**: `components/ui/` folder should contain card.jsx, button.jsx, etc.

---

### Step 4: Setup Environment Variables

Create `.env.example`:
```bash
# Google Sheets Configuration
SHEET_ID=your-google-sheet-id
GOOGLE_CREDENTIALS={"type":"service_account",...}

# Admin Authentication
ADMIN_PASSWORD=your-secure-password

# Site Configuration
NEXT_PUBLIC_SITE_NAME=SKLUM Dashboard
NEXT_PUBLIC_REFRESH_INTERVAL=60000
```

Create `.env.local` (copy from example):
```bash
cp .env.example .env.local
```

**Update `.env.local`** with real values:
```bash
SHEET_ID=1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c
GOOGLE_CREDENTIALS=<paste-service-account-json-here>
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_SITE_NAME=SKLUM Dashboard
NEXT_PUBLIC_REFRESH_INTERVAL=60000
```

---

### Step 5: Configure Tailwind CSS

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... Shadcn/ui color variables
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

Update `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    /* ... Shadcn/ui CSS variables */
  }

  .dark {
    --background: 0 0% 10%;
    --foreground: 0 0% 95%;
    /* ... dark mode variables */
  }
}
```

---

### Step 6: Update .gitignore

Ensure sensitive files are ignored:
```
# .gitignore
.next/
node_modules/
.env*.local
.vercel
*.log
```

---

### Step 7: Create Utility Functions

Create `lib/utils.js`:
```javascript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}
```

---

## Todo List

- [ ] Run `npx create-next-app@latest .` with correct flags
- [ ] Install dependencies: recharts, googleapis, clsx, tailwind-merge
- [ ] Initialize Shadcn/ui and add components (card, button, table, select, switch)
- [ ] Create `.env.example` with template
- [ ] Copy to `.env.local` and fill with real values
- [ ] Update `tailwind.config.js` with dark mode
- [ ] Verify `.gitignore` includes `.env*.local`
- [ ] Create `lib/utils.js` with utility functions
- [ ] Run `npm run dev` - verify no errors
- [ ] Commit initial setup to Git

---

## Success Criteria

- ✅ `npm run dev` starts without errors
- ✅ http://localhost:3000 shows Next.js default page
- ✅ `components/ui/` contains Shadcn components
- ✅ `.env.local` exists with placeholder values
- ✅ No sensitive files in Git (check with `git status`)
- ✅ Tailwind CSS working (test by adding className="text-red-500")

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Wrong Next.js version installed | Low | Medium | Use `@latest` flag in create-next-app |
| Shadcn/ui components not copying | Low | Low | Check `components.json` config |
| Environment variables not loading | Medium | High | Use `NEXT_PUBLIC_` prefix for client vars |
| Git history includes .env files | Medium | High | Verify `.gitignore` before commit |

---

## Security Considerations

- ✅ `.env.local` in `.gitignore` (never commit secrets)
- ✅ Use `NEXT_PUBLIC_` prefix only for non-sensitive vars
- ✅ Service Account JSON should be minified (no newlines)
- ✅ Admin password must be strong (min 12 characters recommended)

---

## Next Steps

After completing Phase 1:
1. ✅ Verify all success criteria met
2. ✅ Commit to Git: `git add . && git commit -m "feat: initialize project setup"`
3. ➡️ **Proceed to [Phase 2: Google Sheets API Integration](./phase-02-api.md)**

---

**Phase Status**: ⏳ Ready to Start
