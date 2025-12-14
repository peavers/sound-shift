import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import type { AppSettings } from "../types";
import { isDemoMode, mockSettings } from "../mocks/demoData";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    run_on_startup: false,
    start_minimized: false,
    close_to_tray: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Use mock data in demo mode
      if (isDemoMode()) {
        setSettings(mockSettings);
        setLoading(false);
        return;
      }

      const result = await invoke<AppSettings>("get_settings");
      setSettings(result);

      // Sync autostart state with system
      const autostartEnabled = await isEnabled();
      if (autostartEnabled !== result.run_on_startup) {
        setSettings(prev => ({ ...prev, run_on_startup: autostartEnabled }));
      }
    } catch (e) {
      console.error("Failed to fetch settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // In demo mode, just update local state
      if (isDemoMode()) {
        return;
      }

      await invoke("update_settings", { settings: newSettings });

      // Handle autostart toggle
      if (key === "run_on_startup") {
        if (value) {
          await enable();
        } else {
          await disable();
        }
      }
    } catch (e) {
      console.error("Failed to update setting:", e);
      // Revert on error
      fetchSettings();
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full bg-primary-500/20 animate-pulse-subtle"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-surface-100 tracking-tight">Settings</h2>
        <p className="text-surface-400 mt-1">Configure application behavior</p>
      </div>

      <div className="space-y-4">
        {/* Startup Settings */}
        <div className="bg-surface-850 rounded-2xl border border-surface-750 p-6 space-y-5">
          <h3 className="text-base font-medium text-surface-100">Startup</h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-surface-100 text-sm font-medium">Run on startup</p>
              <p className="text-xs text-surface-500 mt-0.5">Automatically start when Windows boots</p>
            </div>
            <button
              onClick={() => updateSetting("run_on_startup", !settings.run_on_startup)}
              className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                settings.run_on_startup ? "bg-primary-500" : "bg-surface-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  settings.run_on_startup ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-surface-100 text-sm font-medium">Start minimized</p>
              <p className="text-xs text-surface-500 mt-0.5">Start in the system tray instead of showing the window</p>
            </div>
            <button
              onClick={() => updateSetting("start_minimized", !settings.start_minimized)}
              className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                settings.start_minimized ? "bg-primary-500" : "bg-surface-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  settings.start_minimized ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-surface-100 text-sm font-medium">Close to system tray</p>
              <p className="text-xs text-surface-500 mt-0.5">Minimize to tray when closing the window instead of quitting</p>
            </div>
            <button
              onClick={() => updateSetting("close_to_tray", !settings.close_to_tray)}
              className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                settings.close_to_tray ? "bg-primary-500" : "bg-surface-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  settings.close_to_tray ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-surface-850 rounded-2xl border border-surface-750 p-6">
          <h3 className="text-base font-medium text-surface-100 mb-2">About</h3>
          <p className="text-surface-300 text-sm">SoundShift v0.1.0</p>
          <p className="text-xs text-surface-500 mt-2 leading-relaxed">
            Quick audio device switching with keyboard shortcuts.
          </p>
        </div>
      </div>
    </div>
  );
}
