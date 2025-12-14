#[cfg(windows)]
mod windows_audio {
    use crate::state::AudioDevice;
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use windows::core::{GUID, HRESULT, PCWSTR};
    use windows::Win32::Devices::FunctionDiscovery::PKEY_Device_FriendlyName;
    use windows::Win32::Media::Audio::{
        eConsole, eCommunications, eMultimedia, eRender, IMMDevice, IMMDeviceCollection,
        IMMDeviceEnumerator, MMDeviceEnumerator, DEVICE_STATE_ACTIVE,
    };
    use windows::Win32::System::Com::StructuredStorage::PropVariantToStringAlloc;
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_ALL, COINIT_MULTITHREADED,
        STGM_READ,
    };

    // IPolicyConfig COM interface GUIDs
    const CLSID_POLICY_CONFIG_CLIENT: GUID = GUID::from_u128(0x870af99c_171d_4f9e_af0d_e63df40c2bc9);
    const IID_IPOLICY_CONFIG: GUID = GUID::from_u128(0xf8679f50_850a_41cf_9c72_430f290290c8);

    // IPolicyConfig vtable layout
    #[repr(C)]
    struct IPolicyConfigVtbl {
        // IUnknown
        query_interface: unsafe extern "system" fn(*mut IPolicyConfigRaw, *const GUID, *mut *mut std::ffi::c_void) -> HRESULT,
        add_ref: unsafe extern "system" fn(*mut IPolicyConfigRaw) -> u32,
        release: unsafe extern "system" fn(*mut IPolicyConfigRaw) -> u32,
        // IPolicyConfig methods (we only need SetDefaultEndpoint)
        get_mix_format: *const std::ffi::c_void,
        get_device_format: *const std::ffi::c_void,
        reset_device_format: *const std::ffi::c_void,
        set_device_format: *const std::ffi::c_void,
        get_processing_period: *const std::ffi::c_void,
        set_processing_period: *const std::ffi::c_void,
        get_share_mode: *const std::ffi::c_void,
        set_share_mode: *const std::ffi::c_void,
        get_property_value: *const std::ffi::c_void,
        set_property_value: *const std::ffi::c_void,
        set_default_endpoint: unsafe extern "system" fn(*mut IPolicyConfigRaw, PCWSTR, u32) -> HRESULT,
        set_endpoint_visibility: *const std::ffi::c_void,
    }

    #[repr(C)]
    struct IPolicyConfigRaw {
        vtbl: *const IPolicyConfigVtbl,
    }

    pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
        unsafe {
            // Initialize COM
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

            let result = get_audio_devices_internal();

            CoUninitialize();

            result
        }
    }

    unsafe fn get_audio_devices_internal() -> Result<Vec<AudioDevice>, String> {
        // Create device enumerator
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)
                .map_err(|e| format!("Failed to create device enumerator: {}", e))?;

        // Get default device ID for comparison
        let default_id = match enumerator.GetDefaultAudioEndpoint(eRender, eConsole) {
            Ok(default_device) => {
                match default_device.GetId() {
                    Ok(id_pwstr) => pwstr_to_string(id_pwstr.0),
                    Err(_) => String::new(),
                }
            }
            Err(_) => String::new(),
        };

        // Get all render devices
        let collection: IMMDeviceCollection = enumerator
            .EnumAudioEndpoints(eRender, DEVICE_STATE_ACTIVE)
            .map_err(|e| format!("Failed to enumerate devices: {}", e))?;

        let count = collection
            .GetCount()
            .map_err(|e| format!("Failed to get device count: {}", e))?;

        let mut devices = Vec::new();

        for i in 0..count {
            let device: IMMDevice = match collection.Item(i) {
                Ok(d) => d,
                Err(_) => continue,
            };

            let id_pwstr = match device.GetId() {
                Ok(id) => id,
                Err(_) => continue,
            };

            let id = pwstr_to_string(id_pwstr.0);

            // Get friendly name from property store
            let name = match device.OpenPropertyStore(STGM_READ) {
                Ok(prop_store) => {
                    match prop_store.GetValue(&PKEY_Device_FriendlyName) {
                        Ok(name_prop) => {
                            match PropVariantToStringAlloc(&name_prop) {
                                Ok(name_pwstr) => pwstr_to_string(name_pwstr.0),
                                Err(_) => format!("Device {}", i),
                            }
                        }
                        Err(_) => format!("Device {}", i),
                    }
                }
                Err(_) => format!("Device {}", i),
            };

            devices.push(AudioDevice {
                id: id.clone(),
                name,
                is_default: id == default_id,
            });
        }

        Ok(devices)
    }

    pub fn set_default_device(device_id: &str) -> Result<(), String> {
        unsafe {
            // Initialize COM
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

            let result = set_default_device_internal(device_id);

            CoUninitialize();

            result
        }
    }

    unsafe fn set_default_device_internal(device_id: &str) -> Result<(), String> {
        // Create PolicyConfig instance using raw COM via CoCreateInstance
        // CoCreateInstance in windows-rs 0.58+ returns the interface directly
        // We need to use the lower-level function that accepts a raw pointer

        let mut policy_config: *mut IPolicyConfigRaw = std::ptr::null_mut();

        // Use the raw COM CoCreateInstance from ole32
        #[link(name = "ole32")]
        extern "system" {
            fn CoCreateInstance(
                rclsid: *const GUID,
                pUnkOuter: *const std::ffi::c_void,
                dwClsContext: u32,
                riid: *const GUID,
                ppv: *mut *mut std::ffi::c_void,
            ) -> HRESULT;
        }

        let hr = CoCreateInstance(
            &CLSID_POLICY_CONFIG_CLIENT,
            std::ptr::null(),
            CLSCTX_ALL.0,
            &IID_IPOLICY_CONFIG,
            &mut policy_config as *mut *mut IPolicyConfigRaw as *mut *mut std::ffi::c_void,
        );

        if hr.is_err() {
            return Err(format!("Failed to create PolicyConfig: {:?}", hr));
        }

        if policy_config.is_null() {
            return Err("PolicyConfig is null".to_string());
        }

        // Convert device_id to wide string
        let device_id_wide: Vec<u16> = device_id.encode_utf16().chain(std::iter::once(0)).collect();
        let pcwstr = PCWSTR(device_id_wide.as_ptr());

        // Set default for all roles
        let vtbl = &*(*policy_config).vtbl;

        let hr = (vtbl.set_default_endpoint)(policy_config, pcwstr, eConsole.0 as u32);
        if hr.is_err() {
            (vtbl.release)(policy_config);
            return Err(format!("Failed to set console endpoint: {:?}", hr));
        }

        let hr = (vtbl.set_default_endpoint)(policy_config, pcwstr, eMultimedia.0 as u32);
        if hr.is_err() {
            (vtbl.release)(policy_config);
            return Err(format!("Failed to set multimedia endpoint: {:?}", hr));
        }

        let hr = (vtbl.set_default_endpoint)(policy_config, pcwstr, eCommunications.0 as u32);
        if hr.is_err() {
            (vtbl.release)(policy_config);
            return Err(format!("Failed to set communications endpoint: {:?}", hr));
        }

        // Release the COM object
        (vtbl.release)(policy_config);

        Ok(())
    }

    fn pwstr_to_string(ptr: *const u16) -> String {
        if ptr.is_null() {
            return String::new();
        }

        unsafe {
            let mut len = 0;
            while *ptr.add(len) != 0 {
                len += 1;
            }
            let slice = std::slice::from_raw_parts(ptr, len);
            OsString::from_wide(slice).to_string_lossy().into_owned()
        }
    }
}

#[cfg(windows)]
pub use windows_audio::*;

#[cfg(not(windows))]
pub fn get_audio_devices() -> Result<Vec<crate::state::AudioDevice>, String> {
    Err("Audio device enumeration is only supported on Windows".to_string())
}

#[cfg(not(windows))]
pub fn set_default_device(_device_id: &str) -> Result<(), String> {
    Err("Setting default audio device is only supported on Windows".to_string())
}
