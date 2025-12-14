import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { AudioDevice } from "../types";
import DeviceRow from "../components/devices/DeviceRow";
import { isDemoMode, mockDevices } from "../mocks/demoData";

export default function DevicesPage() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);

      // Use mock data in demo mode
      if (isDemoMode()) {
        setDevices(mockDevices);
        setError(null);
        setLoading(false);
        return;
      }

      const result = await invoke<AudioDevice[]>("get_audio_devices");
      setDevices(result);
      setError(null);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultDevice = async (deviceId: string) => {
    try {
      await invoke("set_default_device", { deviceId });
      await fetchDevices();
    } catch (e) {
      setError(e as string);
    }
  };

  useEffect(() => {
    fetchDevices();

    // Skip event listeners in demo mode (Tauri APIs not available in browser)
    if (isDemoMode()) {
      return;
    }

    // Listen for device switches from keyboard shortcuts
    const unlistenSwitch = listen("device-switched", () => {
      fetchDevices();
    });

    // Listen for device connect/disconnect events
    const unlistenDevices = listen("devices-changed", () => {
      fetchDevices();
    });

    return () => {
      unlistenSwitch.then((fn) => fn());
      unlistenDevices.then((fn) => fn());
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-surface-100 tracking-tight">Audio Devices</h2>
          <p className="text-surface-400 mt-1">View and manage your audio output devices</p>
        </div>
        <button
          onClick={fetchDevices}
          className="px-4 py-2 bg-surface-750 hover:bg-surface-700 rounded-xl transition-all duration-200 text-sm text-surface-300 hover:text-surface-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 animate-pulse-subtle"></div>
        </div>
      ) : error ? (
        <div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-4 text-danger-400">
          {error}
        </div>
      ) : (
        <div className="grid gap-3">
          {devices.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              isActive={device.is_default}
              onClick={() => setDefaultDevice(device.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
