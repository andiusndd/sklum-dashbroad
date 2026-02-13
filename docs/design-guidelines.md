# SKLUM Dashboard - Design Guidelines

**Project**: Real-time Google Sheets Dashboard
**Version**: 1.0
**Date**: 2026-02-12

---

## Design Philosophy

**Keywords**: Clean, Professional, Data-focused, Real-time

The SKLUM Dashboard prioritizes **clarity and efficiency** for project managers tracking real-time progress. Design follows KISS (Keep It Simple, Stupid) - every element serves data visibility.

---

## Color Palette

### Primary Colors

**Brand Blue** (Primary actions, headers)
```css
--primary-50:  hsl(217, 91%, 97%);
--primary-100: hsl(217, 91%, 92%);
--primary-500: hsl(217, 91%, 60%);  /* Main brand color */
--primary-600: hsl(217, 91%, 50%);
--primary-900: hsl(217, 91%, 25%);
```
**HEX**: `#4F8BFF` (Primary 500)

### Status Colors (Traffic Light System)

```css
--status-success: hsl(142, 76%, 36%);    /* #10b981 - Green (Done, On Track) */
--status-warning: hsl(38, 92%, 50%);     /* #f59e0b - Yellow (At Risk) */
--status-danger:  hsl(0, 84%, 60%);      /* #ef4444 - Red (Overdue, Critical) */
--status-info:    hsl(199, 89%, 48%);    /* #3b82f6 - Blue (Info) */
--status-neutral: hsl(0, 0%, 50%);       /* #808080 - Gray (Not Started) */
```

### Neutral Palette

```css
--gray-50:  hsl(0, 0%, 98%);  /* #FAFAFA - Background */
--gray-100: hsl(0, 0%, 96%);  /* #F5F5F5 - Secondary BG */
--gray-200: hsl(0, 0%, 90%);  /* #E5E5E5 - Borders */
--gray-500: hsl(0, 0%, 50%);  /* #808080 - Text Secondary */
--gray-900: hsl(0, 0%, 10%);  /* #1A1A1A - Text Primary */
```

### Dark Mode

```css
--dark-bg-primary:   hsl(0, 0%, 10%);   /* #1A1A1A */
--dark-bg-secondary: hsl(0, 0%, 15%);   /* #262626 */
--dark-text-primary: hsl(0, 0%, 95%);   /* #F2F2F2 */
--dark-border:       hsl(0, 0%, 20%);   /* #333333 */
```

---

## Typography

### Font Family

**Primary Font**: **Inter** (Google Fonts)
- Clean, modern, optimized for UI
- Excellent readability at all sizes
- Variable font for performance

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

**Base**: 16px (1rem)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| **H1 (Page Title)** | 30px (1.875rem) | 700 (Bold) | 1.2 |
| **H2 (Section)** | 24px (1.5rem) | 600 (Semibold) | 1.3 |
| **H3 (Card Title)** | 18px (1.125rem) | 600 (Semibold) | 1.4 |
| **Body** | 16px (1rem) | 400 (Regular) | 1.5 |
| **Small** | 14px (0.875rem) | 400 (Regular) | 1.4 |
| **Tiny** | 12px (0.75rem) | 400 (Regular) | 1.3 |
| **Metric Value** | 36px (2.25rem) | 700 (Bold) | 1.1 |

---

## Spacing System

**Base Unit**: 4px

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

**Usage**:
- Card padding: `24px` (--space-6)
- Grid gap: `24px` (--space-6)
- Section spacing: `32px` (--space-8)

---

## Border Radius

```css
--radius-sm:  4px;   /* Buttons, inputs */
--radius-md:  8px;   /* Small cards */
--radius-lg:  12px;  /* Main cards */
--radius-xl:  16px;  /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Shadows

**Light Mode**:
```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1);
```

**Dark Mode**:
```css
--shadow-dark-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
```

---

## Component Specifications

### Metric Cards

**Size**: Auto height, 100% width
**Padding**: 24px
**Border**: None
**Shadow**: `--shadow-md`
**Hover**: `transform: translateY(-2px)` + `--shadow-lg`

**Structure**:
```
┌──────────────────────────┐
│ 📊 Total Tasks           │ ← Label (14px, gray-500)
│                          │
│      145                 │ ← Value (36px, bold)
│ ────────────             │
│ +5 this week ↑          │ ← Trend (12px)
└──────────────────────────┘
```

### Charts

**Background**: White (light) / `--dark-bg-secondary` (dark)
**Grid Lines**: `--gray-200` / `--dark-border`
**Axis Labels**: 12px, `--gray-500`
**Height**: 300px (default)

### Data Table

**Header BG**: `--gray-50` / `--dark-bg-secondary`
**Row Hover**: `--gray-50` / `--dark-bg-primary`
**Border**: `--gray-200` / `--dark-border`
**Font Size**: 14px

**Status Badges**:
- Padding: 4px 8px
- Border Radius: 4px
- Font Size: 12px
- Font Weight: 500

---

## Layout Structure

### Grid System

**Breakpoints**:
```css
--mobile:  < 768px   (1 column)
--tablet:  768px     (2 columns)
--desktop: 1024px    (3 columns)
```

**Container**:
```css
max-width: 1280px;
margin: 0 auto;
padding: 0 16px; /* mobile */
padding: 0 24px; /* desktop */
```

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│ Header (Logo, Title, Dark Mode Toggle)     │ ← 80px height
├─────────────────────────────────────────────┤
│ Metric Cards Grid (1-3 columns)            │ ← 32px top margin
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Total │ │Prog. │ │Done  │ │Late  │       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────────────┤
│ Charts Grid (1-2 columns)                  │ ← 32px top margin
│ ┌─────────────┐ ┌─────────────┐           │
│ │ Donut Chart │ │  Bar Chart  │           │
│ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────┤
│ Data Table (Full Width)                    │ ← 32px top margin
│ ┌─────────────────────────────────────────┐│
│ │ Task Name | Status | Progress | Due    ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## Iconography

**Library**: Lucide React
**Size**: 20px (default), 16px (small), 24px (large)
**Stroke Width**: 2px

**Common Icons**:
- 📊 `BarChart3` - Total tasks metric
- 🔄 `RefreshCw` - Manual refresh
- 🌙 `Moon` / ☀️ `Sun` - Dark mode toggle
- ↑ `ArrowUp` / ↓ `ArrowDown` - Trends
- ⚙️ `Settings` - Admin panel

---

## Animations

### Transitions

```css
/* Default transition */
transition: all 0.2s ease-in-out;

/* Hover effects */
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.15s ease-out;
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Loading States

**Skeleton Screens**: Use `--gray-200` pulsing animation
**Spinners**: 1s rotation, `--primary-500` color

---

## Accessibility

### Contrast Ratios (WCAG AA)

- Normal text: **4.5:1** minimum
- Large text (≥18px): **3:1** minimum
- UI components: **3:1** minimum

### Interactive Elements

- **Touch targets**: Minimum 44x44px
- **Focus visible**: 2px solid `--primary-500` outline
- **Keyboard navigation**: Full support

---

## Responsive Behavior

### Mobile (< 768px)

- 1-column layout
- Metric cards stack vertically
- Charts full-width
- Table horizontal scroll
- Hide less important columns

### Tablet (768px - 1024px)

- 2-column grid for metrics
- Charts side-by-side (if space)
- Table shows all columns

### Desktop (> 1024px)

- 3-4 column grid for metrics
- Multi-column chart layout
- Full data table

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --primary: hsl(217, 91%, 60%);
  --success: hsl(142, 76%, 36%);
  --warning: hsl(38, 92%, 50%);
  --danger: hsl(0, 84%, 60%);
  
  /* Spacing */
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --text-base: 16px;
  
  /* Layout */
  --radius-lg: 12px;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.dark {
  --background: hsl(0, 0%, 10%);
  --foreground: hsl(0, 0%, 95%);
  --border: hsl(0, 0%, 20%);
}
```

---

## Logo Specifications

**Primary Logo**: Text + Icon
**Colors**: `--primary-500` (blue) + `--gray-900` (text)
**Size**: 32px height (header)
**Format**: SVG (scalable)

**Concept**: Abstract chart/data visualization symbol + "SKLUM Dashboard" text

---

## Examples & Mockups

Wireframes available in: `docs/wireframes/index.html`

---

**Last Updated**: 2026-02-12
**Version**: 1.0
