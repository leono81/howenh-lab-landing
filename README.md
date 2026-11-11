# Howenh Labs

La web de Howenh Labs: un laboratorio de software e inteligencia artificial de Tierra del Fuego. Sitio estático en Astro, dibujado como una lámina grabada en una tinta.

## Desarrollo

`npm run dev` levanta el sitio en http://localhost:4321; `npm run build` lo deja en `dist/` y `npm run preview` lo sirve.

## El dibujo

La maqueta del hero, la isla de Penon y la Tierra de la estación salen de datos reales (OpenStreetMap, Copernicus GLO-30, Natural Earth y capas oficiales), procesados por `scripts/` a `src/data/`:

- `npm run mapa`: la costa y la maqueta (`mapa.json`, `maqueta.json`).
- `node scripts/isla.mjs`: la isla de Penon (`isla.json`).
- `node scripts/globo.mjs`: la Tierra de la estación terrena (`globo.json`).
- `python3 scripts/relieve.py`: el relieve (`docs/lugar/dem-marco.bin`), solo si cambia el marco.

## Para leer antes de tocar

- `PRODUCT.md`: qué es Howenh, a quién le habla y qué se puede decir.
- `DESIGN.md`: el sistema de diseño (tintas, aguadas, dibujo, movimiento, rendimiento).
- `docs/rediseno-handoff.md`: el estado del rediseño y lo que falta.
- `docs/penon-hechos.md`: lo publicable de Penon.
