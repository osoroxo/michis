// Evita la ventana de consola extra en Windows (release).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    michi_rally_lib::run()
}
