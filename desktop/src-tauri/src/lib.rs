mod audio;
mod commands;
mod state;

use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, RunEvent,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_store::StoreExt;

use state::{AppSettings, AppState, DeviceGroup};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
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
                        let shortcut_str = format!("{}", shortcut);
                        let state = app.state::<Mutex<AppState>>();
                        let mut state = state.lock().unwrap();

                        // Find group with this shortcut and cycle
                        if let Some(group) = state
                            .groups
                            .iter_mut()
                            .find(|g| g.shortcut.as_ref() == Some(&shortcut_str))
                        {
                            if !group.device_ids.is_empty() {
                                // Cycle to next device
                                group.current_index =
                                    (group.current_index + 1) % group.device_ids.len();
                                let device_id = group.device_ids[group.current_index].clone();

                                // Set as default
                                if let Err(e) = audio::set_default_device(&device_id) {
                                    eprintln!("Failed to set device: {}", e);
                                } else {
                                    // Get device name and show notification
                                    if let Ok(devices) = audio::get_audio_devices() {
                                        if let Some(device) = devices.iter().find(|d| d.id == device_id) {
                                            let _ = app.notification()
                                                .builder()
                                                .title("Audio Device Switched")
                                                .body(&device.name)
                                                .show();
                                        }
                                    }

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
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                // Save state before exiting
                let state = app_handle.state::<Mutex<AppState>>();
                let state = state.lock().unwrap();

                if let Ok(store) = app_handle.store("config.json") {
                    let _ = store.set("groups", serde_json::to_value(&state.groups).unwrap());
                    let _ = store.set("settings", serde_json::to_value(&state.settings).unwrap());
                    let _ = store.save();
                }

                // Prevent exit, minimize to tray instead
                if state.settings.start_minimized {
                    api.prevent_exit();
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
            }
        });
}
