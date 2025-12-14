// Audio device from Windows API
export interface AudioDevice {
  id: string;
  name: string;
  is_default: boolean;
}

// Device group with shortcut
export interface DeviceGroup {
  id: string;
  name: string;
  device_ids: string[];
  shortcut: string | null;
  current_index: number;
}

// Application settings
export interface AppSettings {
  run_on_startup: boolean;
  start_minimized: boolean;
  auto_update: boolean;
}

// Store schema
export interface AppStore {
  groups: DeviceGroup[];
  settings: AppSettings;
  version: number;
}

// Shortcut event from backend
export interface ShortcutEvent {
  group_id: string;
  shortcut: string;
  new_device_id: string;
  new_device_name: string;
}

// Navigation items
export type NavItem = "devices" | "groups" | "settings";
