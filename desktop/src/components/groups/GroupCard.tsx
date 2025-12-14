import type { AudioDevice, DeviceGroup } from "../../types";
import DeviceRow from "../devices/DeviceRow";

interface GroupCardProps {
  group: DeviceGroup;
  devices: AudioDevice[];
  onEdit: () => void;
  onDelete: () => void;
  onCycle: () => void;
  onSelectDevice: (index: number) => void;
}

export default function GroupCard({ group, devices, onEdit, onDelete, onCycle, onSelectDevice }: GroupCardProps) {
  const groupDevices = group.device_ids
    .map((id) => devices.find((d) => d.id === id))
    .filter((d): d is AudioDevice => d !== undefined);

  return (
    <div className="bg-surface-850 rounded-2xl border border-surface-750 p-5 hover:bg-surface-800 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-medium text-surface-100">{group.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            {group.shortcut ? (
              <span className="px-2.5 py-1 bg-primary-500/15 text-primary-400 text-xs rounded-lg font-mono tracking-wide">
                {group.shortcut}
              </span>
            ) : (
              <span className="text-xs text-surface-500">No shortcut</span>
            )}
            <span className="text-xs text-surface-500">
              {groupDevices.length} device{groupDevices.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCycle}
            className="p-2 text-surface-400 hover:text-surface-100 hover:bg-surface-700 rounded-lg transition-all duration-200"
            title="Cycle to next device"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-surface-400 hover:text-surface-100 hover:bg-surface-700 rounded-lg transition-all duration-200"
            title="Edit group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-all duration-200"
            title="Delete group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Devices in group */}
      <div className="space-y-2">
        {groupDevices.map((device, index) => (
          <DeviceRow
            key={device.id}
            device={device}
            isActive={index === group.current_index}
            onClick={() => onSelectDevice(index)}
            compact
          />
        ))}
      </div>
    </div>
  );
}
