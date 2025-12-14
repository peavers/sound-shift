import { useEffect, useState, useCallback } from "react";

interface ShortcutRecorderProps {
  value: string | null;
  onChange: (shortcut: string | null) => void;
}

// Map key codes to readable names
const keyCodeToName: Record<string, string> = {
  KeyA: "A", KeyB: "B", KeyC: "C", KeyD: "D", KeyE: "E", KeyF: "F", KeyG: "G",
  KeyH: "H", KeyI: "I", KeyJ: "J", KeyK: "K", KeyL: "L", KeyM: "M", KeyN: "N",
  KeyO: "O", KeyP: "P", KeyQ: "Q", KeyR: "R", KeyS: "S", KeyT: "T", KeyU: "U",
  KeyV: "V", KeyW: "W", KeyX: "X", KeyY: "Y", KeyZ: "Z",
  Digit0: "0", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4",
  Digit5: "5", Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9",
  F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6",
  F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12",
  F13: "F13", F14: "F14", F15: "F15", F16: "F16", F17: "F17", F18: "F18",
  F19: "F19", F20: "F20", F21: "F21", F22: "F22", F23: "F23", F24: "F24",
  Escape: "Esc", Tab: "Tab", Space: "Space", Enter: "Enter", Backspace: "Backspace",
  Delete: "Delete", Insert: "Insert", Home: "Home", End: "End",
  PageUp: "PageUp", PageDown: "PageDown",
  ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
  Numpad0: "Num0", Numpad1: "Num1", Numpad2: "Num2", Numpad3: "Num3", Numpad4: "Num4",
  Numpad5: "Num5", Numpad6: "Num6", Numpad7: "Num7", Numpad8: "Num8", Numpad9: "Num9",
  NumpadAdd: "Num+", NumpadSubtract: "Num-", NumpadMultiply: "Num*", NumpadDivide: "Num/",
  NumpadEnter: "NumEnter", NumpadDecimal: "Num.",
  BracketLeft: "[", BracketRight: "]", Backslash: "\\", Semicolon: ";",
  Quote: "'", Comma: ",", Period: ".", Slash: "/", Minus: "-", Equal: "=",
  Backquote: "`",
};

export default function ShortcutRecorder({ value, onChange }: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ignore modifier-only keys
    if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      return;
    }

    const modifiers: string[] = [];
    if (e.ctrlKey) modifiers.push("Ctrl");
    if (e.altKey) modifiers.push("Alt");
    if (e.shiftKey) modifiers.push("Shift");
    if (e.metaKey) modifiers.push("Super");

    // Get the key name
    const keyName = keyCodeToName[e.code] || e.code;

    // Build the shortcut string
    const shortcut = [...modifiers, keyName].join("+");

    onChange(shortcut);
    setIsRecording(false);
  }, [onChange]);

  useEffect(() => {
    if (isRecording) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isRecording, handleKeyDown]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          isRecording
            ? "bg-primary-500/10 border-primary-500 animate-pulse-subtle"
            : "bg-surface-800 border-surface-700"
        }`}
      >
        {isRecording ? (
          <span className="text-primary-400 text-sm">Press any key combination...</span>
        ) : value ? (
          <span className="font-mono text-sm text-surface-100">{value}</span>
        ) : (
          <span className="text-surface-500 text-sm">No shortcut set</span>
        )}
      </div>

      {isRecording ? (
        <button
          type="button"
          onClick={() => setIsRecording(false)}
          className="px-4 py-2.5 bg-surface-750 hover:bg-surface-700 rounded-xl transition-all duration-200 text-sm text-surface-300"
        >
          Cancel
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsRecording(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all duration-200 text-sm font-medium text-white"
          >
            Record
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2 text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-all duration-200"
              title="Clear shortcut"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
