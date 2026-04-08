# Design System Specification: Tactile Playground × Kinder Joy

## 1. Overview & Creative North Star

### The Creative North Star: "The Tactile Playground"
This design system rejects the "flat and plastic" aesthetic typical of children's software. Instead, it embraces **The Tactile Playground**—a philosophy that digital interfaces should feel like physical, high-end wooden toys and layered paper cutouts. We move beyond generic "kid-friendly" tropes by using sophisticated tonal layering, intentional asymmetry, and "bouncy" geometry to create a safe, premium, and encouraging environment.

By leveraging high-contrast typography scales and overlapping surface containers, we guide the young user's eye through a narrative flow rather than a rigid, intimidating grid. The goal is an interface that feels less like a computer program and more like a physical companion.

### Brand Identity (Kinder Joy)

| Property | Value |
| --- | --- |
| Aesthetic | Playful / Friendly / Accessible |
| Target Audience | Children and caregivers |
| UI Density | Low — generous spacing, clear hierarchy |

---

## 2. Colors

Our palette communicates positivity and trust. Each color has a defined semantic role; never swap them arbitrarily.

### Palette

| Role | Hex | Name | Primary use |
| --- | --- | --- | --- |
| **Primary** | `#38B6FF` | Sky Blue | Primary actions, key UI elements, highlights |
| **Secondary** | `#FFD600` | Vivid Yellow | Secondary actions, attention-drawing accents |
| **Tertiary** | `#7ED957` | Fresh Green | Success states, positive actions, confirmations |
| **Neutral** | `#5C799B` | Muted Blue-Grey | Body text, icons, supporting UI chrome |
| **Danger** | `#E74C3C` | Red | Destructive actions only |

### Surface Hierarchy

Treat the UI as a series of stacked, organic shapes. Never use surfaces interchangeably — each tier has a fixed position in the z-stack.

| Token | Hex | Use |
| --- | --- | --- |
| `--surface-app` | `#1A1A2E` | Outermost shell / dark mode background |
| `--surface-card` | `#E8EAFF` | Primary content panels |
| `--surface-cell` | `#D8DCFA` | Individual component tiles |
| `--surface-sidebar` | `#F4F6FF` | Sidebars, secondary panels |
| `--surface-container-lowest` | `#FFFFFF` | Most interactive elements (cards, bubbles) — pops against card |

- **Glass & Gradient Rule:** For floating headers or navigation bars, use a semi-transparent `surface` with a 20px backdrop blur.
- **Signature Textures:** Apply a subtle linear gradient (from `primary` to a lighter primary tint) on large action areas to provide a "convex" physical feel.

### Tint Palette (Icon Backgrounds)

Small icon circles use softened tints of brand colors as their fill. These are not full-opacity brand colors — they are pastel variants that keep the UI readable at small sizes.

| Role | Background | Icon Color | Use |
| --- | --- | --- | --- |
| Blue tint | `#E0F4FF` | `#38B6FF` | Location, navigation, info actions |
| Yellow tint | `#FFF8D6` | `#E6B800` | GPS, highlights, attention |
| Green tint | `#EDFCE0` | `#4DB82A` | Success, confirmations, description |

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Define boundaries with background color shifts, not lines. A main activity area in `surface-cell` should sit directly on `surface-card`—this creates a softer transition that feels "carved" rather than "drawn."

**Exception — Focus Borders:** Interactive form inputs may carry a `2px transparent border` that becomes `--color-primary` on `:focus`. This is purely a functional affordance (keyboard/accessibility navigation), not a decorative divider, and is therefore exempt from this rule.

---

## 3. Typography

### Typefaces
A duo-font system balances whimsy with extreme legibility.

| Role | Font | Description |
| --- | --- | --- |
| Display & Headlines | **Plus Jakarta Sans** | Geometric, friendly, open apertures. Wide character spacing feels approachable and "breathable." |
| Body & Labels | **Be Vietnam Pro** | Highly legible, clean sans-serif. High x-height is easy for early readers. |

Both typefaces share rounded terminal characteristics that reinforce the playful brand personality. Consistent letter-spacing: slightly open for labels, default for body.

### Type Scale

| Role | Size | Weight | Font | Use |
| --- | --- | --- | --- | --- |
| Display | 3.5rem (56px) | 800 | Plus Jakarta Sans | Celebratory moments, hero headings |
| Headline | 1.75rem (28px) | 700 | Plus Jakarta Sans | Section titles |
| Body | 1rem–1.125rem (16–18px) | 400–500 | Be Vietnam Pro | Instructions, descriptions, paragraph text |
| Label | 0.875rem–1rem (14–16px) | 600 | Be Vietnam Pro | Button labels, tags, captions |

**Hierarchy Note:** Use `--text-primary` (`#2C3E6B`) for text on light surfaces and `--text-on-primary` (`#FFFFFF`) on filled primary backgrounds. Maintain a contrast ratio of at least 4.5:1 at all times.

---

## 4. Spacing & Layout

- **Base unit:** 8px — all spacing values are multiples of 8
- Cards and panels: `16–24px` internal padding
- Grid gaps: `12–16px` between cells
- Max content width on mobile: `480px`, centered

### Spacing Scale

| Token | Value | Use |
| --- | --- | --- |
| `--space-xs` | 4px | Icon nudges, fine adjustments |
| `--space-sm` | 8px | Inline gaps, tight stacks |
| `--space-md` | 16px | Card padding, component gaps |
| `--space-lg` | 24px | Section padding |
| `--space-xl` | 40px | Page-level vertical rhythm |

### Corner Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 8px | Small chips, badges |
| `--radius-md` | 16px | Cards, containers, bubbles |
| `--radius-pill` | 999px | Buttons, inputs, all interactive controls |
| `--radius-circle` | 50% | Icon buttons, avatars |

**No Sharp Corners rule:** Never use `border-radius: 0` or values below `--radius-sm`. Everything must feel soft.

---

## 5. Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Physics**, never through harsh shadows.

- **The Layering Principle:** Stack `surface-cell` over `surface-card` to create natural prominence. This "paper-on-paper" look is more intuitive for children than complex 3D lighting.
- **Ambient Shadows:** When an element must "float" (modal, FAB), use a diffused, tinted shadow: `rgba(14, 48, 78, 0.08)` with a 40px blur. Never use pure black shadows.
- **The Ghost Border:** If a boundary is strictly required for accessibility, use `--neutral` at 15% opacity. Never use pure black or high-contrast grays.
- **Glassmorphism:** Use `surface-card` at 60% opacity with a heavy backdrop blur for overlay panels, letting background colors "glow" through.
- **Press Shadow:** Simulate physical depth on buttons with a 4px bottom shadow in a darker shade of the button's fill color.

---

## 6. Components

### Buttons

All buttons are pill-shaped (`border-radius: 999px`) and use Label type size. Minimum touch target: 44×44px.

| Variant | Background | Text | Use |
| --- | --- | --- | --- |
| **Primary** | `#38B6FF` | White | Main call-to-action |
| **Secondary** | Transparent | `#38B6FF` | Text-only alternative |
| **Inverted** | `#2C3E6B` (deep navy) | White | Dark surface CTAs |
| **Outlined** | Transparent | Dark | Low-emphasis actions |

All primary buttons carry a 4px "press-shadow" in a darker primary shade to simulate a physical button.

#### Icon Buttons (Circular FAB-style)
~44px diameter. Semantic color coding:

| Color | Hex | Meaning |
| --- | --- | --- |
| Tertiary green | `#7ED957` | Edit / create |
| Secondary yellow | `#FFD600` | Share / connect |
| Primary blue | `#38B6FF` | Tag / categorize |
| Danger red | `#E74C3C` | Delete / remove |

### Cards & Lists
**Forbid divider lines.** Separate list items with `--space-md` (16px) of vertical white space. Use `surface-cell` for the card body and `surface-container-lowest` for inner data sections to create recessed depth.

### Interactive "Bubbles" (Custom Component)
For kid-friendly category selection, use large Bubbles instead of radio buttons. These are `surface-container-lowest` rounded tiles that transition to a primary-tinted state when tapped, providing instant, encouraging feedback.
- Minimum size: 120px tall, full column width
- Emoji icon: 48px, slightly offset for playful asymmetry
- Label: `Be Vietnam Pro`, 600 weight
- Tap state: background shifts to `tertiary` tint; press animates `translateY(2px)`

### Input Fields

Avoid the "form" look. Inputs are full-width pill-shaped (`border-radius: 999px`) with:

- Background: `--surface-card` (`#FFFFFF`)
- `2px transparent border` that transitions to `--color-primary` on focus, paired with a `4px` primary glow ring (`rgba(56, 182, 255, 0.15)`)
- Placeholder text in `--text-muted` (`#8A9BBF`)
- Labels always placed **outside** the container, never floating inside
- Textareas use `--radius-md` (16px) instead of pill, with `resize: none`

### Section Label Icons

Form section labels pair a small **28px icon circle** with the label text to add color and communicate context at a glance. The circle uses a pastel tint background (see Tint Palette) with a matching brand-colored emoji or SVG icon inside.

```text
[icon circle] Label text
```

- Circle size: 28×28px, `border-radius: 50%`
- Icon size: 14px emoji or SVG
- Color assignment: yellow tint for location, blue tint for description/chat, green tint for success/confirmation
- Labels use `font-weight: 700` and `--text-primary` (elevated from previous `--text-muted` 600 weight)

### Progress Stepper

Multi-step flows use a horizontal row of pill-shaped dots below the header to communicate progress.

| State | Width | Color |
| --- | --- | --- |
| Done | 24px | `--color-tertiary` (`#7ED957`) |
| Active | 36px (wider) | `--color-primary` (`#38B6FF`) |
| Upcoming | 24px | `--surface-cell` (`#D8DCFA`) |

- Height: 6px, `border-radius: 999px`
- Gap between dots: 6px
- Width and color transition with `300ms ease`
- Marked `aria-hidden="true"` — not a substitute for accessible step labels

### Photo Upload

The photo upload zone is a visually distinct dashed-border card:

- Background: `#F0FAFF` (light blue tint)
- Border: `2px dashed --color-primary`
- Hover: background deepens to `#E0F4FF`, border darkens to `#1A9FEF`
- Camera icon sits inside a **64px filled blue circle** (`--color-primary` background, white icon, `box-shadow: 0 6px 20px rgba(56, 182, 255, 0.40)`)
- Title text: `Plus Jakarta Sans`, 700 weight, `--text-primary`
- Subtitle text: 0.8125rem, `--text-muted`, centered

### Navigation Bar

Horizontal icon bar with three slots: Home, Search, Profile.

- Active state: filled circle behind the icon in `#2C3E6B` (deep navy)
- Inactive: neutral tone, no fill
- Icons: outlined style, 24px, 2px stroke weight

### Labels / Chips
Pill-shaped inline labels (`border-radius: 999px`):
- Icon-prefixed (category emoji or edit icon)
- Tertiary green fill (`#7ED957`) with white text for positive/active states
- Used for status indicators, category tags, metadata chips

---

## 7. Iconography

- **Style:** Outlined with rounded caps, consistent 2px stroke weight
- **Size:** 48px for bubble/category icons, 24px standard, 16px for inline label icons
- **Color:** White on filled backgrounds, `--neutral` on empty
- **Placement:** Offset icons by `--space-xs` (4px) asymmetrically to create a hand-placed, playful feel

---

## 8. Accessibility

- All interactive elements: minimum **44×44px** touch target
- Focus rings: `#38B6FF` (primary), 2px, 2px offset — never remove `:focus-visible`
- `#FFD600` yellow on white: use with dark text only to meet 3:1 contrast minimum
- `#38B6FF` primary on white: passes AA for large text; pair with dark text for small UI
- Contrast ratio target: **4.5:1** for all body text, **3:1** minimum for large/bold text and UI components

---

## 9. Design Tokens (CSS Variables)

```css
:root {
  /* Brand Colors */
  --color-primary:    #38B6FF;
  --color-secondary:  #FFD600;
  --color-tertiary:   #7ED957;
  --color-neutral:    #5C799B;
  --color-danger:     #E74C3C;

  /* Surfaces */
  --surface-app:                #1A1A2E;
  --surface-card:               #E8EAFF;
  --surface-cell:               #D8DCFA;
  --surface-sidebar:            #F4F6FF;
  --surface-container-lowest:   #FFFFFF;

  /* Text */
  --text-primary:               #2C3E6B;
  --text-muted:                 #8A9BBF;
  --text-on-primary:            #FFFFFF;

  /* Radius */
  --radius-sm:      8px;
  --radius-md:      16px;
  --radius-pill:    999px;
  --radius-circle:  50%;

  /* Spacing (8pt scale) */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   16px;
  --space-lg:   24px;
  --space-xl:   40px;

  /* Elevation */
  --shadow-ambient: 0 10px 40px rgba(14, 48, 78, 0.08);
  --shadow-press:   0 4px 0px rgba(14, 48, 78, 0.20);
  --shadow-float:   0 20px 60px rgba(14, 48, 78, 0.12);

  /* Typography */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'Be Vietnam Pro', sans-serif;
}
```

---

## 10. Do's and Don'ts

### Do:
- **Use Asymmetry:** Offset illustrative icons by `--space-xs` to create a hand-placed, playful feel.
- **Over-scale Icons:** Category/bubble icons must be at least 48px to accommodate developing motor skills.
- **Layer with Purpose:** Use the surface tiers (`surface-card` → `surface-cell` → `surface-container-lowest`) to guide the user from background to action.
- **Pill Everything Interactive:** All buttons, inputs, and chips use `--radius-pill` (999px).
- **Use Semantic Color:** Each brand color has a role — don't swap primary blue for tertiary green on an action button.

### Don't:
- **No Sharp Corners:** Never use `border-radius` below `--radius-sm` (8px). Everything must feel soft.
- **No 1px Lines:** Do not use dividers or borders to separate content. Use spacing to create "islands."
- **No Pure Grays or Pure Black:** All neutrals must carry a blue tint (`--color-neutral: #5C799B`). Shadows are tinted, never `rgba(0,0,0,...)`.
- **No Color Fatigue:** The primary blue `#38B6FF` is the dominant color — secondary yellow and tertiary green are accents, not alternates.
