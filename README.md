# SoundShift

<p align="center">
  <img src="desktop/src-tauri/icons/icon.png" alt="SoundShift Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Quick audio device switching with keyboard shortcuts</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows-blue" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/built%20with-Tauri-orange" alt="Built with Tauri">
</p>

---

## Overview

SoundShift is a Windows desktop application that lets you quickly switch between audio output devices using keyboard shortcuts. Create groups of devices (e.g., "Gaming", "Music Production") and cycle through them instantly.

![SoundShift Screenshot](screenshots/groups-page.png)

## Download

Download the latest installer from the [Releases](https://github.com/yourusername/soundshift/releases) page.

## Features

- **Device Groups** - Organize audio devices into switchable groups
- **Keyboard Shortcuts** - Global hotkeys for instant switching
- **System Tray** - Runs quietly in the background
- **Notifications** - Visual feedback when switching
- **Auto-start** - Launch on Windows startup
- **Minimal UI** - Clean, warm design

## Project Structure

```
soundshift/
├── desktop/     # Tauri desktop application
├── website/     # Landing page website
└── screenshots/ # Shared app screenshots
```

## Development

### Desktop App

```bash
cd desktop
npm install
npm run tauri dev
```

See [desktop/README.md](desktop/README.md) for detailed development instructions.

### Website

```bash
cd website
npm install
npm run dev
```

## Tech Stack

- **Desktop**: React, TypeScript, Tailwind CSS, Tauri v2, Rust
- **Website**: React, TypeScript, Tailwind CSS, Vite

## License

MIT License - see [LICENSE](LICENSE) for details.
