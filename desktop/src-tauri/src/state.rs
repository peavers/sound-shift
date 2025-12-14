use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceGroup {
    pub id: String,
    pub name: String,
    pub device_ids: Vec<String>,
    pub shortcut: Option<String>,
    pub current_index: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub run_on_startup: bool,
    pub start_minimized: bool,
    pub auto_update: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            run_on_startup: false,
            start_minimized: false,
            auto_update: true,
        }
    }
}

#[derive(Debug, Default)]
pub struct AppState {
    pub groups: Vec<DeviceGroup>,
    pub settings: AppSettings,
}
