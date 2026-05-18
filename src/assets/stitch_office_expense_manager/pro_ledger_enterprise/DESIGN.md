---
name: Pro-Ledger Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005c52'
  on-tertiary: '#ffffff'
  tertiary-container: '#00776b'
  on-tertiary-container: '#84ffec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  page-title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  section-title:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-medium:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  text-small:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  page-padding: 24px
  sidebar-width: 224px
  topnav-height: 52px
  gutter: 16px
  card-gap: 20px
---

## Brand & Style

The design system is engineered for "অফিস এক্সপেন্স ম্যানেজার" (Office Expense Manager), focusing on administrative efficiency, financial clarity, and institutional trust. The brand personality is **Corporate & Modern**, prioritizing utility and readability to reduce the cognitive load of financial tracking.

The visual language utilizes a structured, high-density layout common in enterprise SaaS, balanced by a sophisticated teal-based color palette that signifies stability and growth. The interface aims to evoke a sense of organized precision and professional accountability through clean lines, ample whitespace, and consistent component behavior.

## Colors
The palette is rooted in a deep "Teal 700" primary color, symbolizing professional finance. 

- **Primary Stack**: Teal 700 (#0F766E) for actions, complemented by Teal 500 for highlights and Teal 900 for high-contrast states.
- **Surface Palette**: The "Slate 50" background provides a cool, neutral canvas that allows pure white "Card BG" elements to pop visually.
- **Sidebar Architecture**: A dark Slate 800 background creates a clear structural anchor on the left side of the viewport, using Slate 400 for inactive navigation links to maintain hierarchy.
- **Functional Colors**: Standard semantic colors (Red, Green, Amber, Blue) are used exclusively for status feedback and financial trends.

## Typography
The design system exclusively uses **Inter** to ensure maximum legibility for financial figures and Bengali/English script integration. 

- **Hierarchy**: Page titles use bold weights to anchor the user. Section titles and labels use semi-bold and medium weights respectively to differentiate from standard data entry text.
- **Scale**: The system uses a tight scale (12px to 24px) to maximize information density without sacrificing clarity. 
- **Readability**: Line heights are standardized at approximately 1.4-1.5x the font size to ensure multi-line expense descriptions remain readable in condensed table rows.

## Layout & Spacing
The design system employs a **Fixed Sidebar/Fluid Content** model designed for desktop-first enterprise workflows.

- **Navigation Scaffolding**: A permanent 224px sidebar on the left and a 52px top navigation bar provide global context.
- **Grid System**: Content within the main viewport follows a flexible grid with a standard 24px outer margin. Cards and modular sections are separated by a 20px gap.
- **Responsive Behavior**: 
  - **Desktop (>1024px)**: Sidebar remains expanded.
  - **Tablet (768px - 1024px)**: Sidebar collapses to icons or hides behind a hamburger menu.
  - **Mobile (<768px)**: Viewport padding reduces to 16px; cards stack vertically.

## Elevation & Depth
This design system uses a **Tonal Layering** approach with subtle shadows to define depth. 

- **Level 0 (Floor)**: The Page BG (Slate 50) serves as the lowest layer.
- **Level 1 (Cards)**: White surfaces use a dual-layer soft shadow (3% and 4% opacity) to appear slightly lifted above the floor.
- **Level 2 (Dropdowns/Modals)**: These elements use a more pronounced shadow to indicate temporary interaction and focus.
- **Interactive Elements**: Buttons and inputs rely on subtle border transitions and color shifts rather than heavy shadows to maintain a clean, flat aesthetic.

## Shapes
A "Rounded" strategy is applied to soften the industrial nature of the software. 

- **Container Radius**: Standard containers and cards utilize a **12px (rounded-lg)** radius to create a modern, approachable feel.
- **Control Radius**: Interactive elements like buttons and input fields use an **8px (rounded-md)** radius, striking a balance between the soft cards and sharp text content.
- **Status Shapes**: Badges and indicators use a **full-pill radius** to clearly distinguish them from interactive buttons or static data fields.

## Components

### Buttons
- **Primary**: Solid Teal 700 background with white text. High emphasis.
- **Secondary**: White background with Slate 200 border and Slate 800 text. Used for neutral actions.
- **Danger**: Red 50 background with Red 600 text for a "soft-alert" look.
- **Success**: Solid Green 600 background for final approvals or settlements.

### Status Badges (Pill-Shaped)
- **পেন্ডিং (Pending)**: Amber 100 background / Amber 700 text.
- **অনুমোদিত (Approved)**: Green 100 background / Green 700 text.
- **বাতিল (Cancelled)**: Red 100 background / Red 700 text.
- **খোলা (Open)**: Blue 100 background / Blue 700 text.
- **চুকানো (Settled)**: Slate 100 background / Slate 700 text.

### Inputs & Selects
- **Default State**: 40px height, Slate 200 border, 8px radius.
- **Focus State**: Teal 500 border with a subtle Teal 50 outer glow.

### Settlement Boxes
- Special informational containers used in the settlement workflow:
  - **Employee Return**: Amber 50 background with Amber 800 text/border (indicates money coming back).
  - **Office Pay**: Green 50 background with Green 800 text/border (indicates outgoing office payment).

### Cards
- White background, 12px radius, Slate 100 border. Used to group related expenses or summary statistics.