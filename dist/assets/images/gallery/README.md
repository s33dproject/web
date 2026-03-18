# Gallery images

Coloca aquí las imágenes de las piezas. Referéncialas en `public/gallery-data.json`.

## Formato de nombre (desde sketches)

Al descargar desde la galería del run view, el archivo se guarda con formato:

`{tipo}_{sketch}_{param1=val1}_{param2=val2}_{timestamp}.png`

Ejemplo: `19_random-circles_lineWidth=40_margin=300_1734567890123.png`

- **tipo**: `19` (2019-seeds) o `orig` (original)
- **sketch**: nombre del sketch (ej. random-circles, experimental/foo → experimental_foo)
- **params**: parámetros usados (key=value)
- **timestamp**: para unicidad

Si usas este formato, la galería genera automáticamente título y meta desde el nombre:

```json
{
  "id": "1",
  "filename": "19_random-circles_lineWidth=40_margin=300_1734567890123.png"
}
```

## Manual

También puedes definir título y meta explícitos:

```json
{
  "id": "1",
  "title": "nombre de la obra",
  "image": "/assets/images/gallery/mi-pieza.png",
  "meta": "2024 · 800×800"
}
```
