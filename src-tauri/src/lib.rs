use std::{fs, path::PathBuf};
use tauri::Manager;

/// Ruta del perfil del jugador (gato, ajustes y récords) en la carpeta de datos de la app.
fn profile_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("profile.json"))
}

/// Devuelve el JSON del perfil, o `None` si todavía no existe.
#[tauri::command]
fn load_profile(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = profile_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(path).map(Some).map_err(|e| e.to_string())
}

/// Guarda el perfil. Valida que sea JSON y escribe de forma atómica (archivo temporal + rename).
#[tauri::command]
fn save_profile(app: tauri::AppHandle, json: String) -> Result<(), String> {
    serde_json::from_str::<serde_json::Value>(&json).map_err(|e| format!("perfil inválido: {e}"))?;
    let path = profile_path(&app)?;
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, json).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())
}

#[tauri::command]
fn quit_game(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_profile, save_profile, quit_game])
        .run(tauri::generate_context!())
        .expect("error al iniciar Michi Rally");
}
