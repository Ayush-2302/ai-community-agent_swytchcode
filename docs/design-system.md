# SocialOps Design System Documentation

A comprehensive, centralized, and accessible design system engineered for high-performance operational web applications.

---

## 1. Design Principles

- **Clarity Over Clutter**: Generous whitespace, structured typography hierarchy, and purposeful layout primitives replace visual noise.
- **Subtlety & Polish**: Soft neutral surfaces, 1px borders, and ultra-light layered shadows (`shadow-subtle`, `shadow-card`) replace heavy black borders and harsh drop shadows.
- **Predictable & Default**: Developers should not have to invent colors, paddings, or border radiuses on the fly. The design system provides sensible defaults.
- **Accessibility First**: WCAG 2.1 AA compliant contrast ratios, visible keyboard focus indicators (`focus-ring`), and semantic HTML attributes across all interactive components.
- **Single Source of Truth**: All visual attributes map directly to CSS variables defined in `src/index.css` and compiled via Tailwind CSS v4 `@theme`.

---

## 2. Color System

All colors are implemented as CSS custom properties with HSL/Hex values and mapped into Tailwind theme tokens.

### Brand & Accents
| Token | CSS Variable | Tailwind Utility | Semantic Purpose |
|---|---|---|---|
| **Primary** | `--primary` | `bg-primary`, `text-primary` | Brand accents, main call-to-actions, active links |
| **Primary Hover** | `--primary-hover` | `hover:bg-primary-hover` | Interactive hover states |
| **Primary Active** | `--primary-active` | `active:bg-primary-active` | Active/pressed state |
| **Primary Soft** | `--primary-soft` | `bg-primary-soft` | Active menu pills, badge fills, highlight backgrounds |
| **Secondary** | `--secondary` | `bg-secondary` | Secondary brand actions, alternative buttons |
| **Secondary Soft** | `--secondary-soft` | `bg-secondary-soft` | Soft container backgrounds |

### Backgrounds & Surfaces
| Token | CSS Variable | Tailwind Utility | Semantic Purpose |
|---|---|---|---|
| **Background** | `--background` | `bg-background` | Global application canvas (`#f8fafc`) |
| **Surface** | `--surface` | `bg-surface` | Cards, modals, dropdowns, tables (`#ffffff`) |
| **Surface Soft** | `--surface-soft` | `bg-surface-soft` | Table headers, secondary card panels (`#f1f5f9`) |
| **Surface Hover** | `--surface-hover` | `hover:bg-surface-hover` | Table row hover, list item hover (`#f8fafc`) |
| **Surface Active** | `--surface-active` | `bg-surface-active` | Terminal windows, active panels (`#0f172a`) |

### Typography & Text
| Token | CSS Variable | Tailwind Utility | Semantic Purpose |
|---|---|---|---|
| **Text Primary** | `--text-primary` | `text-text-primary` | Headings, primary content, high-contrast text (`#0f172a`) |
| **Text Secondary** | `--text-secondary` | `text-text-secondary` | Subheadings, descriptions, body copy (`#334155`) |
| **Text Muted** | `--text-muted` | `text-text-muted` | Captions, metadata, helper text, timestamps (`#64748b`) |
| **Text Disabled** | `--text-disabled` | `text-text-disabled` | Disabled inputs, inactive dates (`#94a3b8`) |
| **Text Inverse** | `--text-inverse` | `text-text-inverse` | Text on high-contrast primary/dark surfaces (`#ffffff`) |

### Borders
| Token | CSS Variable | Tailwind Utility | Semantic Purpose |
|---|---|---|---|
| **Border** | `--border` | `border-border` | Default container borders, card dividers (`#e2e8f0`) |
| **Border Light** | `--border-light` | `border-border-light` | Subtle dividers, nested elements (`#f1f5f9`) |
| **Border Hover** | `--border-hover` | `hover:border-border-hover` | Interactive card and input hover (`#cbd5e1`) |
| **Border Focus** | `--border-focus` | `border-border-focus` | Input focus outline state (`#6366f1`) |

### Status Indicators
| Status | Base Token | Soft Token | Border Token | Semantic Purpose |
|---|---|---|---|---|
| **Success** | `text-success` | `bg-success-soft` | `border-success/30` | Completed, Published, Connected, Healthy |
| **Warning** | `text-warning` | `bg-warning-soft` | `border-warning/30` | In Review, Pending, Rate Limit Approaching |
| **Danger** | `text-danger` | `bg-danger-soft` | `border-danger/30` | Failed, Blocked, Critical Errors, Disconnected |
| **Info** | `text-info` | `bg-info-soft` | `border-info/30` | Scheduled, Queued, Processing, Diagnostics |

---

## 3. Typography Scale

The font family standardizes on system font stacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif`. Monospace elements use `JetBrains Mono, SF Mono, Menlo, monospace`.

| Hierarchy | Size | Weight | Tailwind Classes | Usage |
|---|---|---|---|---|
| **Display** | 24px (1.5rem) | 700 Bold | `text-2xl font-bold tracking-tight text-text-primary` | Marketing hero, landing metrics |
| **H1** | 20px (1.25rem) | 700 Bold | `text-xl font-bold tracking-tight text-text-primary` | Page header titles |
| **H2** | 18px (1.125rem) | 600 Semibold | `text-lg font-semibold tracking-tight text-text-primary` | Section titles, modal titles |
| **H3** | 14px (0.875rem) | 600 Semibold | `text-sm font-semibold text-text-primary` | Card titles, group headers |
| **H4** | 12px (0.75rem) | 600 Semibold | `text-xs font-semibold text-text-secondary uppercase` | Table column headers, field labels |
| **Body Large** | 14px (0.875rem) | 400 Regular | `text-sm text-text-secondary leading-relaxed` | Article body, composer textarea |
| **Body** | 13px (0.8125rem) | 400 Regular | `text-xs text-text-secondary leading-normal` | Table rows, default component text |
| **Caption** | 11px (0.6875rem) | 400 Regular | `text-[11px] text-text-muted` | Timestamps, metadata pills |
| **Code / Mono** | 11px / 12px | 500 Medium | `font-mono text-xs text-text-secondary` | Canonical IDs, latency, JSON payloads |

---

## 4. Spacing Scale

Standard Tailwind 4px base increments:
- `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px).
- Avoid arbitrary bracket spacing (e.g. `p-[13px]`, `gap-[11px]`). Use standard grid steps.

---

## 5. Border Radius Tokens

| Token | Value | Tailwind Utility | Component Usage |
|---|---|---|---|
| **Small** | `0.375rem` (6px) | `rounded-sm` / `rounded-md` | Tags, status dots, small badges |
| **Medium** | `0.5rem` (8px) | `rounded-lg` | Buttons, input controls, table wrappers |
| **Large** | `0.75rem` (12px) | `rounded-xl` | Cards, modals, drawers |
| **Full** | `9999px` | `rounded-full` | Avatars, status pills, circular action triggers |

---

## 6. Shadow System

| Token | Tailwind Class | Semantic Purpose |
|---|---|---|
| **None** | `shadow-none` | Flat cards, nested panels |
| **Subtle** | `shadow-subtle` | Buttons, toggle switches, table rows |
| **Card** | `shadow-card` | Surface cards, stat widgets |
| **Elevated** | `shadow-elevated` | Floating dropdown menus, popovers |
| **Modal** | `shadow-modal` | Centered dialog overlays |

---

## 7. Reusable Component Primitives

Import all foundational primitives from `@/components/ui`:

```javascript
import {
  Button,
  Badge,
  StatusBadge,
  PriorityBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  FormField,
  SearchInput,
  Modal,
  ConfirmDialog,
  Alert,
  PageContainer,
  PageHeader,
  Section,
  StatCard,
  DataTable,
  Tabs,
  EmptyState,
  LoadingState,
  ErrorState,
  Skeleton,
} from "../components/ui";
```

### Component Reference & API

#### Button
```jsx
<Button variant="primary" size="md" icon={Plus}>
  Create Post
</Button>
<Button variant="secondary" size="sm">
  Cancel
</Button>
<Button variant="outline" size="sm">
  Export
</Button>
<Button variant="danger" size="sm" icon={Trash2}>
  Delete
</Button>
<Button variant="ghost" size="xs">
  Inspect
</Button>
```
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `dangerOutline`, `link`
- **Sizes**: `xs`, `sm`, `md`, `lg`
- **Props**: `loading`, `disabled`, `icon`, `iconPosition`, `fullWidth`

#### Badge & StatusBadge
```jsx
<Badge variant="primary" size="sm" dot>Feature</Badge>
<Badge variant="success" size="sm">Active</Badge>
<StatusBadge status="Published" />
<StatusBadge status="Failed" />
<PriorityBadge priority="High" />
```
`StatusBadge` automatically matches `STATUS_CONFIG` mappings for color, label, and semantic soft backgrounds.

#### Card System
```jsx
<Card className="p-5">
  <CardHeader
    title="Daily Throughput"
    description="Publication velocity trends over 30 days"
    actions={<Button variant="ghost" size="xs">Details</Button>}
  />
  <CardContent>
    {/* Body */}
  </CardContent>
</Card>
```

#### StatCard
```jsx
<StatCard
  label="Total Reach"
  value="128.4K"
  trend="+12.4%"
  trendDirection="up"
  icon={Users}
  iconVariant="primary"
/>
```

#### Modal & ConfirmDialog
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  description="Modal subtitle description."
  maxWidth="max-w-xl"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Confirm</Button>
    </>
  }
>
  <p>Modal body content</p>
</Modal>
```

---

## 8. Showcase & Visual Catalog

Inspect every component interactively at route:
```
/design-system
```
Accessible via the sidebar navigation **Design System** entry.

---

## 9. Do's and Don'ts

| Do | Don't |
|---|---|
| Use `bg-surface`, `bg-background`, and `bg-surface-soft` | Don't use `bg-white`, `bg-[#f8fafc]`, or raw hex |
| Use `text-text-primary`, `text-text-secondary`, and `text-text-muted` | Don't use random `text-gray-900`, `text-slate-800` |
| Use `<StatusBadge status={item.status} />` | Don't create inline custom pill color mapping |
| Use `<Button variant="primary">` | Don't write raw `<button className="bg-blue-600...">` |
| Use `<PageContainer>` and `<PageHeader>` | Don't create bespoke margin and header structures |
| Use `shadow-card` and `border-border` | Don't apply large drop shadows (`shadow-2xl`) |
