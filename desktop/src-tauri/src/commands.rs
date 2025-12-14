use std::sync::Mutex;
use tauri::State;
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

use tauri_plugin_notification::NotificationExt;

use crate::audio;
use crate::state::{AppSettings, AppState, AudioDevice, DeviceGroup};

#[tauri::command]
pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    audio::get_audio_devices()
}

#[tauri::command]
pub fn set_default_device(device_id: String) -> Result<(), String> {
    audio::set_default_device(&device_id)
}

#[tauri::command]
pub fn get_groups(state: State<'_, Mutex<AppState>>) -> Vec<DeviceGroup> {
    let state = state.lock().unwrap();
    state.groups.clone()
}

#[tauri::command]
pub fn create_group(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
    name: String,
    device_ids: Vec<String>,
    shortcut: Option<String>,
) -> Result<DeviceGroup, String> {
    let group = DeviceGroup {
        id: Uuid::new_v4().to_string(),
        name,
        device_ids,
        shortcut: shortcut.clone(),
        current_index: 0,
    };

    // Register shortcut if provided
    if let Some(ref sc) = shortcut {
        app.global_shortcut()
            .register(sc.as_str())
            .map_err(|e| format!("Failed to register shortcut: {}", e))?;
    }

    // Add to state
    {
        let mut state = state.lock().unwrap();
        state.groups.push(group.clone());
    }

    // Save to store
    save_groups(&app, &state)?;

    Ok(group)
}

#[tauri::command]
pub fn update_group(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
    group: DeviceGroup,
) -> Result<(), String> {
    let mut state_guard = state.lock().unwrap();

    // Find the existing group
    let existing_group = state_guard
        .groups
        .iter()
        .find(|g| g.id == group.id)
        .cloned();

    if let Some(existing) = existing_group {
        // Unregister old shortcut if it changed
        if existing.shortcut != group.shortcut {
            if let Some(ref old_shortcut) = existing.shortcut {
                let _ = app.global_shortcut().unregister(old_shortcut.as_str());
            }

            // Register new shortcut
            if let Some(ref new_shortcut) = group.shortcut {
                app.global_shortcut()
                    .register(new_shortcut.as_str())
                    .map_err(|e| format!("Failed to register shortcut: {}", e))?;
            }
        }

        // Update the group
        if let Some(g) = state_guard.groups.iter_mut().find(|g| g.id == group.id) {
            *g = group;
        }
    } else {
        return Err("Group not found".to_string());
    }

    drop(state_guard);

    // Save to store
    save_groups(&app, &state)?;

    Ok(())
}

#[tauri::command]
pub fn delete_group(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
    group_id: String,
) -> Result<(), String> {
    let mut state_guard = state.lock().unwrap();

    // Find and remove the group
    if let Some(index) = state_guard.groups.iter().position(|g| g.id == group_id) {
        let group = state_guard.groups.remove(index);

        // Unregister shortcut
        if let Some(ref shortcut) = group.shortcut {
            let _ = app.global_shortcut().unregister(shortcut.as_str());
        }
    } else {
        return Err("Group not found".to_string());
    }

    drop(state_guard);

    // Save to store
    save_groups(&app, &state)?;

    Ok(())
}

#[tauri::command]
pub fn cycle_group(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
    group_id: String,
) -> Result<(), String> {
    let mut state_guard = state.lock().unwrap();

    let group = state_guard
        .groups
        .iter_mut()
        .find(|g| g.id == group_id)
        .ok_or("Group not found")?;

    if group.device_ids.is_empty() {
        return Err("Group has no devices".to_string());
    }

    // Cycle to next device
    group.current_index = (group.current_index + 1) % group.device_ids.len();
    let device_id = group.device_ids[group.current_index].clone();

    drop(state_guard);

    // Set as default device
    audio::set_default_device(&device_id)?;

    // Show notification with device name
    if let Ok(devices) = audio::get_audio_devices() {
        if let Some(device) = devices.iter().find(|d| d.id == device_id) {
            let _ = app.notification()
                .builder()
                .title("Audio Device Switched")
                .body(&device.name)
                .show();
        }
    }

    // Save to store
    save_groups(&app, &state)?;

    Ok(())
}

#[tauri::command]
pub fn select_group_device(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
    group_id: String,
    device_index: usize,
) -> Result<(), String> {
    let mut state_guard = state.lock().unwrap();

    let group = state_guard
        .groups
        .iter_mut()
        .find(|g| g.id == group_id)
        .ok_or("Group not found")?;

    if device_index >= group.device_ids.len() {
        return Err("Invalid device index".to_string());
    }

    // Set the selected device as current
    group.current_index = device_index;
    let device_id = group.device_ids[device_index].clone();

    drop(state_guard);

    // Set as default device
    audio::set_default_device(&device_id)?;

    // Show notification with device name
    if let Ok(devices) = audio::get_audio_devices() {
        if let Some(device) = devices.iter().find(|d| d.id == device_id) {
            let _ = app.notification()
                .builder()
                .title("Audio Device Switched")
                .body(&device.name)
                .show();
        }
    }

    // Save to store
    save_groups(&app, &state)?;

    Ok(())
}

#[tauri::command]
pub fn get_settings(state: State<'_, Mutex<AppState>>) -> AppSettings {
    let state = state.lock().unwrap();
    state.settings.clone()
}

#[tauri::command]
pub fn update_settings(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
    settings: AppSettings,
) -> Result<(), String> {
    {
        let mut state = state.lock().unwrap();
        state.settings = settings.clone();
    }

    // Save to store
    if let Ok(store) = app.store("config.json") {
        store
            .set("settings", serde_json::to_value(&settings).unwrap());
        let _ = store.save();
    }

    Ok(())
}

fn save_groups(
    app: &tauri::AppHandle,
    state: &State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    let groups = {
        let state = state.lock().unwrap();
        state.groups.clone()
    };

    if let Ok(store) = app.store("config.json") {
        store.set("groups", serde_json::to_value(&groups).unwrap());
        let _ = store.save();
    }

    Ok(())
}
