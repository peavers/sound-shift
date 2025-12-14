import type { AudioDevice } from "../../types";

interface DeviceRowProps {
  device: AudioDevice;
  isActive: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function DeviceRow({ device, isActive, onClick, compact = false }: DeviceRowProps) {
  const isClickable = onClick && !isActive;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`w-full flex items-center gap-3 rounded-xl text-left transition-all duration-200 ${
        compact ? "p-3" : "p-4"
      } ${
        isActive
          ? "bg-surface-750 border border-primary-500/30"
          : isClickable
          ? "bg-surface-800/50 hover:bg-surface-750 cursor-pointer border border-transparent"
          : "bg-surface-800/50 border border-transparent"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-lg ${
          compact ? "w-8 h-8" : "w-10 h-10"
        } ${
          isActive
            ? "bg-primary-500/20 text-primary-400"
            : "bg-surface-700 text-surface-500"
        }`}
      >
        <svg
          className={compact ? "w-4 h-4" : "w-5 h-5"}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      </div>
      <span
        className={`flex-1 truncate ${compact ? "text-sm" : "text-sm font-medium"} ${
          isActive ? "text-surface-100" : "text-surface-300"
        }`}
      >
        {device.name}
      </span>
      {isActive && (
        <span className="text-xs text-primary-400 font-medium">Active</span>
      )}
    </button>
  );
}
