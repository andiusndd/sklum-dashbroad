# Phase 4: Admin Configuration Panel

**Phase**: 4 of 5
**Status**: ⏳ Not Started (Depends on Phase 3)
**Priority**: P2 (Medium)
**Duration**: 2-3 hours
**Dependencies**: Phase 1, 2, 3 complete

---

## Context

Build password-protected admin panel where admin can configure which columns to display, choose chart types, save configuration to localStorage, and manually trigger data refresh.

**Related Research**:
- [Dashboard Design - Admin Panel Patterns](../research/02-dashboard-design-patterns.md#10-admin-configuration-panel-design)

**Related Phases**:
- Phase 3: Dashboard UI (shares components)

---

## Overview

**Goal**: Simple admin panel for dashboard configuration

**Key Features**:
- Password authentication (simple, environment variable)
- Column visibility toggles
- Save/load configuration from localStorage
- Manual refresh button
- Reset to defaults

**Access**: `/admin` route (password required)

**Date**: 2026-02-12
**Estimated Time**: 2-3 hours
**Actual Time**: _TBD_

---

## Key Insights

- No database needed - use localStorage for config
- Password from environment variable (ADMIN_PASSWORD)
- Simple password gate (not OAuth - YAGNI)
- Configuration applies immediately to dashboard
- Export/import config as JSON (future enhancement)

---

## Requirements

### Functional
- ✅ Password-protected `/admin` route
- ✅ Toggle column visibility for data table
- ✅ Save configuration to localStorage
- ✅ Load saved configuration on dashboard
- ✅ Manual refresh trigger
- ✅ Reset to default configuration

### Non-Functional
- ✅ Password check happens client-side (acceptable for low-security use case)
- ✅ Configuration persists across browser sessions
- ✅ UI mirrors main dashboard design

---

## Architecture

### Configuration Schema

```javascript
{
  "version": "1.0",
  "columns": {
    "name": true,
    "status": true,
    "progress": true,
    "assignee": false,  // Hidden by admin
    "due_date": true,
    "priority": false   // Hidden by admin
  },
  "refreshInterval": 60000  // ms
}
```

### Flow

```
User → /admin
  ↓
Password Gate (client-side check)
  ↓ (correct password)
Admin Panel
  ↓
Toggle Columns → Save to localStorage
  ↓
Dashboard reads config on mount
```

---

## Related Code Files

**To Create**:
- `app/admin/page.js` - Admin panel page
- `components/PasswordGate.jsx` - Password input component
- `components/admin/ColumnConfig.jsx` - Column toggle UI
- `lib/config.js` - Config management utilities

**To Modify**:
- `components/DataTable.jsx` - Read column config

---

## Implementation Steps

### Step 1: Create Config Management Utilities

File: `lib/config.js`

```javascript
const DEFAULT_CONFIG = {
  version: '1.0',
  columns: {
    name: true,
    status: true,
    progress: true,
    assignee: true,
    due_date: true,
    priority: true,
    milestone: true,
  },
  refreshInterval: 30000, // 30 seconds
};

export function loadConfig() {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  try {
    const stored = localStorage.getItem('dashboard-config');
    if (!stored) return DEFAULT_CONFIG;

    const config = JSON.parse(stored);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error('Failed to load config:', error);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config) {
  try {
    localStorage.setItem('dashboard-config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
}

export function resetConfig() {
  try {
    localStorage.removeItem('dashboard-config');
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Failed to reset config:', error);
    return DEFAULT_CONFIG;
  }
}

export function getVisibleColumns(config = loadConfig()) {
  return Object.entries(config.columns)
    .filter(([_, visible]) => visible)
    .map(([key, _]) => key);
}
```

---

### Step 2: Create Password Gate Component

File: `components/PasswordGate.jsx`

```javascript
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Compare with environment variable (set at build time)
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (password === correctPassword) {
      setError('');
      onUnlock();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Step 3: Create Column Configuration UI

File: `components/admin/ColumnConfig.jsx`

```javascript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function ColumnConfig({ config, onChange }) {
  const handleToggle = (columnKey) => {
    const newConfig = {
      ...config,
      columns: {
        ...config.columns,
        [columnKey]: !config.columns[columnKey],
      },
    };
    onChange(newConfig);
  };

  const columnLabels = {
    name: 'Task Name',
    status: 'Status',
    progress: 'Progress',
    assignee: 'Assignee',
    due_date: 'Due Date',
    priority: 'Priority',
    milestone: 'Milestone',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Column Visibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(config.columns).map(([key, visible]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={`col-${key}`} className="cursor-pointer">
              {columnLabels[key] || key}
            </Label>
            <Switch
              id={`col-${key}`}
              checked={visible}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

### Step 4: Create Admin Page

File: `app/admin/page.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { PasswordGate } from '@/components/PasswordGate';
import { ColumnConfig } from '@/components/admin/ColumnConfig';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { loadConfig, saveConfig, resetConfig } from '@/lib/config';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isUnlocked) {
      setConfig(loadConfig());
    }
  }, [isUnlocked]);

  const handleSave = () => {
    const success = saveConfig(config);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    const defaultConfig = resetConfig();
    setConfig(defaultConfig);
  };

  const handleRefresh = async () => {
    // Trigger revalidation
    await fetch('/api/revalidate', { method: 'POST' });
    alert('Dashboard refreshed!');
  };

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <ColumnConfig config={config} onChange={setConfig} />

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleSave}>
              {saved ? 'Saved ✓' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              Force Refresh Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

---

### Step 5: Update DataTable to Respect Config

File: `components/DataTable.jsx` (modify)

```javascript
// Add this import
import { loadConfig, getVisibleColumns } from '@/lib/config';

// In component:
export function DataTable({ data }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const visibleColumns = config ? getVisibleColumns(config) : [];

  // Filter table headers/cells based on visibleColumns
  // ...
}
```

---

### Step 6: Add Revalidation API Route

File: `app/api/revalidate/route.js`

```javascript
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    revalidatePath('/');
    revalidatePath('/api/sheets/data');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### Step 7: Install Missing Shadcn Components

```bash
npx shadcn@latest add switch
npx shadcn@latest add label
npx shadcn@latest add input
```

---

## Todo List

- [ ] Create `lib/config.js` with config utilities
- [ ] Create `components/PasswordGate.jsx`
- [ ] Create `components/admin/ColumnConfig.jsx`
- [ ] Create `app/admin/page.js`
- [ ] Install shadcn components: switch, label, input
- [ ] Add `NEXT_PUBLIC_ADMIN_PASSWORD` to `.env.local`
- [ ] Create `/api/revalidate/route.js`
- [ ] Update `DataTable.jsx` to read config
- [ ] Test password gate works
- [ ] Test column toggles persist
- [ ] Test manual refresh trigger
- [ ] Commit: `git commit -m "feat: add admin configuration panel"`

---

## Success Criteria

- ✅ `/admin` requires password
- ✅ Column toggles work and persist
- ✅ Configuration saved to localStorage
- ✅ Dashboard respects saved config
- ✅ Reset to defaults works
- ✅ Manual refresh triggers revalidation

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Client-side password not secure | High | Low | Acceptable for low-stakes dashboard |
| LocalStorage cleared by user | Medium | Low | Defaults applied automatically |
| Config schema changes | Low | Medium | Version config, migrate old versions |

---

## Security Considerations

- ⚠️ Password stored as `NEXT_PUBLIC_*` (visible in client bundle)
- ✅ Acceptable for internal/low-security dashboard
- ✅ For production, consider server-side auth (NextAuth.js)

---

## Next Steps

After completing Phase 4:
1. ✅ Test admin panel thoroughly
2. ✅ Commit to Git
3. ➡️ **Proceed to [Phase 5: Deployment & Testing](./phase-05-deploy.md)**

---

**Phase Status**: ⏳ Waiting for Phase 3
