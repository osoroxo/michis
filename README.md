# Michi Rally (Tauri + Rust + React + Vite + three.js)

## Requisitos
- Node 20+ y **Rust** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`) + Xcode Command Line Tools en macOS.

## Uso
- `npm install`
- `npm run dev` — solo web, en http://localhost:1420 (el perfil se guarda en localStorage)
- `npm run app` — app de escritorio Tauri (el perfil se guarda en disco desde Rust)
- `npm run app:build` — instalable

## Estructura (src/game)
- `config/` tuning, razas (`breeds.ts`), objetos arrojadizos (`throwables.ts`)
- `entities/cat/parts/` torso, cabeza, orejas, patas, cola, collar: rediseña cada pieza por separado
- `entities/ThrowableMesh.ts` malla de cada objeto
- `maps/index.ts` registro de mapas (añadir uno = crear su `build…()` y listarlo); `maps/common.ts` utilidades (croquetas en ruta, barandas)
- `maps/parque/`, `maps/museo/`, `maps/torre/` (casa de 4 pisos) y `maps/casa/` (2 pisos), una habitación por archivo (`sala` con gimnasio de gatos, `cocina`, `estudio`, `lavanderia`, `upstairs`), `shell.ts` (muros, losa, escaleras, barandillas), `furniture.ts` (estantes, mesas, camas), `track.ts` (ruta de carrera), `spawns.ts`
- `modes/` `RaceMode` y `BattleMode`; `systems/` movimiento, combate, proyectiles, pickups, IA, cámara, entrada
- `src/ui/` pantallas, HUD y componentes React; `src-tauri/src/lib.rs` comandos Rust (perfil, salir)
