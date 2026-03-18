# sketches-metadata.json

Define metadatos y parámetros en tiempo de ejecución para cada sketch.

## Estructura

Cada clave es el ID del sketch (nombre del archivo sin `.js`, o `planets/index` para subcarpetas):

```json
{
  "sketch-id": {
    "tech": ["canvas-sketch", "Three.js", "palettes"],
    "params": [
      { "key": "opacity", "label": "Opacity", "min": 0.5, "max": 1, "step": 0.05, "value": 0.85 }
    ]
  }
}
```

### tech (opcional)

Array de strings que describe las tecnologías usadas. Solo informativo (p. ej. para la UI).

### params (opcional)

Array de controles que aparecen en la vista Run.

## Tipos de parámetros

### Slider (por defecto)

```json
{
  "key": "opacity",
  "label": "Opacity",
  "min": 0.5,
  "max": 1,
  "step": 0.05,
  "value": 0.85
}
```

- `key` — identificador; debe coincidir con la propiedad en `runtimeParams` del sketch
- `label` — texto del control
- `min`, `max`, `step` — rango del slider
- `value` — valor por defecto

### Texto

```json
{
  "key": "character",
  "label": "Character",
  "type": "text",
  "value": "¨",
  "placeholder": "¨ § · …"
}
```

- `type`: `"text"`
- `value` — valor por defecto (string)
- `placeholder` — placeholder del input (opcional)

## Uso en sketches

1. Define `runtimeParams` con los valores por defecto:

```js
const runtimeParams = { opacity: 0.85, character: "¨" };
```

2. Usa `runtimeParams` en el render:

```js
context.globalAlpha = runtimeParams.opacity ?? 0.85;
```

3. Conecta el listener de params:

```js
const managerPromise = canvasSketch(sketch, settings);
require("./s33d-params").setupParamsListener(managerPromise, runtimeParams);
```

La vista Run envía los params vía `postMessage`; `s33d-params.js` los aplica a `runtimeParams` y llama a `manager.render()`.

## Añadir un nuevo sketch

1. Crea el archivo en `src/nombre-del-sketch.js`
2. Si quieres controles en la UI, añade una entrada en `sketches-metadata.json`
3. En el sketch: `runtimeParams`, `setupParamsListener`, y usa los params en el render

## originals-metadata.json

Para sketches en `originals/examples/`, usa `originals-metadata.json` con el mismo esquema. Permite:

- **Override de tech** — si no quieres inferir desde `require()`
- **Params** — para originals que usen `setupParamsListener` (requiere modificar el sketch)
