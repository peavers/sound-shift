import type { AudioDevice, DeviceGroup, AppSettings } from "../types";

// Check if demo mode is enabled via:
// 1. URL parameter: ?demo
// 2. Environment variable: VITE_DEMO_MODE=true
export const isDemoMode = () => {
  // Check env var first (set at build time)
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    return true;
  }
  // Check URL parameter (runtime)
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).has("demo");
  }
  return false;
};

// Realistic mock devices
export const mockDevices: AudioDevice[] = [
  { id: "dev-1", name: "Speakers (Realtek High Definition Audio)", is_default: true },
  { id: "dev-2", name: "Headphones (HyperX Cloud II Wireless)", is_default: false },
  { id: "dev-3", name: "NVIDIA RTX Voice", is_default: false },
  { id: "dev-4", name: "Focusrite Scarlett 2i2 USB", is_default: false },
  { id: "dev-5", name: "LG TV (HDMI)", is_default: false },
];

// Realistic mock groups
export const mockGroups: DeviceGroup[] = [
  {
    id: "grp-1",
    name: "Gaming",
    device_ids: ["dev-2", "dev-1"],
    current_index: 0,
    shortcut: "Ctrl+Alt+G",
  },
  {
    id: "grp-2",
    name: "Music Production",
    device_ids: ["dev-4", "dev-2"],
    current_index: 0,
    shortcut: "Ctrl+Alt+M",
  },
  {
    id: "grp-3",
    name: "Movies",
    device_ids: ["dev-5", "dev-1"],
    current_index: 0,
    shortcut: "Ctrl+Alt+V",
  },
];

// Mock settings
export const mockSettings: AppSettings = {
  run_on_startup: true,
  start_minimized: false,
  auto_update: true,
};
