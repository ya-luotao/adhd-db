# ADHD-DB Design Guide

> 简介 · 专业 · 可以信赖
> Concise · Professional · Trustworthy

## Design Principles

### 1. 简介 (Concise)
- **Less is more**: Remove unnecessary decoration and visual noise
- **Clear hierarchy**: Important information stands out naturally
- **Whitespace**: Give content room to breathe
- **Direct language**: Labels and copy are clear and actionable

### 2. 专业 (Professional)
- **Medical-grade precision**: Data presentation reflects clinical accuracy
- **Systematic consistency**: Every element follows predictable patterns
- **Neutral palette**: Colors inform, not distract
- **Typography clarity**: Readable at any size, accessible to all

### 3. 可以信赖 (Trustworthy)
- **Source transparency**: Clear attribution and data provenance
- **Structured data**: Information organized for verification
- **Subtle confidence**: Design that doesn't try too hard
- **Accessibility**: Inclusive design builds trust with all users

---

## Color System

### Primary Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1a56db` | Primary actions, links, focus states |
| `--color-primary-hover` | `#1e429f` | Hover state for primary elements |
| `--color-primary-light` | `#e1effe` | Primary backgrounds, highlights |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#057a55` | Approved, available, positive states |
| `--color-success-light` | `#def7ec` | Success backgrounds |
| `--color-warning` | `#c27803` | Warnings, cautions |
| `--color-warning-light` | `#fdf6b2` | Warning backgrounds |
| `--color-danger` | `#c81e1e` | Errors, serious warnings, stimulant class |
| `--color-danger-light` | `#fde8e8` | Danger backgrounds |

### Neutral Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#111827` | Headings, primary text |
| `--color-text-secondary` | `#4b5563` | Body text, descriptions |
| `--color-text-tertiary` | `#6b7280` | Captions, metadata |
| `--color-text-muted` | `#9ca3af` | Disabled, placeholder text |
| `--color-border` | `#e5e7eb` | Borders, dividers |
| `--color-border-light` | `#f3f4f6` | Subtle borders |
| `--color-bg-primary` | `#ffffff` | Primary background |
| `--color-bg-secondary` | `#f9fafb` | Secondary background, cards |
| `--color-bg-tertiary` | `#f3f4f6` | Tertiary background, hover states |

### Drug Classification Colors

| Class | Background | Text | Usage |
|-------|------------|------|-------|
| Stimulant | `#fde8e8` | `#9b1c1c` | Stimulant medications |
| Non-stimulant | `#e1effe` | `#1e429f` | Non-stimulant medications |

### Status Colors

| Status | Background | Text | Usage |
|--------|------------|------|-------|
| Available | `#def7ec` | `#03543f` | Drug approved/available |
| Unavailable | `#f3f4f6` | `#6b7280` | Not available in region |
| Pending | `#fdf6b2` | `#723b13` | Pending approval |

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 0.75rem (12px) | 1rem | 400 | Labels, badges |
| `--text-sm` | 0.875rem (14px) | 1.25rem | 400 | Secondary text, captions |
| `--text-base` | 1rem (16px) | 1.5rem | 400 | Body text |
| `--text-lg` | 1.125rem (18px) | 1.75rem | 500 | Lead paragraphs |
| `--text-xl` | 1.25rem (20px) | 1.75rem | 600 | Section headings |
| `--text-2xl` | 1.5rem (24px) | 2rem | 600 | Page subheadings |
| `--text-3xl` | 1.875rem (30px) | 2.25rem | 700 | Page titles |
| `--text-4xl` | 2.25rem (36px) | 2.5rem | 700 | Hero text |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasis, labels |
| `--font-semibold` | 600 | Headings, buttons |
| `--font-bold` | 700 | Strong emphasis |

---

## Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0 | Reset |
| `--space-1` | 0.25rem (4px) | Tight spacing |
| `--space-2` | 0.5rem (8px) | Compact elements |
| `--space-3` | 0.75rem (12px) | Related items |
| `--space-4` | 1rem (16px) | Standard spacing |
| `--space-5` | 1.25rem (20px) | Medium spacing |
| `--space-6` | 1.5rem (24px) | Section spacing |
| `--space-8` | 2rem (32px) | Large spacing |
| `--space-10` | 2.5rem (40px) | Extra large |
| `--space-12` | 3rem (48px) | Section dividers |
| `--space-16` | 4rem (64px) | Page sections |

### Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--container-max` | 1200px | Main content width |
| `--container-narrow` | 800px | Article content |
| `--container-wide` | 1400px | Full-width layouts |

---

## Components

### Cards

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

### Badges / Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: 1;
}

/* Variants */
.badge-stimulant {
  background: var(--color-danger-light);
  color: #9b1c1c;
}

.badge-non-stimulant {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
}

.badge-available {
  background: var(--color-success-light);
  color: #03543f;
}
```

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### Form Inputs

```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.375rem (6px) | Buttons, inputs |
| `--radius-lg` | 0.5rem (8px) | Cards, containers |
| `--radius-xl` | 0.75rem (12px) | Large cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, popovers |

---

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `0.1s ease` | Micro-interactions |
| `--transition-base` | `0.15s ease` | Buttons, inputs |
| `--transition-slow` | `0.3s ease` | Page transitions |

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have visible focus states
- Don't rely on color alone to convey information

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Guidelines

### Do's ✓
- Use semantic HTML elements
- Maintain consistent spacing with design tokens
- Provide clear visual hierarchy
- Include hover and focus states
- Test with screen readers

### Don'ts ✗
- Don't use arbitrary colors not in the system
- Don't mix spacing values inconsistently
- Don't rely solely on color for meaning
- Don't hide important information
- Don't use decorative elements that don't serve a purpose

---

## File Structure

```
apps/web/src/
├── styles/
│   └── tokens.css      # CSS custom properties
├── layouts/
│   └── Layout.astro    # Global styles
└── components/         # Reusable components
```
