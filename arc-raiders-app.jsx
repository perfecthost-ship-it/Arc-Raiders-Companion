import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from "react";
import { Search, Check, Package, BookOpen, Zap, Shield, Wrench, FlaskConical, Bomb, AlertTriangle, Loader2, RotateCcw, Clock, Users, RefreshCw, Monitor, Gamepad2, Info, Map as MapIcon, Skull, Star, MapPin, DoorOpen, CalendarClock, ChevronDown, ChevronUp, Cog, Target, Moon, CloudLightning, X, Sun } from "lucide-react";

// ---------------------------------------------------------------------------
// Theme: light + dark palettes, runtime switchable.
//
// Both palettes share the same key shape so any component can read T.bg,
// T.text, T.blue, etc. without caring about the active mode. Dark mode is
// hand-tuned (not a blind invert) — backgrounds slightly warm-cool navy,
// signal colors brighter to pop, learned/inv tints muted so they don't
// blow out the eye on dark.
// ---------------------------------------------------------------------------
const LIGHT = {
  bg:          "#f1f5f9",
  bgTint:      "#e2e8f0",
  card:        "#ffffff",
  cardSoft:    "#f8fafc",
  border:      "#cbd5e1",
  borderSoft:  "#e2e8f0",
  text:        "#0f172a",
  textSoft:    "#334155",
  textMuted:   "#64748b",
  textFaint:   "#94a3b8",

  blue:        "#2563eb",
  blueDeep:    "#1d4ed8",
  blueDark:    "#1e3a8a",
  blueTint:    "#dbeafe",
  blueBorder:  "#93c5fd",

  red:         "#dc2626",
  redDeep:     "#b91c1c",
  redDark:     "#7f1d1d",
  redTint:     "#fee2e2",
  redBorder:   "#fca5a5",

  learnedBg:   "#dbeafe",
  learnedBd:   "#93c5fd",
  learnedFg:   "#1d4ed8",
  invBg:       "#fee2e2",
  invBd:       "#fca5a5",
  invFg:       "#b91c1c",
  warning:     "#b91c1c",

  // Page background gradient endpoints — for the new dark mode glow
  bgGlowA:     "transparent",
  bgGlowB:     "transparent",

  cardShadow:  "0 1px 2px rgba(15,23,42,0.04)",
  modalScrim:  "rgba(15,23,42,0.55)",
  hoverTint:   "rgba(0,0,0,0.05)",

  // Rarity tones (light)
  rarity: {
    common:    { text: "#475569", dot: "#64748b", label: "Common" },
    uncommon:  { text: "#0e7490", dot: "#06b6d4", label: "Uncommon" },
    rare:      { text: "#1d4ed8", dot: "#3b82f6", label: "Rare" },
    epic:      { text: "#6d28d9", dot: "#8b5cf6", label: "Epic" },
    legendary: { text: "#b91c1c", dot: "#ef4444", label: "Legendary" },
  },

  // Condition badge tones (light)
  condition: {
    "Night Raid":     { color: "#6d28d9", bg: "#ede9fe", border: "#c4b5fd" },
    "EM Storm":       { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
    "Closed Gate":    { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
    "Hidden Bunker":  { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
    "Harvester":      { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
    "Stella-bound":   { color: "#7f1d1d", bg: "#fee2e2", border: "#fca5a5" },
    "Quest":          { color: "#0e7490", bg: "#cffafe", border: "#67e8f9" },
  },
};

const DARK = {
  bg:          "#0b1220", // deep navy, warmer than pure black
  bgTint:      "#0f1729",
  card:        "#131c2f", // cards lift slightly off the bg
  cardSoft:    "#0f1729",
  border:      "#2a3548", // subtle, lets cards breathe
  borderSoft:  "#1c2538",
  text:        "#e6eaf2",
  textSoft:    "#aebcd1",
  textMuted:   "#7b8aa3",
  textFaint:   "#566375",

  // Brighter signal colors — needed to pop on dark surfaces
  blue:        "#60a5fa",
  blueDeep:    "#93c5fd",
  blueDark:    "#bfdbfe",
  blueTint:    "#1e3a8a40", // semi-transparent for tinted backgrounds
  blueBorder:  "#3b82f680",

  red:         "#f87171",
  redDeep:     "#fca5a5",
  redDark:     "#fecaca",
  redTint:     "#7f1d1d40",
  redBorder:   "#dc262680",

  learnedBg:   "#1e3a8a40",
  learnedBd:   "#3b82f680",
  learnedFg:   "#93c5fd",
  invBg:       "#7f1d1d40",
  invBd:       "#dc262680",
  invFg:       "#fca5a5",
  warning:     "#fca5a5",

  // Faint atmospheric glow at the page top in dark mode
  bgGlowA:     "rgba(96,165,250,0.06)",
  bgGlowB:     "rgba(248,113,113,0.04)",

  cardShadow:  "0 1px 2px rgba(0,0,0,0.4)",
  modalScrim:  "rgba(0,0,0,0.7)",
  hoverTint:   "rgba(255,255,255,0.04)",

  rarity: {
    common:    { text: "#94a3b8", dot: "#64748b", label: "Common" },
    uncommon:  { text: "#67e8f9", dot: "#06b6d4", label: "Uncommon" },
    rare:      { text: "#93c5fd", dot: "#3b82f6", label: "Rare" },
    epic:      { text: "#c4b5fd", dot: "#8b5cf6", label: "Epic" },
    legendary: { text: "#fca5a5", dot: "#ef4444", label: "Legendary" },
  },

  condition: {
    "Night Raid":     { color: "#c4b5fd", bg: "#4c1d9540", border: "#8b5cf680" },
    "EM Storm":       { color: "#93c5fd", bg: "#1e3a8a40", border: "#3b82f680" },
    "Closed Gate":    { color: "#93c5fd", bg: "#1e3a8a40", border: "#3b82f680" },
    "Hidden Bunker":  { color: "#fca5a5", bg: "#7f1d1d40", border: "#dc262680" },
    "Harvester":      { color: "#fca5a5", bg: "#7f1d1d40", border: "#dc262680" },
    "Stella-bound":   { color: "#fca5a5", bg: "#7f1d1d40", border: "#dc262680" },
    "Quest":          { color: "#67e8f9", bg: "#155e7540", border: "#06b6d480" },
  },
};

// Map condition name → icon. Icons are stable across themes.
const CONDITION_ICON = {
  "Night Raid":    Moon,
  "EM Storm":      CloudLightning,
  "Closed Gate":   Target,
  "Hidden Bunker": Bomb,
  "Harvester":     Zap,
  "Stella-bound":  Skull,
  "Quest":         Star,
};

const ThemeContext = createContext({ T: LIGHT, isDark: false, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

const THEME_KEY = "ar_theme_v1";

const PLATFORM_MULT = { ps5: 0.48, xbox: 0.40 };

const MAPS = [
  {
    id: "dam", name: "Dam Battlegrounds", subtitle: "Alcantara Power Plant",
    difficulty: 2, recommended: "All levels",
    flavor: "Balanced loot, moderate ARC. The beginner-friendly starter map.",
    extracts: ["Cargo Elevator", "Metro", "Airshaft", "Raider Hatch"],
    hatches: ["Sunroof", "Good Old Barons", "Pump House", "Spillway"],
    conditions: ["Cold Snap", "Hurricane", "Night", "EM Storm"],
    bpFocus: "Wolfpack & Snap Hook (residential), Anvil (highway cache), Showstopper (industrial).",
    pois: "Ruby Residence, Pale Apartments, Primary Facility, Control Tower, Spillway",
    status: "live",
  },
  {
    id: "spaceport", name: "Acerra Spaceport", subtitle: "Launch complex ruins",
    difficulty: 3, recommended: "Mid-game",
    flavor: "Hidden Bunker event drops the Vulcano blueprint. High-value gear.",
    extracts: ["Cargo Elevator", "Metro", "Airshaft", "Raider Hatch"],
    hatches: ["Western", "Central", "South", "East"],
    conditions: ["Launch Tower Loot", "Hidden Bunker", "Night", "EM Storm"],
    bpFocus: "Vulcano (Hidden Bunker), Snap Hook (Control Tower, Departure Building).",
    pois: "Departure Building, Launch Tower, Bunker, Runway, Vehicle Maintenance",
    status: "live",
  },
  {
    id: "buried", name: "Buried City", subtitle: "Sand-buried ruins",
    difficulty: 3, recommended: "Mid-game",
    flavor: "Tight urban corridors. Multi-level buildings reward map knowledge.",
    extracts: ["Cargo Elevator", "Metro", "Airshaft", "Raider Hatch"],
    hatches: ["Market Ruins", "Highway Overpass", "Train Station", "Old Town"],
    conditions: ["Sandstorm", "Hurricane", "Night", "EM Storm"],
    bpFocus: "Wolfpack (Grandioso Apartments, Night), Anvil (Marano Station breach room).",
    pois: "Grandioso Apartments, Market, Plaza Rosa Pharmacy, Marano Station, Old Town",
    status: "live",
  },
  {
    id: "bluegate", name: "Blue Gate", subtitle: "Mountain facility",
    difficulty: 4, recommended: "Mid to late",
    flavor: "Locked areas require keys. Closed Gate condition drops Bobcat.",
    extracts: ["Cargo Elevator", "Metro", "Airshaft", "Raider Hatch"],
    hatches: ["Fortune", "Reinforced", "Fragrant", "Abandoned Housing"],
    conditions: ["Closed Gate", "Cold Snap", "Night", "EM Storm"],
    bpFocus: "Bobcat (Closed Gate), Tempest (Night), Blaze Grenade (Maintenance Wing).",
    pois: "The Gate, Tunnels, Mountain Village, Reinforced Reception, Research Wing",
    status: "live",
  },
  {
    id: "stella", name: "Stella Montis", subtitle: "Endgame assembly zone",
    difficulty: 5, recommended: "Level 25+",
    flavor: "Smallest, deadliest. Highest loot density. Aphelion spawns here.",
    extracts: ["Cargo Elevator", "Airshaft", "Raider Hatch"],
    hatches: ["Assembly Workshop", "Eastern Tunnel", "Robotics Sandbox"],
    conditions: ["Night Raid", "ARC Operations", "Hurricane"],
    bpFocus: "Aphelion (map-bound), Tier-3 augments (Security Containers), Blaze Grenade (Loading Bay).",
    pois: "Assembly Workshop, Tunnels, Robotics Sandbox, Security Checkpoint",
    status: "live",
  },
  {
    id: "riven", name: "Riven Tides", subtitle: "Coastal flood zone — coming soon",
    difficulty: null, recommended: "TBA",
    flavor: "Confirmed for 2026 content update. Full details at launch.",
    extracts: [], hatches: [], conditions: [],
    bpFocus: "Expected to introduce new weapon blueprints.",
    pois: "TBA",
    status: "upcoming",
  },
];
const BLUEPRINTS = [
  // GUNSMITH — Weapons
  { id: "bp_burletta", name: "Burletta", station: "Gunsmith", type: "weapon", rarity: "common", tier: 1,
    materials: [{name: "Simple Gun Parts", qty: 4}, {name: "Mechanical Components", qty: 2}], condition: "Quest",
    source: "Rewarded from an early-game questline. Solid starter weapon." },
  { id: "bp_anvil", name: "Anvil", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Mechanical Components", qty: 5}, {name: "Simple Gun Parts", qty: 6}], condition: null,
    source: "Raider Containers. Reliable spot: hidden cache under Dam's East Broken Bridge. Alt: Marano Station breach room (Buried City). Uncovered Caches event boosts odds." },
  { id: "bp_osprey", name: "Osprey", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Medium Gun Parts", qty: 4}, {name: "Mechanical Components", qty: 3}], condition: null,
    source: "Raider Containers and weapon crates on any map. Higher roll rates in high-risk zones." },
  { id: "bp_hullcracker", name: "Hullcracker", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Heavy Gun Parts", qty: 3}, {name: "Mechanical Components", qty: 4}], condition: null,
    source: "Raider Containers in high-risk zones. Strong anti-ARC utility." },
  { id: "bp_torrente", name: "Torrente", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Medium Gun Parts", qty: 4}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Raider Containers. Shares loot pool with other mid-tier SMGs." },
  { id: "bp_iltoro", name: "Il Toro", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Heavy Gun Parts", qty: 3}, {name: "Mechanical Components", qty: 4}], condition: null,
    source: "Raider Containers. Heavy-hitting sidearm." },
  { id: "bp_canto", name: "Canto", station: "Gunsmith", type: "weapon", rarity: "uncommon", tier: 1,
    materials: [{name: "Simple Gun Parts", qty: 5}, {name: "Mechanical Components", qty: 3}], condition: null,
    source: "Common weapon blueprint — Raider Containers across all maps." },
  { id: "bp_bettina", name: "Bettina", station: "Gunsmith", type: "weapon", rarity: "uncommon", tier: 1,
    materials: [{name: "Simple Gun Parts", qty: 4}, {name: "Mechanical Components", qty: 3}], condition: null,
    source: "Raider Containers. Reliable early-game option." },
  { id: "bp_venator", name: "Venator", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Medium Gun Parts", qty: 5}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Raider Containers. Precision rifle." },
  { id: "bp_dolabra", name: "Dolabra", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Heavy Gun Parts", qty: 4}, {name: "Mechanical Components", qty: 3}], condition: null,
    source: "Raider Containers. Latest shotgun added to the game — close-range monster." },
  { id: "bp_bobcat", name: "Bobcat", station: "Gunsmith", type: "weapon", rarity: "rare", tier: 2,
    materials: [{name: "Medium Gun Parts", qty: 4}, {name: "Complex Gun Parts", qty: 2}], condition: "Closed Gate",
    source: "Blue Gate during the Closed Gate condition only. Load in specifically for this roll." },
  { id: "bp_tempest", name: "Tempest", station: "Gunsmith", type: "weapon", rarity: "epic", tier: 3,
    materials: [{name: "Complex Gun Parts", qty: 3}, {name: "Heavy Gun Parts", qty: 4}], condition: "Night Raid",
    source: "Night map condition only. Best attempted on Dam or Blue Gate Night runs." },
  { id: "bp_vulcano", name: "Vulcano", station: "Gunsmith", type: "weapon", rarity: "epic", tier: 3,
    materials: [{name: "Complex Gun Parts", qty: 4}, {name: "Heavy Gun Parts", qty: 3}], condition: "Hidden Bunker",
    source: "Spaceport Hidden Bunker event drop. Only obtainable when the bunker is active." },
  { id: "bp_equalizer", name: "Equalizer", station: "Gunsmith", type: "weapon", rarity: "epic", tier: 3,
    materials: [{name: "Complex Gun Parts", qty: 5}, {name: "Heavy Gun Parts", qty: 4}], condition: "Harvester",
    source: "Harvester event reward. Queue a Harvester map when one is active." },
  { id: "bp_jupiter", name: "Jupiter", station: "Gunsmith", type: "weapon", rarity: "epic", tier: 3,
    materials: [{name: "Complex Gun Parts", qty: 5}, {name: "Heavy Gun Parts", qty: 4}], condition: "Harvester",
    source: "Harvester event reward. Pairs with Equalizer as the event's twin drops." },
  { id: "bp_aphelion", name: "Aphelion", station: "Gunsmith", type: "weapon", rarity: "legendary", tier: 3,
    materials: [{name: "Complex Gun Parts", qty: 6}, {name: "Heavy Gun Parts", qty: 5}], condition: "Stella-bound",
    source: "Stella Montis only — map-bound, not container-bound. Can drop from multiple container types on that map." },
  // GUNSMITH — Attachments
  { id: "bp_silencer_1", name: "Silencer I", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 1,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 1}], condition: null,
    source: "Residential loot pool — suitcases and desks. Standard day raids have better Silencer I rates than storm conditions." },
  { id: "bp_shotgun_silencer", name: "Shotgun Silencer", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Simple Gun Parts", qty: 2}], condition: null,
    source: "Raider Containers. Stealth-build essential." },
  { id: "bp_compensator", name: "Compensator", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 2}], condition: null,
    source: "Common loot — useful recoil control for most primaries." },
  { id: "bp_comp_3", name: "Compensator III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 4}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Late-game caches. Raider stashes during 2x map conditions roll higher." },
  { id: "bp_angled_2", name: "Angled Grip II", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 2}], condition: null,
    source: "Locked rooms and residential containers." },
  { id: "bp_angled_3", name: "Angled Grip III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Raider stashes and late-game caches." },
  { id: "bp_vert_grip_3", name: "Vertical Grip III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Late-game caches. Strong recoil control." },
  { id: "bp_ext_light_2", name: "Extended Light Mag II", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 3}], condition: null,
    source: "Raider Containers. Common attachment drop." },
  { id: "bp_ext_light_3", name: "Extended Light Mag III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Raider stashes, late-game caches." },
  { id: "bp_ext_medium_3", name: "Extended Medium Mag III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Raider Containers. High-tier mag capacity." },
  { id: "bp_ext_shotgun_2", name: "Extended Shotgun Mag II", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 3}], condition: null,
    source: "Raider Containers." },
  { id: "bp_shotgun_choke_2", name: "Shotgun Choke II", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Simple Gun Parts", qty: 2}], condition: null,
    source: "Raider Containers. Tightens shotgun spread." },
  { id: "bp_shotgun_choke_3", name: "Shotgun Choke III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 4}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Late-game caches. Rare attachment." },
  { id: "bp_ext_barrel", name: "Extended Barrel", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Requires Tier III Gunsmith. Range-boost for most primaries." },
  { id: "bp_light_stock", name: "Lightweight Stock", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 1,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 2}], condition: null,
    source: "Looted widely — handling & ADS speed. Top-3 early pickup." },
  { id: "bp_stable_3", name: "Stable Stock III", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Late-game caches. Recoil stability for precision builds." },
  { id: "bp_padded_stock", name: "Padded Stock", station: "Gunsmith", type: "attachment", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 2}], condition: null,
    source: "Standard attachment loot." },
  { id: "bp_surge_coil", name: "Surge Coil", station: "Gunsmith", type: "attachment", rarity: "rare", tier: 3,
    materials: [{name: "Electrical Components", qty: 3}, {name: "Complex Gun Parts", qty: 1}], condition: null,
    source: "Raider Containers. Energy-weapon attachment." },
  // EXPLOSIVES
  { id: "bp_smoke", name: "Smoke Grenade", station: "Explosives", type: "explosive", rarity: "common", tier: 1,
    materials: [{name: "Chemicals", qty: 1}, {name: "Simple Gun Parts", qty: 1}], condition: null,
    source: "Widely available. Escape & cover tool — craft early, craft often." },
  { id: "bp_lure_grenade", name: "Lure Grenade", station: "Explosives", type: "explosive", rarity: "uncommon", tier: 2,
    materials: [{name: "Speaker Component", qty: 1}, {name: "Electrical Component", qty: 1}], condition: "Quest",
    source: "Quest reward: 'Greasing Her Palms' (Celeste). Distracts ARC machines — essential for stealth builds." },
  { id: "bp_showstopper", name: "Showstopper", station: "Explosives", type: "explosive", rarity: "rare", tier: 2,
    materials: [{name: "Electrical Component", qty: 1}, {name: "Battery", qty: 1}], condition: null,
    source: "Industrial Containers. Best spots: Dam Admin Staff Room (keyed), Primary Facility rusty boxes, Power Rod room lockers. Stun mine — 2s Raider stun, 10s ARC stun." },
  { id: "bp_jolt_mine", name: "Jolt Mine", station: "Explosives", type: "explosive", rarity: "rare", tier: 2,
    materials: [{name: "Electrical Component", qty: 1}, {name: "Battery", qty: 1}], condition: null,
    source: "Industrial Containers. Best stun mine in the game — 4s Raider stun, 10s ARC stun. Pair with defensive playstyles." },
  { id: "bp_explosive_mine", name: "Explosive Mine", station: "Explosives", type: "explosive", rarity: "uncommon", tier: 1,
    materials: [{name: "Explosive Compound", qty: 1}, {name: "Sensors", qty: 1}], condition: null,
    source: "Raider Containers. Proximity trigger — place behind doors, at zipline tops, near loot rooms." },
  { id: "bp_gas_mine", name: "Gas Mine", station: "Explosives", type: "explosive", rarity: "uncommon", tier: 2,
    materials: [{name: "Chemicals", qty: 2}, {name: "Sensors", qty: 1}], condition: null,
    source: "Raider Containers. Stamina-drain harassment tool." },
  { id: "bp_frag_grenade", name: "Frag Grenade", station: "Explosives", type: "explosive", rarity: "uncommon", tier: 2,
    materials: [{name: "Explosive Compound", qty: 1}, {name: "Simple Gun Parts", qty: 1}], condition: null,
    source: "Looted widely. Reliable damage in a good radius." },
  { id: "bp_blaze_grenade", name: "Blaze Grenade", station: "Explosives", type: "explosive", rarity: "rare", tier: 2,
    materials: [{name: "Chemicals", qty: 2}, {name: "Explosive Compound", qty: 1}], condition: null,
    source: "Industrial Containers. Best spots: Blue Gate Maintenance Wing, Stella Montis Loading Bay, Dam Primary Facility. 2x Major Map Conditions boost spawn rate." },
  { id: "bp_trigger_nade", name: "Trigger 'Nade", station: "Explosives", type: "explosive", rarity: "rare", tier: 3,
    materials: [{name: "Explosive Compound", qty: 2}, {name: "Electrical Component", qty: 1}], condition: null,
    source: "Raider Containers. King of PvP grenades — sticky, remote-detonated." },
  { id: "bp_seeker", name: "Seeker Grenade", station: "Explosives", type: "explosive", rarity: "rare", tier: 3,
    materials: [{name: "Explosive Compound", qty: 1}, {name: "Sensors", qty: 2}], condition: null,
    source: "Raider Containers. Homing projectile — strong vs. flying ARC." },
  { id: "bp_wolfpack", name: "Wolfpack", station: "Explosives", type: "explosive", rarity: "legendary", tier: 3,
    materials: [{name: "Explosive Compound", qty: 2}, {name: "Sensors", qty: 2}], condition: "Night Raid",
    source: "Night Raid only. Farm residential containers on Dam (Ruby Residence, Pale Apartments) or Buried City (Grandioso Apartments). 12 homing missiles, 100m range — premier anti-ARC tool." },
  // UTILITY
  { id: "bp_repair_kit", name: "Repair Kit", station: "Utility", type: "utility", rarity: "uncommon", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Simple Gun Parts", qty: 1}], condition: null,
    source: "Common loot. Keeps weapons in service across runs." },
  { id: "bp_lockpick", name: "Advanced Lockpick", station: "Utility", type: "utility", rarity: "rare", tier: 2,
    materials: [{name: "Mechanical Components", qty: 3}, {name: "Simple Gun Parts", qty: 1}], condition: null,
    source: "Locked room rewards. Opens lower-tier locked containers without keys." },
  { id: "bp_snap_hook", name: "Snap Hook", station: "Utility", type: "utility", rarity: "legendary", tier: 3,
    materials: [{name: "Mechanical Components", qty: 4}, {name: "Electrical Component", qty: 2}, {name: "Power Rod", qty: 1}], condition: "EM Storm",
    source: "Electromagnetic Storm condition only. Best spots: Dam Ruby/Pale Apartments (residential farming), Primary Facility & Generator Hall (metal containers). Also quest reward from 'Lost In Transmission'. Grapple for vertical traversal." },
  { id: "bp_remote_flare", name: "Remote Raider Flare", station: "Utility", type: "utility", rarity: "rare", tier: 2,
    materials: [{name: "Electrical Component", qty: 2}, {name: "Chemicals", qty: 1}], condition: null,
    source: "Raider Containers. Remote-trigger signal device." },
  { id: "bp_trailblazer", name: "Trailblazer", station: "Utility", type: "utility", rarity: "rare", tier: 2,
    materials: [{name: "Mechanical Components", qty: 2}, {name: "Electrical Component", qty: 1}], condition: null,
    source: "Standard utility loot. Movement speed & stamina mod." },
  { id: "bp_barricade", name: "Barricade Kit", station: "Utility", type: "utility", rarity: "rare", tier: 2,
    materials: [{name: "Metal Scrap", qty: 3}, {name: "Mechanical Components", qty: 1}], condition: null,
    source: "Widely available. Creates deployable cover — very strong against Queen/Matriarch attacks." },
  // MEDICAL
  { id: "bp_bandage_2", name: "Bandage Mk. II", station: "Medical Lab", type: "medical", rarity: "common", tier: 1,
    materials: [{name: "Fabric", qty: 2}, {name: "Chemicals", qty: 1}], condition: null,
    source: "Medical Containers across all maps." },
  { id: "bp_combat_stim", name: "Combat Stim", station: "Medical Lab", type: "medical", rarity: "uncommon", tier: 2,
    materials: [{name: "Chemicals", qty: 2}, {name: "Syringe", qty: 1}], condition: null,
    source: "Medical Containers. Occasional quest reward. Speed + damage resist." },
  { id: "bp_revive_kit", name: "Revive Kit", station: "Medical Lab", type: "medical", rarity: "rare", tier: 2,
    materials: [{name: "Chemicals", qty: 3}, {name: "Syringe", qty: 1}, {name: "Fabric", qty: 2}], condition: null,
    source: "Medical Containers in red zones. Keeps squads alive past downs." },
  { id: "bp_vita_shot", name: "Vita Shot", station: "Medical Lab", type: "medical", rarity: "rare", tier: 3,
    materials: [{name: "Chemicals", qty: 3}, {name: "Syringe", qty: 1}], condition: null,
    source: "Medical Containers. High-tier healing injector." },
  { id: "bp_deadline", name: "Deadline", station: "Medical Lab", type: "medical", rarity: "rare", tier: 3,
    materials: [{name: "Chemicals", qty: 4}, {name: "Syringe", qty: 1}], condition: null,
    source: "Medical Containers. Late-game combat stim." },
  // GEAR BENCH — Mk.3 Augments
  { id: "bp_tac_revival", name: "Tactical Mk. 3 (Revival)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Boost to revive speed/range." },
  { id: "bp_tac_defense", name: "Tactical Mk. 3 (Defensive)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Damage mitigation." },
  { id: "bp_tac_healing", name: "Tactical Mk. 3 (Healing)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Heals faster from medical items." },
  { id: "bp_combat_aggro", name: "Combat Mk. 3 (Aggressive)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Damage amp on close range." },
  { id: "bp_combat_flank", name: "Combat Mk. 3 (Flanking)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Rewards back/side shots." },
  { id: "bp_loot_safe", name: "Looting Mk. 3 (Safekeeper)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Protects carried loot." },
  { id: "bp_loot_surv", name: "Looting Mk. 3 (Survivor)", station: "Gear Bench", type: "augment", rarity: "epic", tier: 3,
    materials: [{name: "Fabric", qty: 4}, {name: "Complex Components", qty: 2}], condition: null,
    source: "Security Containers — rare drop. Extra inventory slots." },
  // REFINER
  { id: "bp_light_parts", name: "Light Gun Parts", station: "Refiner", type: "parts", rarity: "common", tier: 1,
    materials: [{name: "Simple Gun Parts", qty: 4}, {name: "Metal Scrap", qty: 1}], condition: null,
    source: "Early-Expedition priority. Raider Containers — shares pool with many weapon BPs." },
  { id: "bp_heavy_parts", name: "Heavy Gun Parts", station: "Refiner", type: "parts", rarity: "uncommon", tier: 2,
    materials: [{name: "Simple Gun Parts", qty: 4}, {name: "Mechanical Components", qty: 2}], condition: null,
    source: "Raider Containers. Critical for higher-tier weapon upgrades — stock early." },
  { id: "bp_complex_parts", name: "Complex Gun Parts", station: "Refiner", type: "parts", rarity: "rare", tier: 3,
    materials: [{name: "Heavy Gun Parts", qty: 3}, {name: "Electrical Component", qty: 2}], condition: null,
    source: "Raider Containers. Bottleneck for epic/legendary crafts — farm during 2x conditions." },
  { id: "bp_mech_components", name: "Mechanical Components", station: "Refiner", type: "parts", rarity: "common", tier: 1,
    materials: [{name: "Metal Scrap", qty: 3}, {name: "Simple Gun Parts", qty: 1}], condition: null,
    source: "Basic refiner blueprint — enables most crafting." },
];

const STATIONS = ["All", "Gunsmith", "Medical Lab", "Explosives", "Gear Bench", "Utility", "Refiner"];

const STATION_ICON = {
  "Gunsmith":     Zap,
  "Medical Lab":  FlaskConical,
  "Explosives":   Bomb,
  "Gear Bench":   Shield,
  "Utility":      Wrench,
  "Refiner":      Cog,
};

const STATUS_LABEL = ["Find it", "In inventory", "Learned"];
const STORAGE_KEY = "ar_blueprints_v1";
const ARC_STEAM_APPID = 1808500;

const FONTS = {
  body:    "'Manrope', system-ui, sans-serif",
  display: "'Chakra Petch', system-ui, sans-serif",
  mono:    "'JetBrains Mono', ui-monospace, monospace",
};

// ---------------------------------------------------------------------------
// Persistence + fonts
// ---------------------------------------------------------------------------
async function loadStatuses() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) return JSON.parse(result.value);
  } catch (_) {}
  return {};
}

async function saveStatuses(map) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(map)); }
  catch (e) { console.error("Storage save failed", e); }
}

function useFonts() {
  useEffect(() => {
    const id = "ar-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

// Global a11y stylesheet:
//   - Visible focus ring on every interactive element (only when keyboard-navigated, via :focus-visible)
//   - Reduced-motion guard: kills animations for users with the OS preference set
function useA11yStyles() {
  useEffect(() => {
    const id = "ar-a11y-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      [role="button"]:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
        border-radius: 4px;
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const fmtDate = (d) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const fmtNum = (n) => {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 100_000)   return (n / 1000).toFixed(0) + "k";
  if (n >= 10_000)    return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString();
};

// ---------------------------------------------------------------------------
// Steam player count
// ---------------------------------------------------------------------------
async function fetchSteamPlayers(signal) {
  try {
    const r = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${ARC_STEAM_APPID}`,
      { signal }
    );
    if (r.ok) {
      const data = await r.json();
      const c = data?.response?.player_count;
      if (typeof c === "number" && c > 0) return { count: c };
    }
  } catch (_) {}

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content:
            "Search Steam Charts or SteamDB for the CURRENT live concurrent player count for ARC Raiders (Steam app id 1808500). " +
            "Reply with ONLY the integer — no commas, no words, no explanation. Example: 142503"
        }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      })
    });
    if (r.ok) {
      const data = await r.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join(" ");
      const match = text.match(/\b(\d{3,})\b/);
      if (match) return { count: parseInt(match[1], 10) };
    }
  } catch (_) {}

  return { count: null, error: true };
}

// ---------------------------------------------------------------------------
// Theme provider — system default, override stored in window.storage
// ---------------------------------------------------------------------------
function ThemeProvider({ children }) {
  // null = follow system. "light" / "dark" = explicit override.
  const [override, setOverride] = useState(null);
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Load saved override on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(THEME_KEY);
        if (r && (r.value === "light" || r.value === "dark")) setOverride(r.value);
      } catch (_) {}
    })();
  }, []);

  // Listen to system changes — only applies when no override is set
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const isDark = override ? override === "dark" : systemDark;
  const T = isDark ? DARK : LIGHT;

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setOverride(next);
    try { window.storage.set(THEME_KEY, next); } catch (_) {}
  };

  const value = useMemo(() => ({ T, isDark, toggle }), [T, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
export default function ArcRaidersCompanion() {
  return (
    <ThemeProvider>
      <ArcRaidersApp />
    </ThemeProvider>
  );
}

function ArcRaidersApp() {
  const { T, isDark, toggle } = useTheme();
  useFonts();
  useA11yStyles();
  const now = useNow();
  const [tab, setTab] = useState("blueprints");
  const [statuses, setStatuses] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [stationFilter, setStationFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [hideLearned, setHideLearned] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const [steam, setSteam] = useState(null);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState(false);
  const [playersUpdatedAt, setPlayersUpdatedAt] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);

  const playerFetchRef = useRef(null);

  const refreshPlayers = useCallback(() => {
    if (playerFetchRef.current) playerFetchRef.current.abort();
    const ac = new AbortController();
    playerFetchRef.current = ac;
    setPlayersLoading(true);
    setPlayersError(false);
    fetchSteamPlayers(ac.signal).then(({ count, error }) => {
      if (playerFetchRef.current !== ac || ac.signal.aborted) return;
      setSteam(count);
      setPlayersError(!!error);
      setPlayersUpdatedAt(new Date());
      setPlayersLoading(false);
      playerFetchRef.current = null;
    });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await loadStatuses();
      setStatuses(data);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { return refreshPlayers(); }, [refreshPlayers]);

  const ps5   = steam != null ? Math.round(steam * PLATFORM_MULT.ps5)  : null;
  const xbox  = steam != null ? Math.round(steam * PLATFORM_MULT.xbox) : null;
  const totalPlayers = steam != null ? steam + ps5 + xbox : null;

  const cycle = (id) => {
    setStatuses((prev) => {
      const next = { ...prev, [id]: ((prev[id] || 0) + 1) % 3 };
      if (next[id] === 0) delete next[id];
      saveStatuses(next);
      return next;
    });
  };

  const toggleExpand = (id) => setExpanded((cur) => (cur === id ? null : id));
  const requestReset = () => setShowResetModal(true);
  const confirmReset = () => {
    setStatuses({});
    saveStatuses({});
    setShowResetModal(false);
  };

  const filtered = useMemo(() => {
    return BLUEPRINTS.filter((bp) => {
      if (stationFilter !== "All" && bp.station !== stationFilter) return false;
      if (hideLearned && (statuses[bp.id] || 0) === 2) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesMaterials = (bp.materials || []).some(m => m.name.toLowerCase().includes(q));
        if (!bp.name.toLowerCase().includes(q) &&
            !bp.type.toLowerCase().includes(q) &&
            !bp.source.toLowerCase().includes(q) &&
            !(bp.condition || "").toLowerCase().includes(q) &&
            !matchesMaterials) return false;
      }
      return true;
    });
  }, [stationFilter, query, hideLearned, statuses]);

  const stats = useMemo(() => {
    const total = BLUEPRINTS.length;
    let learned = 0, inv = 0;
    for (const bp of BLUEPRINTS) {
      const s = statuses[bp.id] || 0;
      if (s === 2) learned++;
      else if (s === 1) inv++;
    }
    return { total, learned, inv, pct: total ? Math.round((learned / total) * 100) : 0 };
  }, [statuses]);

  return (
    <div className="min-h-screen relative"
         style={{ fontFamily: FONTS.body, color: T.text, backgroundColor: T.bg }}>

      {/* Soft atmospheric glow — visible in dark mode only via T.bgGlowA/B */}
      <div className="pointer-events-none fixed inset-0"
           style={{
             backgroundImage:
               `radial-gradient(ellipse 60% 40% at 50% 0%, ${T.bgGlowA}, transparent 70%),
                radial-gradient(ellipse 60% 40% at 50% 100%, ${T.bgGlowB}, transparent 70%)`,
           }} />

      <header className="border-b sticky top-0 z-20 backdrop-blur"
              style={{ borderColor: T.border, backgroundColor: `${T.bg}E6` }}>
        <div className="max-w-md mx-auto px-4 pt-3 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] tracking-[0.3em] font-semibold"
                  style={{ fontFamily: FONTS.mono, color: T.blueDeep }}>
              SPERANZA // CH 47
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] tabular-nums"
                  style={{ fontFamily: FONTS.mono, color: T.textSoft }}>
              <Clock size={11} style={{ color: T.textMuted }} />
              <span>{fmtDate(now)}</span>
              <span style={{ color: T.border }}>·</span>
              <span>{fmtTime(now)}</span>
            </span>
            <button
              onClick={toggle}
              className="flex items-center justify-center w-11 h-11 -m-2 rounded-full hover:opacity-80 transition"
              style={{ color: T.textSoft }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mt-1"
              style={{ fontFamily: FONTS.display, letterSpacing: "0.01em", color: T.text }}>
            <span style={{ color: T.red }}>ARC</span> RAIDERS
            <span className="font-medium text-xl ml-2" style={{ color: T.textMuted }}>Companion</span>
          </h1>

          {/* Telemetry — collapsible */}
          <div className="mt-3 rounded-md border overflow-hidden"
               style={{ backgroundColor: T.card, borderColor: T.border }}>
            <button
              onClick={() => setTelemetryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-black/[0.02] transition"
              style={{ backgroundColor: telemetryOpen ? T.cardSoft : T.card, borderBottom: telemetryOpen ? `1px solid ${T.borderSoft}` : "none" }}
              aria-expanded={telemetryOpen}>
              <div className="flex items-center gap-1.5">
                <Users size={12} style={{ color: T.textMuted }} />
                <span className="text-[10px] uppercase tracking-[0.18em] font-bold"
                      style={{ fontFamily: FONTS.display, color: T.textMuted }}>Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums"
                      style={{ fontFamily: FONTS.mono, color: playersError ? T.textMuted : T.blueDeep }}>
                  {playersLoading ? "…" : playersError ? "Offline" : `≈ ${fmtNum(totalPlayers)}`}
                </span>
                {telemetryOpen ? <ChevronUp size={14} style={{ color: T.textMuted }} /> : <ChevronDown size={14} style={{ color: T.textMuted }} />}
              </div>
            </button>

            {telemetryOpen && (
              <>
                <div className="flex items-center justify-between px-3 py-1.5 border-b"
                     style={{ borderColor: T.borderSoft, backgroundColor: T.cardSoft }}>
                  <button onClick={() => setShowInfo((v) => !v)}
                          className="flex items-center gap-1.5 px-2 py-1 -mx-2 -my-1 rounded hover:bg-black/5 transition"
                          style={{ color: T.textMuted }}>
                    <Info size={12} />
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ fontFamily: FONTS.display }}>methodology</span>
                  </button>
                  <button onClick={refreshPlayers} disabled={playersLoading}
                          className="flex items-center gap-1.5 px-2 py-1 -mx-2 -my-1 rounded hover:bg-black/5 disabled:opacity-50 transition"
                          style={{ color: T.textMuted }}>
                    <RefreshCw size={12} className={playersLoading ? "animate-spin" : ""} />
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ fontFamily: FONTS.display }}>refresh</span>
                  </button>
                </div>

                <div className="grid grid-cols-3">
                  <PlatformCell icon={Monitor}  label="PC"   count={steam} loading={playersLoading} error={playersError} />
                  <PlatformCell icon={Gamepad2} label="PS5"  count={ps5}   loading={playersLoading} error={playersError} badge="EST" divider />
                  <PlatformCell icon={Gamepad2} label="Xbox" count={xbox}  loading={playersLoading} error={playersError} badge="EST" divider />
                </div>

                {showInfo && (
                  <div className="px-3 py-2 text-[11px] leading-snug border-t"
                       style={{ borderColor: T.borderSoft, color: T.textMuted, backgroundColor: T.cardSoft }}>
                    PC is live from Steam's public API. PS5 &amp; Xbox aren't published by Sony or Microsoft, so they're estimated
                    from Steam using Nexon's Jan 2026 cross-platform DAU split (PC 53% · PS5 25.5% · Xbox 21%).
                  </div>
                )}
                {!showInfo && playersUpdatedAt && !playersLoading && !playersError && (
                  <div className="px-3 py-1 text-[10px] border-t"
                       style={{ borderColor: T.borderSoft, color: T.textFaint, fontFamily: FONTS.mono }}>
                    Updated {fmtTime(playersUpdatedAt)} · PS5/Xbox estimated
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex-1 h-2 rounded-full overflow-hidden ring-1"
                 style={{ backgroundColor: T.borderSoft }}>
              <div className="h-full transition-all"
                   style={{ width: `${stats.pct}%`, backgroundImage: `linear-gradient(90deg, ${T.blue}, ${T.red})` }} />
            </div>
            <div className="whitespace-nowrap text-sm tabular-nums"
                 style={{ fontFamily: FONTS.mono, color: T.textSoft }}>
              <span className="font-bold" style={{ color: T.blueDeep }}>{stats.learned}</span>
              <span style={{ color: T.textFaint }}>/{stats.total}</span>
              <span className="ml-1.5 text-[11px]" style={{ color: T.textMuted }}>{stats.pct}%</span>
            </div>
          </div>

          {stats.inv > 0 && (
            <div className="text-xs mt-2 flex items-center gap-1.5 font-bold uppercase tracking-wider" style={{ color: T.warning, fontFamily: FONTS.display }}>
              <AlertTriangle size={12} />
              <span>{stats.inv} unlearned in inventory</span>
            </div>
          )}
        </div>

        <nav className="max-w-md mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { id: "blueprints", label: "Blueprints", icon: Package },
            { id: "maps",       label: "Maps",       icon: MapIcon },
            { id: "guide",      label: "Guide",      icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-[0.15em] uppercase border-b-2 transition-colors whitespace-nowrap"
                style={{
                  fontFamily: FONTS.display,
                  color: active ? T.blueDeep : T.textMuted,
                  borderColor: active ? T.blue : "transparent",
                }}>
                <Icon size={14} />{label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-md mx-auto px-4 pb-24 pt-4 relative z-10">
        {!loaded ? (
          <div className="flex items-center justify-center py-20 text-sm" style={{ color: T.textMuted }}>
            <Loader2 className="animate-spin mr-2" size={16} />
            Loading raid log…
          </div>
        ) : tab === "blueprints" ? (
          <BlueprintsTab
            statuses={statuses} cycle={cycle}
            stationFilter={stationFilter} setStationFilter={setStationFilter}
            query={query} setQuery={setQuery}
            hideLearned={hideLearned} setHideLearned={setHideLearned}
            filtered={filtered} resetAll={requestReset}
            expanded={expanded} toggleExpand={toggleExpand}
          />
        ) : tab === "maps" ? <MapsTab /> : <GuideTab />}
      </main>

      {showResetModal && (
        <ResetConfirmModal onCancel={() => setShowResetModal(false)} onConfirm={confirmReset} />
      )}
    </div>
  );
}

function ResetConfirmModal({ onCancel, onConfirm }) {
  const { T } = useTheme();
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: T.modalScrim, backdropFilter: "blur(2px)" }}
         onClick={onCancel} role="dialog" aria-modal="true">
      <div className="relative rounded-lg border shadow-xl w-full max-w-sm"
           style={{ backgroundColor: T.card, borderColor: T.border }}
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 p-4 border-b" style={{ borderColor: T.borderSoft }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
               style={{ backgroundColor: T.redTint, color: T.redDeep }}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 pt-0.5">
            <h2 className="text-base font-bold" style={{ fontFamily: FONTS.display, color: T.text }}>
              Reset all progress?
            </h2>
            <p className="text-[13px] mt-1 leading-snug" style={{ color: T.textSoft }}>
              This will clear every blueprint status. This action cannot be undone.
            </p>
          </div>
          <button onClick={onCancel}
                  className="shrink-0 w-11 h-11 -m-2 flex items-center justify-center rounded hover:bg-black/5 transition"
                  style={{ color: T.textMuted }}
                  aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 p-3 justify-end" style={{ backgroundColor: T.cardSoft }}>
          <button onClick={onCancel}
            className="px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase rounded-md border transition hover:opacity-80"
            style={{ fontFamily: FONTS.display, backgroundColor: T.card, borderColor: T.border, color: T.textSoft }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase rounded-md border transition hover:opacity-90"
            style={{ fontFamily: FONTS.display, backgroundColor: T.red, borderColor: T.redDeep, color: "#ffffff" }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function PlatformCell({ icon: Icon, label, count, loading, error, badge, divider }) {
  const { T } = useTheme();
  const display = loading ? "…" : error ? "—" : fmtNum(count);
  return (
    <div className="px-2.5 py-2 text-center"
         style={{ borderLeft: divider ? `1px solid ${T.borderSoft}` : undefined }}>
      <div className="flex items-center justify-center gap-1.5">
        <Icon size={11} style={{ color: T.textMuted }} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-bold"
              style={{ fontFamily: FONTS.display, color: T.textMuted }}>{label}</span>
        {badge && (
          <span className="text-[8px] uppercase tracking-wider px-1 py-px rounded-sm font-bold"
                style={{ fontFamily: FONTS.mono, backgroundColor: T.redTint, color: T.redDeep, border: `1px solid ${T.redBorder}` }}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-[15px] font-bold mt-0.5 tabular-nums"
           style={{ fontFamily: FONTS.mono, color: error || loading ? T.textMuted : T.text }}>
        {display}
      </div>
    </div>
  );
}

// ===========================================================================
// BLUEPRINTS TAB
// ===========================================================================
function BlueprintsTab({
  statuses, cycle, stationFilter, setStationFilter,
  query, setQuery, hideLearned, setHideLearned, filtered, resetAll,
  expanded, toggleExpand,
}) {
  const { T } = useTheme();
  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textFaint }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, source, condition, material…"
          aria-label="Search blueprints"
          className="w-full rounded-md pl-10 pr-3 py-2.5 text-sm border focus:outline-none focus:ring-2"
          style={{ backgroundColor: T.card, borderColor: T.border, color: T.text }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {STATIONS.map((s) => {
          const active = stationFilter === s;
          return (
            <button key={s} onClick={() => setStationFilter(s)}
              className="px-3.5 py-1.5 text-xs font-bold tracking-[0.1em] uppercase rounded-full border whitespace-nowrap transition"
              style={{
                fontFamily: FONTS.display,
                backgroundColor: active ? T.blueTint : T.card,
                borderColor: active ? T.blue : T.border,
                color: active ? T.blueDeep : T.textSoft,
              }}>
              {s}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 mt-3 mb-3">
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: T.textSoft }}>
          <input type="checkbox" checked={hideLearned} onChange={(e) => setHideLearned(e.target.checked)}
                 className="w-4 h-4" style={{ accentColor: T.blue }} />
          Hide learned
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums" style={{ color: T.textMuted, fontFamily: FONTS.mono }}>
            {filtered.length}/{BLUEPRINTS.length}
          </span>
          <button onClick={resetAll}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded hover:bg-black/5 transition"
            style={{ color: T.textMuted }}>
            <RotateCcw size={12} />Reset
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {filtered.map((bp) => (
          <BlueprintCard
            key={bp.id}
            bp={bp}
            status={statuses[bp.id] || 0}
            onCycle={() => cycle(bp.id)}
            expanded={expanded === bp.id}
            onToggleExpand={() => toggleExpand(bp.id)}
          />
        ))}
        {filtered.length === 0 && (
          <li className="text-center py-12 rounded-md border"
              style={{ backgroundColor: T.card, borderColor: T.borderSoft }}>
            <Search size={20} className="mx-auto mb-2" style={{ color: T.textFaint }} />
            <p className="text-sm font-semibold" style={{ color: T.textSoft }}>No blueprints match</p>
            <p className="text-xs mt-1 px-6" style={{ color: T.textMuted }}>
              Try a different search term or adjust your filters.
            </p>
            <button
              onClick={() => { setQuery(""); setStationFilter("All"); setHideLearned(false); }}
              className="mt-3 px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase rounded-md border transition hover:opacity-80"
              style={{ fontFamily: FONTS.display, backgroundColor: T.blueTint, borderColor: T.blue, color: T.blueDeep }}>
              Clear filters
            </button>
          </li>
        )}
      </ul>

      <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: T.textMuted }}>
        Tap the circle to cycle status. Tap the rest of the card for details.
      </p>
    </div>
  );
}

function BlueprintCard({ bp, status, onCycle, expanded, onToggleExpand }) {
  const { T } = useTheme();
  const Icon = STATION_ICON[bp.station] || Package;
  const r = T.rarity[bp.rarity];
  const learned = status === 2;
  const inInv = status === 1;
  const cond = bp.condition ? T.condition[bp.condition] : null;
  const CondIcon = bp.condition ? CONDITION_ICON[bp.condition] : null;
  const cardBg = learned ? T.learnedBg : inInv ? T.invBg : T.card;
  const cardBd = learned ? T.learnedBd : inInv ? T.invBd : T.border;

  const StatusGlyph = () => {
    if (learned) {
      return (
        <div className="w-6 h-6 rounded-full flex items-center justify-center"
             style={{ backgroundColor: T.learnedFg, color: T.bg }}>
          <Check size={14} strokeWidth={3} />
        </div>
      );
    }
    if (inInv) {
      return (
        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center relative overflow-hidden"
             style={{ borderColor: T.redDeep, backgroundColor: T.card }}>
          <div className="absolute inset-0 w-full" style={{ height: "50%", top: "50%", backgroundColor: T.red }} />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full border-2"
           style={{ borderColor: T.border, backgroundColor: T.card }} />
    );
  };

  return (
    <li>
      <div className="rounded-md border overflow-hidden transition-all flex"
           style={{
             backgroundColor: cardBg, borderColor: cardBd,
             boxShadow: !learned && !inInv ? T.cardShadow : undefined,
           }}>
        {/* Rarity stripe */}
        <div className="shrink-0" style={{ width: 4, backgroundColor: r.dot }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 p-3">
            <button
              onClick={(e) => { e.stopPropagation(); onCycle(); }}
              className="w-11 h-11 -m-1.5 flex items-center justify-center shrink-0 rounded transition"
              aria-label={`Status: ${STATUS_LABEL[status]}. Tap to cycle.`}>
              <StatusGlyph />
            </button>

            <button onClick={onToggleExpand}
              className="flex-1 text-left min-w-0 transition">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[15px] font-bold truncate"
                    style={{
                      fontFamily: FONTS.display, letterSpacing: "0.005em",
                      color: learned ? T.textFaint : T.text,
                      textDecoration: learned ? "line-through" : "none",
                    }}>
                  {bp.name}
                </h3>
                {cond && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm font-bold"
                        style={{
                          fontFamily: FONTS.mono,
                          backgroundColor: learned ? "transparent" : cond.bg,
                          color: learned ? T.textMuted : cond.color,
                          border: `1px solid ${learned ? T.border : cond.border}`,
                        }}>
                    <CondIcon size={9} />
                    {bp.condition}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px]" style={{ color: T.textMuted }}>
                <Icon size={11} style={{ color: T.textFaint }} />
                <span>{bp.station}</span>
                <span style={{ color: T.border }}>·</span>
                <span style={{ fontFamily: FONTS.mono }}>T{bp.tier}</span>
                <span style={{ color: T.border }}>·</span>
                <span className="uppercase tracking-wider font-bold text-[10px]" style={{ color: r.text }}>
                  {r.label}
                </span>
              </div>
            </button>

            <div className="shrink-0 self-center p-1" style={{ color: T.textFaint }} aria-hidden="true">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {expanded && (
            <div className="border-t px-3 py-3 space-y-3"
                 style={{ borderColor: T.borderSoft, backgroundColor: learned ? T.learnedBg : inInv ? T.invBg : T.cardSoft }}>
              {bp.materials && bp.materials.length > 0 && (
                <DetailRow icon={Cog} label="Crafts for">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {bp.materials.map((m, i) => (
                      <span key={i}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border"
                            style={{ backgroundColor: T.card, borderColor: T.border, color: T.textSoft }}>
                        <span className="font-bold tabular-nums" style={{ fontFamily: FONTS.mono, color: T.blueDeep }}>
                          {m.qty}×
                        </span>
                        <span>{m.name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: T.textMuted }}>
                    Requires <span className="font-semibold" style={{ color: T.textSoft }}>
                      {bp.station} Tier {bp.tier}
                    </span>.
                  </p>
                </DetailRow>
              )}

              <DetailRow icon={MapPin} label="How to find">
                <p className="text-[12px] leading-relaxed" style={{ color: T.textSoft }}>
                  {bp.source}
                </p>
              </DetailRow>

              <DetailRow icon={Star} label="Rarity">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.dot }} />
                  <span className="font-bold" style={{ color: r.text }}>{r.label}</span>
                  <span style={{ color: T.textMuted }}>·</span>
                  <span style={{ color: T.textMuted }}>Sells for 5,000 coins if duplicate.</span>
                </div>
              </DetailRow>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  const { T } = useTheme();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color: T.textMuted }} />
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold"
              style={{ fontFamily: FONTS.display, color: T.textMuted }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ===========================================================================
// MAPS TAB
// ===========================================================================
function MapsTab() {
  const { T } = useTheme();
  const [expandedMap, setExpandedMap] = useState(null);
  return (
    <div>
      <div className="rounded-md border p-3 mb-3 text-[11px] leading-relaxed"
           style={{ backgroundColor: T.cardSoft, borderColor: T.borderSoft, color: T.textSoft }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Info size={11} style={{ color: T.textMuted }} />
          <span className="uppercase tracking-[0.18em] font-bold text-[10px]"
                style={{ fontFamily: FONTS.display, color: T.textMuted }}>
            How to read this
          </span>
        </div>
        <p>
          Difficulty is community consensus (1–5 skulls). Blueprint focus shows what the map is
          <span className="font-semibold" style={{ color: T.blueDeep }}> known for dropping</span> — plan runs around it.
          Tap any card to expand extract hatches and conditions.
        </p>
      </div>

      <ul className="space-y-2">
        {MAPS.map((m) => {
          const isOpen = expandedMap === m.id;
          const upcoming = m.status === "upcoming";
          return (
            <li key={m.id}>
              <button
                onClick={() => setExpandedMap(isOpen ? null : m.id)}
                className="w-full text-left rounded-md border transition-all overflow-hidden"
                style={{
                  backgroundColor: upcoming ? T.cardSoft : T.card,
                  borderColor: upcoming ? T.borderSoft : T.border,
                  opacity: upcoming ? 0.85 : 1,
                  boxShadow: !upcoming ? T.cardShadow : undefined,
                }}>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold truncate"
                            style={{ fontFamily: FONTS.display, color: T.text }}>
                          {m.name}
                        </h3>
                        {upcoming && (
                          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm font-bold inline-flex items-center gap-1"
                                style={{ fontFamily: FONTS.mono, backgroundColor: T.redTint, color: T.redDeep, border: `1px solid ${T.redBorder}` }}>
                            <CalendarClock size={9} />SOON
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{m.subtitle}</div>
                    </div>

                    {m.difficulty != null && (
                      <div className="flex items-center gap-0.5 shrink-0 pt-0.5"
                           title={`Difficulty ${m.difficulty}/5 — ${m.recommended}`}>
                        {[1,2,3,4,5].map((i) => (
                          <Skull key={i} size={12}
                            style={{ color: i <= m.difficulty ? T.red : T.border, opacity: i <= m.difficulty ? (0.45 + 0.11 * i) : 1 }}
                            fill={i <= m.difficulty ? T.red : "transparent"} />
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs mt-2 leading-relaxed" style={{ color: T.textSoft }}>{m.flavor}</p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {m.recommended && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border"
                            style={{ fontFamily: FONTS.display, color: T.blueDeep, backgroundColor: T.blueTint, borderColor: T.blueBorder }}>
                        <Star size={10} />{m.recommended}
                      </span>
                    )}
                    {!upcoming && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border"
                            style={{ fontFamily: FONTS.display, color: T.textSoft, backgroundColor: T.cardSoft, borderColor: T.borderSoft }}>
                        <DoorOpen size={10} />{m.extracts.length} extract types
                      </span>
                    )}
                  </div>

                  {!upcoming && (
                    <div className="mt-2.5 rounded border px-2.5 py-1.5 flex items-start gap-2"
                         style={{ backgroundColor: T.redTint, borderColor: T.redBorder }}>
                      <Package size={12} style={{ color: T.redDeep, marginTop: 2 }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.2em] font-bold"
                             style={{ fontFamily: FONTS.display, color: T.redDeep }}>
                          Blueprint Focus
                        </div>
                        <div className="text-[11px] leading-snug mt-0.5" style={{ color: T.redDark }}>
                          {m.bpFocus}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isOpen && !upcoming && (
                  <div className="border-t px-3.5 py-3 grid grid-cols-1 gap-3"
                       style={{ borderColor: T.borderSoft, backgroundColor: T.cardSoft }}>
                    <DetailRow icon={MapPin} label="Key POIs">
                      <p className="text-[12px] leading-relaxed" style={{ color: T.textSoft }}>{m.pois}</p>
                    </DetailRow>
                    <DetailRow icon={DoorOpen} label={`Raider Hatches (${m.hatches.length})`}>
                      <p className="text-[12px] leading-relaxed" style={{ color: T.textSoft }}>{m.hatches.join(" · ")}</p>
                    </DetailRow>
                    <DetailRow icon={CalendarClock} label="Conditions that cycle here">
                      <p className="text-[12px] leading-relaxed" style={{ color: T.textSoft }}>{m.conditions.join(" · ")}</p>
                    </DetailRow>
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-md border p-3 text-[11px] leading-relaxed"
           style={{ backgroundColor: T.card, borderColor: T.border, color: T.textSoft }}>
        <div className="font-bold mb-1" style={{ color: T.text, fontFamily: FONTS.display }}>
          Extract types, quick ref
        </div>
        <ul className="space-y-1">
          <li>• <span style={{ color: T.blueDeep, fontWeight: 600 }}>Cargo Elevator</span> — ~90s, loud siren audible zone-wide.</li>
          <li>• <span style={{ color: T.blueDeep, fontWeight: 600 }}>Metro</span> — ~90s, puzzle-gated.</li>
          <li>• <span style={{ color: T.blueDeep, fontWeight: 600 }}>Airshaft</span> — ~60–70s, lower noise.</li>
          <li>• <span style={{ color: T.redDeep, fontWeight: 600 }}>Raider Hatch</span> — single-use key, 15s window, silent. Best for high-value loads.</li>
        </ul>
        <p className="mt-2" style={{ color: T.textMuted }}>
          Downed Raiders can still interact with terminals. Timing your activation to the round's final seconds can unlock "overtime" extraction.
        </p>
      </div>
    </div>
  );
}

// ===========================================================================
// GUIDE TAB
// ===========================================================================
function GuideTab() {
  const { T } = useTheme();
  const B = ({ children }) => <span className="font-semibold" style={{ color: T.blueDeep }}>{children}</span>;
  const R = ({ children }) => <span className="font-semibold" style={{ color: T.redDeep }}>{children}</span>;
  const N = ({ children }) => <span className="font-semibold" style={{ color: T.text }}>{children}</span>;
  return (
    <div className="space-y-4">
      <Section title="The one rule that bites everyone">
        <p>A blueprint is <R>only yours after extraction</R>. Die before the elevator and it drops with everything else.
           If you find a rare blueprint, push for the nearest exit — don't get greedy.</p>
      </Section>
      <Section title="Learn & Consume">
        <p>Back in Speranza, open inventory → blueprint → <B>Learn and Consume</B>. The recipe is now <B>permanent and account-wide</B>.</p>
      </Section>
      <Section title="Workstations & tiers">
        <p>Every blueprint belongs to a station: Gunsmith, Medical Lab, Explosives, Gear Bench, Utility, or Refiner.
           High-tier recipes need <B>Tier III</B> stations — the craft button is locked otherwise.</p>
      </Section>
      <Section title="Duplicates">
        <p>Options for duplicates:</p>
        <ul className="mt-2 space-y-1.5" style={{ color: T.textSoft }}>
          <li>• <B>Sell</B> — flat 5,000 coins regardless of rarity.</li>
          <li>• <B>Trade</B> — drop for a teammate (no formal trade UI; trust-based).</li>
        </ul>
      </Section>
      <Section title="Container types, highest blueprint rates">
        <ul className="space-y-1.5" style={{ color: T.textSoft }}>
          <li>• <N>Weapon cases</N> — 3× higher blueprint rate than standard containers.</li>
          <li>• <N>Raider caches</N> — consistent chance; audible ticking sound.</li>
          <li>• <N>Black raider boxes</N> — high blueprint rate.</li>
          <li>• <N>Med duffels</N> — moderate rate (medical blueprints).</li>
          <li>• <N>Standard lockers</N> — low rate; skip when time-pressured.</li>
        </ul>
      </Section>
      <Section title="Map conditions matter">
        <p>Target-specific blueprints only drop under conditions: <B>Night Raid</B> (Wolfpack, Tempest), <B>EM Storm</B> (Snap Hook),
          <B> Closed Gate</B> (Bobcat), <B>Hidden Bunker</B> (Vulcano), <B>Harvester</B> (Equalizer, Jupiter). Check event timers before loading in.</p>
      </Section>
      <Section title="Early-game priority list">
        <ul className="space-y-1.5" style={{ color: T.textSoft }}>
          <li>• <B>Burletta</B> — solid early weapon, quest reward.</li>
          <li>• <B>Smoke Grenade</B> — escape tool, cheap craft.</li>
          <li>• <B>Lightweight Stock</B> — handling boost on every gun.</li>
          <li>• <B>Anvil</B> — pocket hand cannon; reliable farm at Dam highway cache.</li>
          <li>• <B>Heavy Gun Parts</B> — unlocks upgrades for most weapons; farm early.</li>
        </ul>
      </Section>
      <p className="text-xs text-center pt-2" style={{ color: T.textFaint }}>
        Companion data v2.2 · Extend BLUEPRINTS and MAPS arrays to add more.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  const { T } = useTheme();
  return (
    <section className="rounded-md p-4 border"
             style={{ backgroundColor: T.card, borderColor: T.border, boxShadow: T.cardShadow }}>
      <h2 className="text-xs tracking-[0.2em] uppercase mb-2.5 font-bold"
          style={{ fontFamily: FONTS.display, color: T.blueDeep }}>{title}</h2>
      <div className="text-[15px] leading-relaxed" style={{ color: T.textSoft }}>{children}</div>
    </section>
  );
}
