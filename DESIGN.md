---
name: Scando Social Media Board
description: Content pipeline management board for Scando's social media and blog channels.
colors:
  brand-blue: "#1c58dd"
  brand-blue-hover: "#164fb8"
  live-green: "#00f260"
  deep-blue: "#1677c4"
  mint-green: "#00d455"
  surface-bg: "#f1f5f9"
  surface-white: "#ffffff"
  surface-blue-tint: "#f0f4ff"
  surface-drag-over: "#eff6ff"
  text-primary: "#1f2937"
  text-muted: "#6b7280"
  border-subtle: "#c7d7f9"
  status-idea-bg: "#f3f4f6"
  status-idea-text: "#6b7280"
  status-idea-border: "#d1d5db"
  status-researching-bg: "#fef3c7"
  status-researching-text: "#d97706"
  status-researching-border: "#fcd34d"
  status-writing-bg: "#dbeafe"
  status-writing-text: "#2563eb"
  status-writing-border: "#93c5fd"
  status-scheduled-bg: "#ede9fe"
  status-scheduled-text: "#7c3aed"
  status-scheduled-border: "#c4b5fd"
  status-published-bg: "#d1fae5"
  status-published-text: "#059669"
  status-published-border: "#6ee7b7"
  platform-facebook: "#1877f2"
  platform-linkedin: "#0a66c2"
  platform-blog: "#00f260"
  platform-all: "#1c58dd"
typography:
  display:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  filter-btn:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  filter-btn-active:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  idea-card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "16px"
  topic-badge:
    backgroundColor: "{colors.surface-blue-tint}"
    textColor: "{colors.brand-blue}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  nav-tab-active:
    textColor: "{colors.brand-blue}"
  nav-tab-inactive:
    textColor: "{colors.text-muted}"
  brand-bar:
    backgroundColor: "{colors.live-green}"
    height: "3px"
    width: "50px"
    rounded: "{rounded.sm}"
---

# Design System: Scando Social Media Board

## 1. Overview

**Creative North Star: "The Pipeline Map"**

This system treats the content pipeline as the primary UI artifact. Every element exists to make the status, platform, and progress of ideas immediately legible — not to showcase itself. The board is used in focused, daily work sessions by someone who already knows the brand deeply; the design earns trust by getting out of the way while still feeling unmistakably Scando.

The palette is controlled and purposeful: Brand Blue carries all interactive and navigational weight, Live Green marks what is alive and published, and a cool slate background creates breathing room without retreating to clinical white. Typography is Montserrat throughout — its geometric confidence communicates authority at large sizes and stays readable at small label sizes. Depth is earned, not assumed: surfaces are flat at rest and lift only when the user interacts.

This system explicitly rejects the template-stamped neutrality of generic SaaS dashboards (Notion, Airtable, Monday.com), the style-over-function excess of agency portfolio aesthetics, and the zero-identity utility of Bootstrap defaults. Every screen should feel built by Scando, for Scando.

**Key Characteristics:**
- Flat-first, hover-lift elevation
- Single typeface (Montserrat) across all hierarchy levels
- Brand Blue as the primary interactive signal; Live Green reserved for published/live states and the brand accent bar
- Status is always color + text label, never color alone
- Pipeline flow (Idea → Researching → Writing → Scheduled → Published) is a first-class design concept

## 2. Colors: The Signal Palette

Two brand colors carry all the weight. Everything else is either a status signal or a neutral surface.

### Primary
- **Brand Blue** (`#1c58dd`): The load-bearing action color. Used on active filter buttons, nav tab indicators, platform badges for "All," interactive borders (drop zone), topic badge text, filter hover states, and the active tab underline. Also the Blog platform badge background.
- **Brand Blue Hover** (`#164fb8`): The pressed/hover state for all Brand Blue interactive elements.

### Secondary
- **Live Green** (`#00f260`): Reserved for the brand accent bar decorative element and the Blog platform badge. Also the "Published" status signal background alternative in success contexts. Its scarcity is the point — it marks what is alive.
- **Deep Blue** (`#1677c4`): Secondary brand blue for supporting contexts (not currently used in the board; available for future expanded states or charts).
- **Mint Green** (`#00d455`): Secondary green variant; available for success-adjacent contexts.

### Neutral
- **Surface Background** (`#f1f5f9`): The page background. Cool, slightly blue-tinted slate — not pure white, not gray.
- **Surface White** (`#ffffff`): Card backgrounds, filter button resting state, all content containers.
- **Surface Blue Tint** (`#f0f4ff`): Topic badge backgrounds. A near-white with a deliberate brand-blue lean.
- **Surface Drag-Over** (`#eff6ff`): The drop zone active/drag state background — a blue wash.
- **Text Primary** (`#1f2937`): All body text and content text. Dark charcoal, not pure black.
- **Text Muted** (`#6b7280`): Secondary labels, inactive nav tabs, metadata, helper text.
- **Border Subtle** (`#c7d7f9`): Topic badge borders. Blue-tinted fine border.

### Status Colors
Status pairs are always bg + text + border. Never use status colors in isolation.

| Status | Background | Text | Border |
|---|---|---|---|
| Idea | `#f3f4f6` | `#6b7280` | `#d1d5db` |
| Researching | `#fef3c7` | `#d97706` | `#fcd34d` |
| Writing | `#dbeafe` | `#2563eb` | `#93c5fd` |
| Scheduled | `#ede9fe` | `#7c3aed` | `#c4b5fd` |
| Published | `#d1fae5` | `#059669` | `#6ee7b7` |

### Platform Colors
| Platform | Color |
|---|---|
| Facebook | `#1877f2` |
| Instagram | gradient `#f09433` → `#e6683c` → `#dc2743` → `#cc2366` → `#bc1888` |
| LinkedIn | `#0a66c2` |
| Blog | `#00f260` bg, `#1f2937` text |
| All | `#1c58dd` bg, `#ffffff` text |

### Named Rules
**The Live Green Rule.** Live Green (`#00f260`) appears in exactly two places: the brand accent bar (the 50px decorative underline below section headings) and the Blog platform badge. Do not use it as a general success color or CTA color. Its rarity makes the brand bar distinctive.

**The Status Pair Rule.** Every status indicator uses its full triple: background + text color + border. Never render a status badge with color alone. The text label ("Idea", "Published", etc.) is always present.

## 3. Typography

**Primary Font:** Montserrat (sans-serif)
**Complementary Font:** Open Sans (for future long-form or UI label contexts)
**Arabic Font:** IBM Plex Sans Arabic (primary); Noto Naskh Arabic (formal/long-form)

**Character:** Montserrat's geometric precision reads as confident and professional without being cold. Used at bold/700 for headings, semibold/600 for navigation and subheadings, and regular/400 for body — the weight contrast between levels is the hierarchy, not font-size alone.

### Hierarchy
- **Display** (700, 2rem, 1.25): Page title, board name. Used once per view.
- **Headline** (700, 1.5rem, 1.3): Section headings, view titles (Ideas / Objectives / Accounts).
- **Title** (600, 1.125rem, 1.4): Card headings, stat labels in the stats strip, account names.
- **Body** (400, 0.875rem, 1.5): Card descriptions, filter labels, all readable content. Keep description text to 3 lines maximum via line-clamp.
- **Label** (500, 0.75rem, 1.4, 0.01em tracking): Status badges, platform badges, topic badges, metadata (date, objective). All caps optional for tightest contexts.

### Named Rules
**The Single Family Rule.** Montserrat is used at every level. Hierarchy is expressed through weight (700/600/400) and size contrast, not through font switching. Open Sans is available for complementary long-form contexts if the board ever adds rich text areas.

## 4. Elevation

The board is flat by default. Surfaces carry no ambient shadow at rest. Depth emerges only from user interaction — when a card is hovered, it lifts.

This is not a limitation; it is a deliberate choice. The pipeline is a map of status, and status signals (color badges, tab indicators) carry the visual weight. Competing shadow layers would dilute that signal hierarchy.

### Shadow Vocabulary
- **Resting state:** No shadow. Borders and background-color differences (white card on slate background) provide separation.
- **Card hover lift:** `transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.10)`. Applies to `.idea-card`. 200ms ease transition.
- **Drop zone active:** Background tints to `#eff6ff` (Surface Drag-Over). No shadow — state is communicated by fill, not elevation.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a direct response to hover interaction on interactive cards. Do not add ambient shadows to stat cards, filter panels, or navigation.

## 5. Components

### Filter Buttons
Clean pill buttons. At rest: white background, muted text, visible border. Active: Brand Blue fill, white text. Transition is 200ms all-properties.
- **Shape:** `border-radius: 9999px` (pill)
- **Resting:** `#ffffff` bg, `#6b7280` text, `1px solid` border
- **Active:** `#1c58dd` bg, `#ffffff` text, `border-color: #1c58dd`
- **Padding:** `6px 14px`

### Idea Cards
The primary content unit. White surface on slate background creates separation without shadow. Hover lifts the card.
- **Shape:** `border-radius: 12px`
- **Background:** `#ffffff`
- **Hover:** `translateY(-2px)`, `box-shadow: 0 8px 20px rgba(0,0,0,0.10)`, 200ms ease
- **Internal padding:** `16px`
- **Structure:** Platform badge (top-left) + Status badge (top-right) → Title (Title weight) → Description (Body, 3-line clamp) → Topic badges row → Objective label → Date metadata

### Platform Badges
Colored pills identifying the target platform. Each uses its own platform color (see Color section). Instagram uses a CSS gradient.
- **Shape:** `border-radius: 9999px`
- **Typography:** Label weight (500, 0.75rem), white text (except Blog: dark text)
- **Padding:** `2px 10px`

### Status Badges
Semantic pipeline status. Always background + text + border triple.
- **Shape:** `border-radius: 9999px`
- **Typography:** Label weight (500, 0.75rem)
- **Padding:** `2px 10px`
- See Color section status table for full per-status values.

### Topic Badges
Blue-tinted pills linking ideas to content themes.
- **Shape:** `border-radius: 9999px`
- **Background:** `#f0f4ff`
- **Text:** `#1c58dd`
- **Border:** `1px solid #c7d7f9`
- **Padding:** `2px 8px`

### Navigation Tabs (Ideas / Objectives / Accounts)
Bottom-border tab strip. Active tab: Brand Blue text + 3px Brand Blue bottom border. Inactive: muted text. Hover: Brand Blue text. No background fills.
- **Active indicator:** `border-bottom: 3px solid #1c58dd`
- **Transition:** 200ms all-properties

### Brand Bar
The 50px green accent underline. Used beneath the board title/header area. Communicates Scando identity without the logo.
- **Color:** `#00f260` (Live Green only — not Brand Blue)
- **Dimensions:** `50px × 3px`
- **Border-radius:** `2px`

### Drop Zone (file:// fallback)
Dashed border container for CSV drag-and-drop when running from the file system.
- **Border:** `2px dashed #1c58dd`
- **Hover/active:** background transitions to `#eff6ff`
- **Transition:** `background-color 0.2s`

### Stats Strip
Four stat cards above the filter bar. White surface, no hover lift (they are informational, not interactive).
- **Shape:** `border-radius: 8px` (slightly tighter than idea cards)
- **Background:** `#ffffff`
- **No shadow at rest or on hover**

## 6. Do's and Don'ts

**Do** use Brand Blue (`#1c58dd`) as the only interactive action color. Every clickable filter, active tab, and interactive border should be this blue.

**Do** always pair status colors with their text label. A green badge that says "Published" is clear; a green badge alone is ambiguous.

**Do** use the Brand Bar (`#00f260`, 50px) as the sole decorative use of Live Green in structural headers.

**Do** keep card descriptions to 3 lines maximum using `line-clamp`. The pipeline overview is a scanning interface, not a reading interface.

**Do** maintain WCAG AAA (7:1) contrast for all text. At `#1f2937` on `#ffffff`, the ratio is approximately 16:1. At `#1c58dd` on `#ffffff`, it is approximately 5.5:1 — use brand blue on white for large text (18px+) only, not for small body copy.

**Don't** use Live Green (`#00f260`) on interactive elements, buttons, or calls to action. It is the brand accent and the "Published" visual signal — nothing else.

**Don't** add shadows to resting cards, stats, or navigation. Elevation is hover-only.

**Don't** use more than two badge types on a single card (platform + status). Topic badges are a third tier and should appear at the bottom of the card, visually separated.

**Don't** mix font families within a view. Montserrat only. If Arabic content is added, use IBM Plex Sans Arabic in a dedicated RTL section — never mixed inline with LTR content.

**Don't** use color alone to communicate status or platform. Platform and status must always have a visible text label alongside the color.
