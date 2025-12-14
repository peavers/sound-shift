mod audio;
mod commands;
mod state;

use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, RunEvent, WindowEvent,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_store::StoreExt;

use state::{AppSettings, AppState, DeviceGroup};

// Store the device listener handle to keep it alive
static DEVICE_LISTENER: std::sync::OnceLock<audio::DeviceListenerHandle> = std::sync::OnceLock::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        // Get online devices first
                        let online_devices = audio::get_audio_devices().unwrap_or_default();
                        let online_ids: Vec<&str> = online_devices.iter().map(|d| d.id.as_str()).collect();

                        let state = app.state::<Mutex<AppState>>();
                        let mut state = state.lock().unwrap();

                        // Find group with this shortcut and cycle
                        // Compare by parsing stored shortcut string to handle format differences
                        if let Some(group) = state.groups.iter_mut().find(|g| {
                            g.shortcut.as_ref().map_or(false, |stored| {
                                stored
                                    .parse::<Shortcut>()
                                    .map_or(false, |parsed| parsed == *shortcut)
                            })
                        }) {
                            if !group.devices.is_empty() {
                                // Find online devices in this group
                                let online_indices: Vec<usize> = group
                                    .devices
                                    .iter()
                                    .enumerate()
                                    .filter(|(_, d)| online_ids.contains(&d.id.as_str()))
                                    .map(|(i, _)| i)
                                    .collect();

                                if online_indices.is_empty() {
                                    return; // No online devices
                                }

                                // Find current position in online devices and cycle to next
                                let current_online_pos = online_indices
                                    .iter()
                                    .position(|&i| i == group.current_index)
                                    .unwrap_or(0);
                                let next_online_pos = (current_online_pos + 1) % online_indices.len();
                                group.current_index = online_indices[next_online_pos];

                                let device = group.devices[group.current_index].clone();

                                // Set as default
                                if let Err(e) = audio::set_default_device(&device.id) {
                                    eprintln!("Failed to set device: {}", e);
                                } else {
                                    // Show notification
                                    let _ = app.notification()
                                        .builder()
                                        .title("SoundShift")
                                        .body(format!("Switched to {}", &device.name))
                                        .show();

                                    // Emit event to notify frontend
                                    let _ = app.emit("device-switched", ());
                                }
                            }
                        }
                    }
                })
                .build(),
        )
        .manage(Mutex::new(AppState::default()))
        .setup(|app| {
            // Load state from store
            let store = app.store("config.json")?;

            // Load groups
            if let Some(groups_value) = store.get("groups") {
                if let Ok(groups) = serde_json::from_value::<Vec<DeviceGroup>>(groups_value.clone())
                {
                    let state = app.state::<Mutex<AppState>>();
                    let mut state = state.lock().unwrap();
                    state.groups = groups;

                    // Register shortcuts for all groups
                    for group in &state.groups {
                        if let Some(ref shortcut) = group.shortcut {
                            if let Err(e) = app.global_shortcut().register(shortcut.as_str()) {
                                eprintln!("Failed to register shortcut {}: {}", shortcut, e);
                            }
                        }
                    }
                }
            }

            // Load settings
            if let Some(settings_value) = store.get("settings") {
                if let Ok(settings) =
                    serde_json::from_value::<AppSettings>(settings_value.clone())
                {
                    let state = app.state::<Mutex<AppState>>();
                    let mut state = state.lock().unwrap();
                    state.settings = settings;
                }
            }

            // Set up system tray
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false);

            // Use default window icon if available, otherwise tray will use system default
            let tray_builder = if let Some(icon) = app.default_window_icon() {
                tray_builder.icon(icon.clone())
            } else {
                tray_builder
            };

            let _tray = tray_builder
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Check start minimized setting - hide window if user wants to start minimized
            let state = app.state::<Mutex<AppState>>();
            let start_minimized = {
                let state = state.lock().unwrap();
                state.settings.start_minimized
            };

            if start_minimized {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            // Start device change listener
            let app_handle = app.handle().clone();
            if let Ok(listener) = audio::start_device_listener(move || {
                // Emit event to frontend when devices change
                let _ = app_handle.emit("devices-changed", ());
            }) {
                let _ = DEVICE_LISTENER.set(listener);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_audio_devices,
            commands::set_default_device,
            commands::get_groups,
            commands::create_group,
            commands::update_group,
            commands::delete_group,
            commands::cycle_group,
            commands::select_group_device,
            commands::get_settings,
            commands::update_settings,
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                let state = app.state::<Mutex<AppState>>();
                let close_to_tray = {
                    let state = state.lock().unwrap();
                    state.settings.close_to_tray
                };

                if close_to_tray {
                    // Prevent close and hide to tray instead
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let RunEvent::ExitRequested { .. } = event {
                // Save state before exiting
                let state = app_handle.state::<Mutex<AppState>>();
                let state = state.lock().unwrap();

                if let Ok(store) = app_handle.store("config.json") {
                    let _ = store.set("groups", serde_json::to_value(&state.groups).unwrap());
                    let _ = store.set("settings", serde_json::to_value(&state.settings).unwrap());
                    let _ = store.save();
                }
            }
        });
}
