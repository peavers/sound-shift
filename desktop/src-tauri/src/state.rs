use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

// Device reference stored in a group (persists even when device is offline)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupDevice {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceGroup {
    pub id: String,
    pub name: String,
    pub devices: Vec<GroupDevice>,
    pub shortcut: Option<String>,
    pub current_index: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub run_on_startup: bool,
    pub start_minimized: bool,
    pub close_to_tray: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            run_on_startup: false,
            start_minimized: false,
            close_to_tray: true,
        }
    }
}

#[derive(Debug, Default)]
pub struct AppState {
    pub groups: Vec<DeviceGroup>,
    pub settings: AppSettings,
}
