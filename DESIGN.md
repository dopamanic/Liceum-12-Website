# STEM Lab — Design System Specification

> **Project:** Шкільна STEM-лабораторія (Ліцей №12)
> **Direction:** Clean Tech Minimalist — precision-grade design for a science laboratory
> **References:** Stripe (typography hierarchy, whitespace), Vercel (dark mode, component surfaces), Linear (motion discipline, icon language), Raycast (card modules), Apple Developer (scientific tone, measured layout)
> **Date:** 2026-10-29

---

## 1. Design Principles

1. **Precision over decoration.** Every visual element encodes information. No ornamental gradients, no numbered markers on non-sequential content, no eyebrow labels above headings. If removing an element doesn't lose meaning, remove it.

2. **One bold move, quiet discipline everywhere else.** The hero typographic treatment is the singular visual statement. Cards, sections, and navigation stay restrained so the hierarchy reads instantly.

3. **Scientific warmth.** The page is for students and parents, not investors. The tone is inviting and clear — precise language that respects the reader without marketing exaggeration.

4. **Motion as confirmation, not performance.** A single orchestrated hero entrance. After that, motion only answers user action: opening a modal, toggling a theme, pressing a button. No scattered scroll-triggered fade-ups.

---

## 2. Color System

All colors defined as CSS custom properties on `:root`. Dark mode overrides via `[data-theme="dark"]`.

### Light Mode (Default)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#FAFBFD` | Page background — cool off-white, not warm cream |
| `--color-bg-raised` | `#FFFFFF` | Card / modal surface |
| `--color-bg-muted` | `#F1F3F8` | Muted section backgrounds, input fields |
| `--color-fg` | `#151929` | Primary text — deep navy, slightly warmer than pure black |
| `--color-fg-muted` | `#616B84` | Secondary text, descriptions, labels |
| `--color-fg-subtle` | `#9AA0B4` | Placeholder text, disabled state |
| `--color-accent` | `#4338CA` | Primary actions — deep indigo, not startup-blue |
| `--color-accent-hover` | `#3730A3` | Hover state for primary actions |
| `--color-accent-soft` | `#E8E6F9` | Accent tint for badges, tags, icon backgrounds |
| `--color-signal` | `#B45309` | Secondary accent — amber/copper (discovery, energy) |
| `--color-signal-soft` | `#FEF3C7` | Signal tint for highlights |
| `--color-success` | `#059669` | Confirmation, enrolled status |
| `--color-success-soft` | `#D1FAE5` | Success background |
| `--color-error` | `#DC2626` | Validation errors |
| `--color-border` | `transparent` | No visible borders — use shadows |
| `--shadow-surface` | See shadows section | Card/surface elevation |
| `--shadow-surface-hover` | See shadows section | Hover lift |

### Dark Mode

| Token | Override |
|---|---|
| `--color-bg` | `#0C0E16` |
| `--color-bg-raised` | `#151829` |
| `--color-bg-muted` | `#1A1D30` |
| `--color-fg` | `#EDEEF3` |
| `--color-fg-muted` | `#8B91A8` |
| `--color-fg-subtle` | `#5A6078` |
| `--color-accent` | `#6366F1` |
| `--color-accent-hover` | `#818CF8` |
| `--color-accent-soft` | `#1E1B4B` |
| `--color-signal` | `#D97706` |
| `--color-signal-soft` | `#451A03` |
| `--color-success` | `#34D399` |
| `--color-success-soft` | `#064E3B` |
| `--color-error` | `#F87171` |

**Rationale:** Deep indigo (`#4338CA`) reads as scientific precision without being the generic startup blue (`#2563EB`). The amber signal color (`#B45309`) adds warmth without being childish — it references copper traces, circuit boards, the physical side of STEM. The cool off-white background avoids both pure-white glare and the warm-cream AI default.

---

## 3. Typography

### Typeface: Space Grotesk (single family)

**Why:** Space Grotesk descends from Space Mono — it carries a monospaced heritage that signals "technical" and "engineering" without being a monospace font. It has distinctive letterforms (look at the `a`, `g`, `R`) that set this page apart from the Inter/system-ui default. It performs well at both display and body sizes.

**Load via Google Fonts:** `Space+Grotesk:wght@400;500;600;700`

### Type Scale

| Token | Size | Weight | Line-Height | Letter-Spacing | Usage |
|---|---|---|---|---|---|
| `--type-display` | `56px` (mobile: `36px`) | 700 | 1.05 | `-0.03em` | Hero headline only |
| `--type-h2` | `36px` (mobile: `28px`) | 700 | 1.15 | `-0.02em` | Section headings |
| `--type-h3` | `20px` (mobile: `18px`) | 600 | 1.3 | `-0.01em` | Card titles, modal titles |
| `--type-body` | `16px` | 400 | 1.6 | `0` | Body text, descriptions |
| `--type-body-sm` | `14px` | 400 | 1.55 | `0` | Secondary text, form labels |
| `--type-caption` | `12px` | 500 | 1.4 | `0.01em` | Tags, badges, status labels |

### Typography Rules

- `text-wrap: balance` on all headings (`h1`, `h2`, `h3`)
- `text-wrap: pretty` on all body text (`p`, `li`, labels)
- `-webkit-font-smoothing: antialiased` on `html` root
- `font-variant-numeric: tabular-nums` on all dynamic counters (cabinet badge)
- Line length capped at 60ch for body text
- **No ALL-CAPS** for labels or tags — sentence case only
- **No single-word accenting** in headlines (no italic/bold/color on one word)

---

## 4. Surfaces & Shadows

### Shadow System (not borders)

Surfaces use layered `box-shadow` for depth, not `border`. Per the surfaces skill — shadows adapt to any background via transparency; solid borders don't.

```
Light mode:
--shadow-surface:
  0 0 0 1px rgba(21, 25, 41, 0.05),
  0 1px 3px -1px rgba(21, 25, 41, 0.06),
  0 3px 8px -2px rgba(21, 25, 41, 0.04);

--shadow-surface-hover:
  0 0 0 1px rgba(67, 56, 202, 0.15),
  0 2px 6px -1px rgba(21, 25, 41, 0.08),
  0 8px 20px -4px rgba(21, 25, 41, 0.06);

--shadow-modal:
  0 0 0 1px rgba(21, 25, 41, 0.06),
  0 16px 40px -8px rgba(21, 25, 41, 0.16),
  0 4px 12px -2px rgba(21, 25, 41, 0.08);

Dark mode:
--shadow-surface: 0 0 0 1px rgba(255, 255, 255, 0.06);
--shadow-surface-hover: 0 0 0 1px rgba(99, 102, 241, 0.3);
--shadow-modal:
  0 0 0 1px rgba(255, 255, 255, 0.08),
  0 16px 40px -8px rgba(0, 0, 0, 0.5);
```

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Tags, badges, small inputs |
| `--radius-md` | `12px` | Buttons, form inputs |
| `--radius-lg` | `16px` | Cards |
| `--radius-xl` | `20px` | Modals, large containers |
| `--radius-full` | `9999px` | Pills, avatar badges |

**Concentric radius rule:** `outerRadius = innerRadius + padding`. Card (`16px` radius, `16px` padding) → inner element = `16px` radius. Card (`16px` radius, `8px` padding) → inner element = `8px` radius.

### Card Component

```
.card {
  background: var(--color-bg-raised);
  box-shadow: var(--shadow-surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: box-shadow 200ms ease-out, transform 200ms ease-out;
}
.card:hover {
  box-shadow: var(--shadow-surface-hover);
  transform: translateY(-1px);
}
.card:active {
  transform: scale(0.985);
}
```

---

## 5. Spacing

8px base grid. All spacing values are multiples of 4px or 8px.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Tight gaps (icon + label) |
| `--space-2` | `8px` | Inline spacing, tag padding |
| `--space-3` | `12px` | Form field gaps |
| `--space-4` | `16px` | Card internal padding (compact), element spacing |
| `--space-6` | `24px` | Card padding, section element gaps |
| `--space-8` | `32px` | Section title → content gap |
| `--space-12` | `48px` | Between major content blocks |
| `--space-16` | `64px` | Section vertical padding (mobile) |
| `--space-24` | `96px` | Section vertical padding (desktop) |
| `--space-32` | `128px` | Hero vertical padding |

---

## 6. Layout

### Grid

- Max content width: `1120px`
- Side gutters: `16px` (mobile), `24px` (desktop)
- Course cards: 2-column grid on `≥640px`, 1-column on mobile
- Grid gap: `20px`

### Alignment

- **Left-aligned** content throughout — headlines, body text, CTAs all anchor left
- Section headings sit above their content, not centered
- Hero: left-aligned with max-width constraint on text block (`560px`)
- Stats grid in About: 2×2 on all breakpoints

### Content Width Constraints

| Element | Max Width |
|---|---|
| Hero text block | `560px` |
| Body paragraphs | `60ch` (~540px) |
| Section descriptions | `480px` |
| Modals | `440px` |

---

## 7. Components

### Header

```
- Height: 56px
- Position: fixed, z-50
- Background: var(--color-bg) at 80% opacity, backdrop-blur(12px), saturate(1.5)
- Bottom edge: 1px shadow ring (from --shadow-surface first layer only)
- Logo: "STEM Lab" in 600 weight, with a small indigo square icon (16×16, radius 4px) containing an abstract layers mark
- Nav links: --color-fg-muted, hover → --color-fg, no underline animation (clean)
- Theme toggle: sun/moon icon swap, cross-fade animation (per motion skill)
- Cabinet badge: pill shape (--radius-full), --color-bg-muted background, shadow-surface, counter uses --color-accent background + white text, tabular-nums
- Mobile: hamburger → slide-down nav panel
```

### Hero Section

```
- Padding: 128px top, 96px bottom (desktop) / 96px top, 64px bottom (mobile)
- Background: subtle radial gradient from accent-soft at top-left, fading to bg
- Content: left-aligned, max-width 560px
- Status pill: inline-flex, --color-accent-soft bg, --color-accent text, sentence case ("Набір 2026–2027")
- Headline: --type-display, --color-fg
  "Технології, що формують майбутнє"
  No single-word accenting. No gradient text. The type itself IS the design element.
- Description: --type-body, --color-fg-muted, max-width 480px
- Buttons: primary (filled, --color-accent) + secondary (shadow-surface, --color-fg)
  Labels: "Обрати напрямок" / "Дізнатися більше" — no arrows appended
- Entry animation: staggered (pill → title → description → buttons), 100ms between groups, opacity 0→1 + translateY(12px)→0, 300ms each, ease-out. One-time on load only.
```

### Course Card

```
- Surface: .card styles (shadow, radius-lg, bg-raised)
- Padding: 24px
- Icon container: 44×44px, --color-accent-soft bg, radius 12px (concentric: card radius 16 - padding... but icon box is inside card with 24px padding, so treat as separate surface → own radius)
- Title: --type-h3, --color-fg
- Description: --type-body-sm, --color-fg-muted, 3 lines max
- Tags: inline row, --type-caption, --color-fg-muted text, --color-bg-muted bg, --radius-sm, padding 2px 8px. Sentence case, no ALL-CAPS.
- CTA area: bottom of card, separated by top shadow-ring (not border), --type-body-sm, --color-accent text, "Записатися" — no arrow
- Enrolled state: CTA area replaced by status tag "Записано" with --color-success-soft bg, --color-success text, radius-full
- Hover: shadow-surface-hover, translateY(-1px)
- Press: scale(0.985), 100ms
- Cursor: pointer (unless enrolled)
```

### Registration Modal

```
- Overlay: fixed inset-0, rgba(0,0,0,0.4) light / rgba(0,0,0,0.6) dark, fade 200ms
- Content: centered, max-width 440px, --color-bg-raised, --shadow-modal, --radius-xl, padding 32px
- Entry: content slides up 16px + opacity, 250ms cubic-bezier(0.16, 1, 0.3, 1) — fast overshoot-free spring
- Close: overlay click, Escape key, X button (top-right, 44×44 hit area min)
- Form:
  - Title: --type-h3, --color-fg
  - Subtitle: --type-body-sm, --color-fg-muted (course name)
  - Fields: 12px gap between fields
    - Label: --type-caption, --color-fg-muted, above field
    - Input: --color-bg-muted bg, --radius-md, padding 12px 16px, --type-body-sm
    - Focus: 2px ring --color-accent at 30% opacity, border-color → --color-accent
    - Select: same as input + custom chevron SVG
  - Error: --type-caption, --color-error
  - Submit button: full-width, --color-accent, --radius-md, --type-body-sm weight 600, padding 12px
    - Hover: --color-accent-hover
    - Press: scale(0.97)
- Success state: fade-swap from form
  - Checkmark: 56×56 circle, --color-success-soft bg, animated SVG check (scale 0→1, 400ms spring)
  - Title: "Готово" — --type-h3
  - Text: --type-body-sm, --color-fg-muted
  - Close button: secondary style
```

### Cabinet Modal

```
- Same overlay/content shell as registration modal
- Title: "Мій кабінет" — --type-h3
- Enrolled items: vertical list, 8px gap
  - Item: --color-bg-muted bg, --radius-md, padding 16px
  - Left: course title (--type-body-sm weight 600) + meta line (name · class)
  - Right: delete button (trash icon, --color-fg-subtle, hover → --color-error), 44×44 hit area
- Empty state:
  - Icon: 48×48 document icon in --color-fg-subtle
  - Title: "Поки що пусто" — --type-body-sm weight 600
  - Text: --type-body-sm, --color-fg-muted
  - No sad faces, no emoji, no apologies. Empty state is an invitation to act.
- Count footer: --type-caption, --color-fg-muted, centered
```

### Footer

```
- Top edge: same shadow-ring as header bottom
- Padding: 32px vertical
- Layout: flex between logo-mark + copyright
- Logo: small version (20×20 icon + "STEM Lab" in 600 weight, --type-body-sm)
- Copyright: --type-caption, --color-fg-muted
```

---

## 8. Motion

### Guiding Constraints

- **No bounce / overshoot.** Spring `bounce` = 0 everywhere.
- **No scroll-triggered fade-ups** on sections. Content is present when scrolled to.
- **Transitions for interactive state** (hover, toggle, open/close) — interruptible by nature.
- **Keyframes for one-shot sequences** (hero entrance, success checkmark).

### Transition Defaults

```
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* Modal enter, fast decel */
--ease-in: cubic-bezier(0.4, 0, 1, 1);        /* Modal exit */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1); /* General transitions */
--duration-fast: 150ms;     /* Press, hover, small state */
--duration-normal: 200ms;   /* Theme toggle, card hover */
--duration-slow: 300ms;     /* Modal enter, hero stagger items */
--duration-exit: 150ms;     /* Modal exit, shorter than enter */
```

### Specifics

| Element | Trigger | Animation |
|---|---|---|
| Hero items | Page load (once) | Stagger 5 items × 100ms. Each: opacity 0→1, translateY(12→0), 300ms ease-out |
| Card hover | Mouse enter | shadow + translateY(-1px), 200ms ease-out |
| Card press | Mouse down | scale(0.985), 100ms |
| Button press | Mouse down | scale(0.97), 100ms |
| Theme toggle | Click | Icon cross-fade: scale 0.25→1, opacity 0→1, 300ms cubic-bezier(0.2,0,0,1). No bounce. |
| Modal enter | Open | Overlay: opacity 0→1, 200ms. Content: opacity 0→1, translateY(16→0), 250ms --ease-out |
| Modal exit | Close | Content: opacity 1→0, translateY(0→-8), 150ms --ease-in. Overlay: opacity 1→0, 200ms |
| Success check | Registration | Scale 0→1, 400ms spring (no overshoot) |
| Badge count | Update | Scale pulse 1→1.15→1, 200ms |
| Mobile menu | Toggle | Height 0→auto, opacity 0→1, 250ms ease-out |

### `prefers-reduced-motion`

All motion disabled: transitions set to `0ms`, keyframes suppressed, content appears immediately.

---

## 9. Interaction States

| State | Visual |
|---|---|
| Default | As designed |
| Hover | Shadow lift, color shift (per component) |
| Focus-visible | 2px ring in --color-accent at 40% opacity, offset 2px. Always visible on keyboard nav. |
| Active/pressed | scale(0.97) on buttons, scale(0.985) on cards |
| Disabled | opacity 0.5, pointer-events none |
| Loading | Subtle pulse animation on button text |

---

## 10. Iconography

- **Style:** 24×24 viewBox, 1.5px stroke, round line-cap and join
- **Source:** Inline SVG, not icon font
- **Color:** `currentColor` — inherits from parent text color
- **Specific icons:**
  - Logo mark: abstract stacked layers (suggests knowledge building)
  - Robotics: robot/circuit
  - 3D: stacked polygons / layers
  - Python: code brackets with slash
  - IoT: wifi/signal rings with center dot
  - Theme: sun (light) ↔ moon (dark), cross-fade swap
  - Cabinet: user silhouette
  - Close: × (18×18)
  - Delete: trash can
  - Navigation chevron: custom SVG, not `→` character

---

## 11. Content & Copy Guidelines

- **Tone:** Precise, inviting, no hype. "Шкільна STEM-лабораторія" not "Інноваційний EdTech-хаб"
- **Headline:** Statement, not question. "Технології, що формують майбутнє" — declarative, confident
- **Descriptions:** One sentence that says what it is, one that says what you'll do. No bullet lists in cards.
- **CTAs:** Verb + object. "Обрати напрямок", "Записатися", "Дізнатися більше". No arrows, no "click here"
- **Empty states:** Direction, not mood. "Поки що пусто. Оберіть напрямок, щоб розпочати."
- **Errors:** What went wrong + how to fix. "Заповніть усі поля" not "Ой, щось пішло не так"
- **No emoji** in interface text
- **Sentence case** everywhere — no Title Case in Ukrainian, no ALL CAPS

---

## 12. Accessibility

- Focus ring visible on all interactive elements (`:focus-visible` only, not `:focus`)
- Min 44×44px hit areas on all buttons and links (extend with pseudo-element if visual is smaller)
- Color contrast: all text meets WCAG AA (4.5:1 normal text, 3:1 large text)
- `prefers-reduced-motion: reduce` disables all animation
- `prefers-color-scheme` respected as initial theme if no localStorage override
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<dialog>`
- `aria-label` on icon-only buttons (theme toggle, close, delete)
- Modals trap focus, return focus on close
- Skip-to-content link (visually hidden until focused)

---

## 13. Responsive Breakpoints

| Name | Min-width | Key changes |
|---|---|---|
| Mobile | `0px` | Single column, 16px gutters, condensed type scale |
| Tablet | `640px` | 2-column cards grid, nav visible |
| Desktop | `1024px` | Full type scale, expanded spacing |

---

## 14. File Structure

Single self-contained `index.html` file:
- Tailwind CSS via CDN (`3.4.4`)
- Space Grotesk via Google Fonts
- All CSS custom properties in `<style>` block
- All logic in `<script>` block at end of `<body>`
- localStorage keys: `stemlab_theme`, `stemlab_registrations`

---

## 15. Anti-Patterns (Explicitly Avoided)

| Pattern | Why avoided |
|---|---|
| Warm cream background (#F4F1EA) | AI default, not specific to STEM |
| Terracotta / clay accent | Claude interaction color, reads as AI-generated |
| ALL-CAPS eyebrow labels | Generic SaaS template chrome |
| Numbered markers (01/02/03) on cards | Content is not sequential |
| `→` arrows on button/link text | Template chrome tell |
| Middle-dot separators (A · B · C) | Template chrome tell |
| Gradient text on headlines | Overused, reduces readability |
| Identical radius on every element | Lazy — radius should match hierarchy |
| `border: 1px solid` on cards | Shadows adapt better, per surfaces discipline |
| Fade-up on every scroll section | Motion as performance, not information |
| `transition: all` | Always specify exact properties |
