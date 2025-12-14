# SoundShift Desktop App

The Tauri-based desktop application for SoundShift.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)
- npm or pnpm

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

The installer will be generated in `src-tauri/target/release/bundle/`.

## Screenshots

### Device Groups
Create groups of audio devices and assign keyboard shortcuts for instant switching.

![Groups Page](../screenshots/groups-page.png)

### Audio Devices
View all available audio devices and quickly switch between them.

![Devices Page](../screenshots/devices-page.png)

### Settings
Configure startup behavior, auto-updates, and other preferences.

![Settings Page](../screenshots/settings-page.png)

## Usage

### Creating a Device Group

1. Open SoundShift from the system tray
2. Go to **Groups** and click **New Group**
3. Name your group (e.g., "Gaming", "Music")
4. Select the audio devices you want to include
5. Arrange the cycle order by dragging
6. Optionally assign a keyboard shortcut
7. Click **Create**

### Switching Devices

- **Via Keyboard**: Press your assigned shortcut to cycle through devices
- **Via UI**: Click any device in a group to switch to it
- **Via Devices Page**: Click **Switch** on any device

### Settings

- **Run on startup** - Launch SoundShift when Windows starts
- **Start minimized** - Start in system tray instead of showing window
- **Auto-update** - Automatically check for and install updates

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Rust, Tauri v2
- **Audio API**: Windows Core Audio (IPolicyConfig)

## Project Structure

```
desktop/
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── pages/           # Page components
│   └── types/           # TypeScript types
├── src-tauri/           # Rust backend
│   ├── src/             # Rust source code
│   ├── icons/           # App icons
│   └── tauri.conf.json  # Tauri configuration
└── package.json
```
