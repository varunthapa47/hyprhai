// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[tauri::command]
fn get_wallpapers() -> Result<Vec<String>, String> {
    let mut path = dirs::picture_dir().ok_or("Could not find Pictures directory")?;
    path.push("wallpapers");

    if !path.exists() {
        return Err("Wallpapers directory not found".into());
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(&path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let p: PathBuf = entry.path();

        if let Some(ext) = p.extension().and_then(|e| e.to_str()) {
            match ext.to_lowercase().as_str() {
                "jpg" | "jpeg" | "png" | "webp" => {
                    if let Some(file_str) = p.to_str() {
                        files.push(file_str.to_string());
                    }
                }
                _ => {}
            }
        }
    }

    Ok(files)
}

#[tauri::command]
fn set_wallpaper(path: String) -> Result<(), String> {
    // First, ensure swww is initialized
    let init_status = Command::new("swww")
        .arg("init")
        .status()
        .map_err(|e| format!("Failed to run swww init: {}", e))?;

    if !init_status.success() {
        println!("swww init might already be running, continuing...");
    }

    // Now, set wallpaper with smooth transition
    let status = Command::new("swww")
        .arg("img")
        .arg(&path) // wallpaper path from frontend
        // transition args
        .arg("--transition-type")
        .arg("any") // could be fade, wipe, grow, etc
        .arg("--transition-step")
        .arg("90") // smoothness
        .arg("--transition-duration")
        .arg("2") // seconds
        .status()
        .map_err(|e| format!("Failed to run swww img: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err("swww failed to set wallpaper".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_wallpapers, set_wallpaper])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
