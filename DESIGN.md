# DESIGN SPECIFICATION: Hızlı Okuma Web (Rapid Focus)

## 1. Visual World & Direction: "Modern Cognitive Studio"
- **Aesthetic Core**: High-craft, tactile cognitive laboratory inspired by Linear, Raycast, and Apple Editorial interfaces.
- **Lighting & Atmosphere**:
  - Light Theme: Warm crisp editorial ivory `#f8fafc` with subtle micro-dots and gentle multi-layered shadows.
  - Dark Theme: Deep obsidian slate `#07090e` with ambient violet/indigo radial light glow behind the main reader canvas.
  - Sepia Theme: Warm vintage book paper `#f9f2e5` with terracotta and rich charcoal `#2e2117`.
  - OLED: Pure black `#000000` with high-contrast crisp white `#ffffff`.

---

## 2. Color Palette & Functional Roles
- **Primary Accent**: Electric Indigo (`#6366f1` / `#4f46e5`) - Focus, CTA actions, progress gradients.
- **Focal Point (ORP)**: Radiant Ruby Rose (`#f43f5e`) - Millimeter-precise visual anchor for RSVP reader.
- **Success / Celebration**: Emerald (`#10b981`) - Completed milestones, Schulte table records, confetti.
- **Attention / Active Play**: Warm Amber (`#f59e0b`) - Active reading state, auto-acceleration boost.
- **Neutral Scales**: Slate range `#0f172a` (foreground dark) to `#f8fafc` (foreground light).

---

## 3. Typography Hierarchy
- **Focal Reader & Display**: `Lexend` (Google Fonts, variable weights 300–900). Specifically engineered by educational researchers to expand reading speed and reduce eye strain.
- **UI & Controls**: `Inter` / System Sans (`ui-sans-serif`).
- **Data & Numbers / Timers**: `JetBrains Mono` (`tabular-nums`) for jitter-free WPM counters and Schulte stopwatches.
- **Classic Literature**: `Merriweather` (optional serif mode).

---

## 4. Component Craft & Micro-Interactions
- **Reader Stage (Focal Chamber)**:
  - Top & bottom hairline guides with glowing center alignment dots.
  - Symmetrical 50%-50% flex alignment ensuring the ORP letter stays perfectly stationary at all speeds up to 1200 WPM.
  - Context sentence breadcrumbs with active word illumination.
- **Control Dock**:
  - Tactile stepper buttons with hover elevation.
  - Spacebar-driven play/pause toggle with prominent visual state.
- **Mobile Experience**:
  - Fixed glassmorphism bottom navigation bar with thumb-accessible touch targets (min 44x44px).
  - Tap-anywhere to pause/resume.
