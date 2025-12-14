import { useEffect, useState } from "react";
import type { AudioDevice, DeviceGroup } from "../../types";
import ShortcutRecorder from "../shortcuts/ShortcutRecorder";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<DeviceGroup, "id" | "current_index"> & { id?: string }) => void;
  devices: AudioDevice[];
  editingGroup: DeviceGroup | null;
}

export default function GroupModal({ isOpen, onClose, onSave, devices, editingGroup }: GroupModalProps) {
  const [name, setName] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [shortcut, setShortcut] = useState<string | null>(null);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setSelectedDevices(editingGroup.device_ids);
      setShortcut(editingGroup.shortcut);
    } else {
      setName("");
      setSelectedDevices([]);
      setShortcut(null);
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedDevices.length === 0) return;

    onSave({
      id: editingGroup?.id,
      name: name.trim(),
      device_ids: selectedDevices,
      shortcut,
    });
  };

  const toggleDevice = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const moveDevice = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedDevices.length) return;

    const newDevices = [...selectedDevices];
    [newDevices[index], newDevices[newIndex]] = [newDevices[newIndex], newDevices[index]];
    setSelectedDevices(newDevices);
  };

  const getDeviceName = (id: string) => devices.find(d => d.id === id)?.name || "Unknown";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-850 rounded-2xl border border-surface-700 w-full max-w-md overflow-hidden shadow-lg animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-750 flex items-center justify-between">
          <h2 className="text-lg font-medium text-surface-100">
            {editingGroup ? "Edit Group" : "New Group"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-surface-400 hover:text-surface-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Gaming, Music, Work..."
              autoFocus
              className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-all duration-200"
            />
          </div>

          {/* Device Selection */}
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-3">
              Devices
            </label>
            <div className="space-y-1">
              {devices.map((device) => {
                const isSelected = selectedDevices.includes(device.id);
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => toggleDevice(device.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-primary-500/10 text-surface-100"
                        : "text-surface-400 hover:bg-surface-800 hover:text-surface-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-primary-500 text-white"
                          : "border-2 border-surface-600"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{device.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cycle Order - Only show when 2+ devices selected */}
          {selectedDevices.length >= 2 && (
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-3">
                Cycle Order
              </label>
              <div className="bg-surface-800 rounded-xl p-2 space-y-1">
                {selectedDevices.map((deviceId, index) => (
                  <div
                    key={deviceId}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-750"
                  >
                    <span className="w-6 h-6 rounded-md bg-surface-600 text-surface-300 text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-surface-200 truncate">
                      {getDeviceName(deviceId)}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => moveDevice(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 text-surface-400 hover:text-surface-100 disabled:opacity-20 disabled:hover:text-surface-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDevice(index, "down")}
                        disabled={index === selectedDevices.length - 1}
                        className="p-1.5 text-surface-400 hover:text-surface-100 disabled:opacity-20 disabled:hover:text-surface-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-surface-500 mt-2">
                This is the order devices will cycle through
              </p>
            </div>
          )}

          {/* Shortcut */}
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              Shortcut <span className="text-surface-500 font-normal">(optional)</span>
            </label>
            <ShortcutRecorder
              value={shortcut}
              onChange={setShortcut}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-750 flex items-center justify-between">
          <span className="text-sm text-surface-500">
            {selectedDevices.length === 0
              ? "Select at least one device"
              : `${selectedDevices.length} device${selectedDevices.length !== 1 ? 's' : ''} selected`
            }
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-surface-300 hover:text-surface-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!name.trim() || selectedDevices.length === 0}
              className="px-5 py-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-sm font-medium text-white"
            >
              {editingGroup ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
