# Juliu's Special 5 — Cambios para funcionar offline

Versión corregida el 19 de noviembre de 2026, a partir del repo público
`mercurio123-hash/Recordati05`.

## Qué problema resolvía

La app funcionaba en casa con wifi, pero en la calle con datos móviles
se quedaba en blanco con un error tipo `ERR_CONNECTION`: la página
tenía que descargarse de GitHub Pages en cada visita, y no tenía
nada guardado en el celular. Después de este cambio, la primera
visita se hace con wifi y la app queda instalada en el celular;
después abre sin GitHub Pages y sin datos móviles.

## Archivos listos para subir

Sube estos 6 archivos a la **raíz** del repo (los 2 primeros ya
existían, los otros 4 son nuevos o modificados):

| Archivo | Qué es |
|---|---|
| `index.html` | App, modificada (ver abajo) |
| `icon-512.png` | Icono 512x512, sin cambios |
| `icon-j5.png` | Icono 512x512, sin cambios |
| `success.mp3` | **Nuevo.** El sonido de éxito, ahora local (antes se descargaba de Mixkit) |
| `manifest.json` | **Nuevo.** Datos para instalar la app en el celular |
| `sw.js` | **Nuevo.** Service Worker con caché offline |

No subas la carpeta `.git` ni este archivo `CAMBIOS.md` si no quieres;
no son parte de la app.

## Qué cambió

### 1. Sonido local (`index.html` + `success.mp3`)
- El único recurso externo era el audio de éxito de Mixkit:
  `https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3`
- Se descargó ese mismo archivo (64.409 bytes, MPEG) como
  `success.mp3` en la raíz y el `<audio id="audioSuccess">`
  ahora apunta a `success.mp3`.
- La etiqueta también se cerró correctamente (`</audio>`).
- El sonido sigue sonando solo cuando una tarea llega a 100%.

### 2. Manifiesto para instalar (`manifest.json` + `index.html`)
- Nuevo `manifest.json`: nombre `Juliu's Special 5 - Smart Sort`,
  nombre corto `Juliu's Special 5`, `start_url: ./index.html`,
  `display: standalone`, `theme_color: #2c3e50`,
  iconos `icon-512.png` e `icon-j5.png` (ambos de 512x512).
- En `index.html` se añadió `<link rel="manifest" href="manifest.json">`.
- Con esto Chrome en Android ofrece "Añadir a la pantalla de inicio"
  / "Instalar app" y la app abre a pantalla completa, como una app
  normal.

### 3. Caché offline real (`sw.js`)
- Nuevo `sw.js`, caché `juliu-special-5-v1`.
- En `install` guarda en caché: `./`, `index.html`, `manifest.json`,
  `icon-512.png`, `icon-j5.png` y `success.mp3`.
- En `fetch` usa estrategia **cache-first**: si el archivo está en
  caché, lo sirve desde ahí sin internet; si no está, intenta la
  red y guarda la respuesta (solo peticiones GET del mismo origen).
  Si no hay red ni caché y se pide la página, sirve `index.html`.
- En `activate` borra las cachés de versiones anteriores.

### 4. Registro del Service Worker (`index.html`)
- Se añadió un registro seguro al final de la página:
  `navigator.serviceWorker.register('./sw.js')` al cargar la página,
  dentro de `if ('serviceWorker' in navigator)` y con `.catch()`.
- Si el registro falla (por ejemplo, al abrir el archivo con
  `file://`), la app sigue funcionando normal; solo se pierde
  la caché offline.

## Qué NO cambió

La interfaz, los textos en español y todas las funciones son
exactamente las mismas:

- Prioridades 1-2-3 (rojo crítico, naranja media, verde baja),
  ordenadas con las críticas arriba.
- Agregar tarea, avance 0 / 25 / 50 / 75 / 100%, barra de color.
- Al llegar a 100% la tarea baja a "Completadas", se tacha y suena
  el sonido.
- Editar (✎) y eliminar (×) tareas, con confirmación.
- Pestañas con el botón verde "+ Nueva", contador rojo de
  pendientes, y eliminar pestaña.
- Modo claro/oscuro (🌓), fecha y hora, aviso de la mañana
  con las tareas pendientes.
- Los datos se siguen guardando solo en el celular, en
  `localStorage` (`js5_smart_save`, `js5_last_notif`). Subir
  estos archivos no borra tus tareas: están ligadas al dominio
  `mercurio123-hash.github.io`, no a los archivos en sí.

## Cómo subirlo a GitHub (desde la web, sin terminal)

1. Entra al repo: https://github.com/mercurio123-hash/Recordati05
2. Haz clic en **Add file > Upload files**.
3. Arrastra o selecciona estos 6 archivos de la carpeta
   `offline-fix/recordati05/`: `index.html`, `manifest.json`,
   `sw.js`, `success.mp3`, `icon-512.png`, `icon-j5.png`.
   Si GitHub pregunta, elige reemplazar los archivos existentes
   (`index.html`, `icon-512.png`, `icon-j5.png`).
4. Escribe un mensaje de commit, por ejemplo:
   `App offline: audio local, manifest y service worker`
5. Pulsa **Commit changes**.
6. Espera 1 o 2 minutos a que GitHub Pages publique la nueva
   versión en https://mercurio123-hash.github.io/Recordati05/

Alternativa con git (si prefieres terminal, desde esta carpeta):
```bash
git add index.html manifest.json sw.js success.mp3 icon-512.png icon-j5.png
git commit -m "App offline: audio local, manifest y service worker"
git push origin main
```

## Cómo probarlo en el celular

1. **Con wifi**, abre en Chrome (Android):
   https://mercurio123-hash.github.io/Recordati05/
   Espera a que cargue y recarga una vez, para que el Service
   Worker se instale y guarde todo en caché.
2. En el menú de Chrome (⋮) toca **"Añadir a la pantalla de
   inicio"** o **"Instalar app"**. Verás el icono en tu pantalla
   principal.
3. **Activa el modo avión** (sin wifi y sin datos).
4. Abre la app desde su icono en la pantalla de inicio.
   Debe abrir completa, sin error.
5. Prueba sin internet: agrega una tarea, cambia su avance
   a 100% (debe sonar el audio y tacharse), cambia de pestaña
   y activa el modo oscuro. Cierra la app y vuelve a abrirla
   en modo avión: tus tareas deben seguir ahí.
6. Desactiva el modo avión. Todo sigue igual, solo que ahora
   ya no necesitas conexión para abrirla.

## Si ves la versión vieja

- Cierra la app por completo y vuelve a abrirla con wifi;
  el Service Worker se actualiza solo en la siguiente visita.
- Si sigue apareciendo la vieja, en Chrome mantén pulsado el
  icono de la app > **Información de la app > Almacenamiento >
  Borrar caché** (no borres los datos, solo la caché), o
  desinstala el acceso directo y vuelve a añadirlo con wifi.
- Ojo: si pruebas la app en otra dirección (por ejemplo, en
  local o en otro dominio), las tareas no se verán: el
  `localStorage` es distinto por cada dominio.

## Pruebas hechas en esta corrección

- `index.html` ya no referencia ningún dominio externo
  (sin Mixkit, sin CDN, sin fuentes externas).
- `manifest.json` es JSON válido, con los nombres, colores
  e iconos correctos.
- `sw.js` pasa `node --check`; los 6 archivos de su lista de
  caché existen en la carpeta.
- Los dos bloques `<script>` de `index.html` pasan
  `node --check`; el cambio en `index.html` es de solo
  14 líneas añadidas y 1 modificada (diff revisado).
- Servida la carpeta con un servidor HTTP local, los 6 archivos
  responden 200: `index.html`, `manifest.json`, `sw.js`,
  `success.mp3` (audio/mpeg), `icon-512.png` e `icon-j5.png`.
- No se pudo probar el Service Worker en un navegador real
  desde este equipo; la prueba definitiva es el paso 4 de
  arriba, en el celular en modo avión.

## Nota sobre el DNS (prueba pendiente, en la calle)

El usuario también quiere probar si el problema original era
el DNS de los datos móviles. Cuando esté en la calle, con datos:

1. Abrir `google.com` — ¿carga?
2. Abrir `github.com` — ¿carga?
3. Abrir la app — anotar el error exacto
   (`ERR_CONNECTION_TIMED_OUT`, `RESET`, `NAME_NOT_RESOLVED`...).
4. Si Google carga y GitHub no, probar en Ajustes > DNS privado
   poner `dns.google` o `one.one.one.one`, y repetir.

Con esta versión offline, esa prueba ya no es urgente para usar
la app: una vez instalada, el DNS de los datos ya no importa.
