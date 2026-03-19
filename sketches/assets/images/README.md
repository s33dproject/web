# Assets — Imágenes

Algunos sketches requieren imágenes para funcionar. Coloca los archivos en esta carpeta.

## mam.jpg

Los siguientes sketches esperan una imagen llamada `mam.jpg`:

- `image-pixel-sorting.js` — efecto de pixel sorting sobre la imagen
- `animated-two-bitmap.js` — animación con strips de la imagen

### Cómo añadir

Copia tu imagen a esta carpeta y nómbrala `mam.jpg`, o crea un enlace simbólico:

```bash
ln -s /ruta/a/tu/imagen.jpg mam.jpg
```

Si la imagen no existe, el sketch fallará al cargar. Puedes usar cualquier imagen JPG o PNG para probar.

## Rutas

El servidor sirve esta carpeta en `/assets`. Las imágenes se referencian como `/assets/images/mam.jpg`.
