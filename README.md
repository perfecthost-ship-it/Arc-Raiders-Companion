# ARC Companion

A blueprint tracking and reference companion for **ARC Raiders**, built two ways: a **web app** you can use in any browser, and an optional **physical desktop device** (Arduino Uno R3 + 12" display) that mirrors the same data on hardware you can keep next to your monitor.

> Fan-made companion project. Not affiliated with or endorsed by Embark Studios.

---

## 🌐 Web App

A React single-page app for tracking blueprints, browsing maps, and referencing core game knowledge.

### Features

- **Blueprints tab** — Browse the blueprint list, mark each one as *Find it* / *In inventory* / *Learned*, and filter/search. Progress is saved locally in your browser.
- **Maps tab** — Per-map details: difficulty, recommended level, extract types, raider hatches, key POIs, and which map conditions cycle on each map.
- **Guide tab** — Core mechanics reference: learn & consume, workstation tiers, duplicate handling, container blueprint rates, and an early-game priority list.
- **Light/dark theme** — Follows your system preference by default, with a manual override that's remembered between visits.
- **Live Steam player count** (best-effort) — Pulled directly from Steam's public API when available.

### Tech stack

- React 18 + Vite
- Tailwind CSS
- [lucide-react](https://lucide.dev/) icons
- Progress/theme persisted via `localStorage` (nothing leaves your browser)

### Running locally

```bash
npm install
npm run dev
```

### Building & deploying

```bash
npm run build
```

Pushes to `main` auto-build and deploy to GitHub Pages via the included [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — no manual steps needed once Pages is set to the "GitHub Actions" source in the repo settings.

---

## 🕹️ ARC Companion — Physical Device (add-on)

A hardware companion built on an **Arduino Uno R3**, designed as a standalone desk unit that surfaces the same blueprint-tracking and raid-timer functionality without needing a second monitor or browser tab open.

| | |
|---|---|
| **Hardware** | Arduino Uno R3, 12" portable HDMI monitor (1920×1080), 8 programmable buttons, 2 rotary knobs, 4 status LEDs, RGB underglow strip |
| **Enclosure** | Custom 3D-printed tactical case ([`arc_tactical_case.scad`](arc_tactical_case.scad)), olive drab / gunmetal color scheme |
| **Firmware** | [`ARC_Companion_Arduino.ino`](ARC_Companion_Arduino.ino) — ~520-line Arduino C++ sketch |
| **Status** | Complete & tested |

### What it does

- **Blueprint browser** — Search and page through a blueprint database (name, rarity, location, components) using the buttons and knobs.
- **Raid timer** — Start/stop a countdown for a raid, with audio and LED feedback on completion.
- **Status LEDs** — Blue (power), green (device active), red (alert), yellow (activity/raid running).
- **Stats tracking** — Raids completed, success rate, and best raid time, persisted to EEPROM so progress survives a power cycle.
- **Serial output** — Live status readable over USB in any serial monitor (9600 baud) for debugging or a secondary text display.

### Build docs

Full pin configuration, data structures, state machine, and build notes are documented in-repo:

- [`ARC_Companion_Arduino.ino`](ARC_Companion_Arduino.ino) — firmware source
- [`arc_tactical_case.scad`](arc_tactical_case.scad) — parametric OpenSCAD case design
- [`arc build.pdf`](arc%20build.pdf) — build guide
- [`ARC_Companion_Code_Architecture.pptx`](ARC_Companion_Code_Architecture.pptx) / `_BLUE.pptx` — architecture walkthrough
- [`ARC_Companion_Portfolio.pptx`](ARC_Companion_Portfolio.pptx) / `_BLUE.pptx` — project showcase
- [`ARC_Companion_App_Showcase_BLUE.pptx`](ARC_Companion_App_Showcase_BLUE.pptx) — app showcase deck

### Flashing the firmware

```bash
# 1. Open the sketch in Arduino IDE
arduino ARC_Companion_Arduino.ino

# 2. Select board & port
Tools → Board → Arduino Uno
Tools → Port → (your COM port)

# 3. Upload
Sketch → Upload (Ctrl+U)

# 4. Monitor (optional)
Tools → Serial Monitor → 9600 baud
```

The device and the web app currently run independently — the physical unit uses its own onboard blueprint database and EEPROM storage rather than syncing live with the browser app.

---

## 📄 License

MIT — see `LICENSE` for details.
