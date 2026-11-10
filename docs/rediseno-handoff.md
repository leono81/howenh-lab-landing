# Handoff · Rediseño de la web de Howenh Labs

> Estado al 2026-11-10 (hero terminado). Leer esto primero en la sesión nueva, y después `DESIGN.md`.

## Contexto
- Fecha límite: **2026-11-26**, reunión de Leono con el ministro de Tierra del Fuego por Penon.
- Howenh se presenta como **laboratorio** (IA, datos satelitales, estación terrena, software en producción, planos con IA en desarrollo), no como la empresa de Penon.
- Verdad de producto: `PRODUCT.md`. Hechos publicables de Penon: `docs/penon-hechos.md` (Penon sin tilde).
- Contrato de dirección (impeccable): `.impeccable/surfaces/src-pages-index-astro.md`.
- Geografía verificada del lugar (fuente de verdad del dibujo): `docs/lugar/mapa-rio-grande.md`.
- **Sistema de diseño: `DESIGN.md`** (tokens, reglas de dibujo, movimiento y rendimiento) y `.impeccable/design.json`. Toda sección nueva lo sigue.

## Dirección elegida (2026-11-10): opción A, «maqueta a sangre»
- Hero = maqueta isométrica grabada en una tinta (#1f3a8f sobre #f6f7fb) de la costa norte de Río Grande, vista desde el mar: la ciudad adelante con la Torre de Agua, la Misión al medio, el Cabo Domingo arriba a la derecha con la baliza en el filo. Sin bordes de bloque: el mar abierto llena la pantalla.
- Al cargar se imprime (costa, mar, cabo, ruta, la ciudad crece desde la plaza de la torre, viñetas); después: haz de la baliza, barco que entra a la boca, avión que aterriza y despega hacia el oeste en la pista real, satélite en órbita.
- Sin nombres de lugares en el dibujo; solo las coordenadas de Río Grande.

## Cómo está armado
- `scripts/mapa.mjs`: GeoJSON de OpenStreetMap (`docs/lugar/`, `docs/lugar/osm/`) → `src/data/mapa.json` (planta girada, costa horizontal, 100 unidades = 1 km).
- `scripts/relieve.py`: DEM Copernicus GLO-30 → `docs/lugar/dem-marco.bin` (solo si cambia el marco).
- `scripts/maqueta.mjs`: mapa.json + DEM → `src/data/maqueta.json` (proyección isométrica horneada, relieve ×7, tramos sin accidentes comprimidos, el cabo como sólido diseñado según las fotos, ocultamiento). Tiene `assert` de geografía (baliza al filo, ruta detrás de la baliza, misión del lado de tierra, orden a lo largo de la costa).
- `npm run mapa` corre los dos scripts de Node.
- `src/components/Maqueta.astro` (estilo, impresión y niebla de papel), `MaquetaBaliza/Mision/Torre.astro` (viñetas en ejes isométricos), `Hero.astro` (texto y, en el svg `.cielo`, todo lo que se mueve con SMIL: haz, barcos, camiones, avión, satélite, olas). `src/layouts/Base.astro`: barra con logo y entrada de la letra.
- Ojo (rendimiento): nada de máscaras SVG/CSS sobre la maqueta ni animaciones CSS encima; en pantallas de 2x/3x la página desaparecía. Ver The No-Mask Rule en `DESIGN.md`. Para verificar: capturas a `--force-device-scale-factor=2` y `3` contra `npx astro preview`.
- Fotos de referencia en `flow/` (fuera de git): `ref-cabo-*`, `ref-mision-*`, `3-torre-de-agua-*`.

## Lo que se descartó (no volver)
- Imágenes generadas con IA (Flow/Gemini) para la geografía: no conocen el lugar.
- Planta, caballera e isométrica plana (matriz afín sobre el plano); las opciones B (lámina con marco), C (recorrido con scroll) y D (planta con el cabo levantado); la vista del cabo como lámina aparte. Están en el historial de git (hasta `8ac00ff`).

## Pendiente
1. **Las secciones de la landing** (lo próximo): hoy la página es solo el hero; los enlaces Laboratorio, Proyectos, Productos y Nosotros, y «Conocer el laboratorio», no llevan a nada.
2. Cierre: revisión final de impeccable, tipografías servidas desde el sitio, rendimiento y deploy (destino sin confirmar).

Servidor local: `npx astro dev` (puerto 4321); build de producción: `npx astro build` y `npx astro preview`.
