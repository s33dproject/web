# s33d

Proyecto de arte generativo con [canvas-sketch](https://github.com/mattdesl/canvas-sketch). UI en React + Vite.

## Requisitos

- Node.js 18 o superior

## Instalación

```bash
npm install
```

## Uso

### Producción

Ejecuta el servidor que sirve la app y la API:

```bash
npm start
```

Se abrirá el navegador en `http://localhost:3000`. Rutas disponibles:

- **Home** — landing con animación
- **v0id** — animación de la landing a pantalla completa
- **Manifest** — texto conceptual del proyecto
- **Gallery** — galería de capturas
- **m3mory** — sección About (desde el home)

### Desarrollo (Vite + hot reload)

Para desarrollo con recarga en caliente:

```bash
npm run dev
```

- **Vite** en `http://localhost:5173` — UI React
- **API** en `http://localhost:3001` — proxy a canvas-sketch

En modo dev se habilitan además:

- **Sketches** — lista en dos secciones: **2019 seeds** (versiones propias) y **Originals** (versiones originales); búsqueda; clic en **Run** para ejecutar
- **Vista Run** — ejecución de sketches con controles

### Vista Run

Cuando ejecutas un sketch desde la lista (solo en dev):

- **Controles de parámetros** — sliders o inputs de texto según el sketch (ver `sketches-metadata.json`)
- **Regenerate** — genera una nueva variante (nuevo seed)
- **Reset** — restaura parámetros por defecto y regenera
- **Add to gallery** — captura el canvas actual como PNG en una galería local (descargar o descartar)

### Sketches individuales

Para ejecutar un sketch directamente desde la terminal:

```bash
npm run sketch sketch-src/nombre-del-sketch.js --open
```

O con el CLI directamente:

```bash
npx canvas-sketch sketch-src/random-circles.js --open
```

### Exportar arte

Cuando un sketch está corriendo en el navegador:

- **Cmd/Ctrl + S** — exportar frame como PNG
- **Cmd/Ctrl + Shift + S** — exportar secuencia de animación
- **Cmd/Ctrl + K** — exportar con hash de git en el nombre

## Estructura del proyecto

```
├── server.js              # Servidor Express (producción): app + API + proxy a canvas-sketch
├── server-local.js        # API local para desarrollo (puerto 3001)
├── vite.config.ts         # Vite + proxy a API
├── sketches-metadata.json # Parámetros por sketch (ver docs/sketches-metadata.md)
├── originals-metadata.json# Opcional: override tech/params para originals
├── index.html             # Entry HTML (Vite)
├── docs/                  # Documentación del proyecto
├── src/                   # App React (TypeScript)
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/        # Layout, Nav, Footer, LandingBg, etc.
│   └── pages/             # Landing, Manifest, Gallery, Void, Sketches, Run
├── sketch-src/            # Sketches (canvas-sketch)
│   ├── s33d-params.js     # Helper para params en tiempo de ejecución
│   ├── *.js               # Sketches individuales
│   ├── planets/           # Sketch en subcarpeta
│   └── html-canvas/       # Sketches HTML/Canvas independientes
├── public/                # Assets estáticos (fonts, images, gallery-data.json)
└── assets/
    └── images/            # Imágenes para sketches (ver assets/images/README.md)
```

## Parámetros de sketches

Los parámetros se definen en `sketches-metadata.json`. Cada sketch puede tener un array `params` con:

- **Slider**: `{ "key": "opacity", "label": "Opacity", "min": 0.5, "max": 1, "step": 0.05, "value": 0.85 }`
- **Texto**: `{ "key": "character", "label": "Character", "type": "text", "value": "¨", "placeholder": "¨ § · …" }`

Ver `docs/sketches-metadata.md` para el esquema completo.

## Assets

Algunos sketches (como `image-pixel-sorting.js`) requieren imágenes en `assets/images/`. Ver `assets/images/README.md` para más detalles.

## Build y deploy

```bash
npm run build
```

Genera la app estática en `dist/`. Para previsualizar:

```bash
npm run preview
```

El proyecto está configurado para [Vercel](https://vercel.com) (`vercel.json`).

## Sketches excluidos

El servidor excluye automáticamente:

- `headless-gl.js` — export para Node.js headless
- `s33d-params.js` — módulo helper, no es un sketch

## Otras carpetas

- **examples/** — ejemplos y documentación de canvas-sketch (referencia)
- **sketch-src/html-canvas/** — sketches HTML/Canvas independientes con su propio servidor (Cmd+S para guardar snapshots)

## Licencia

Proyecto personal / arte generativo.
