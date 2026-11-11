# Handoff · Rediseño de la web de Howenh Labs

> Estado al 2026-11-10, noche: hero terminado y secciones armadas hasta Productos (sin commitear). Leer esto primero en la sesión nueva, y después `DESIGN.md`.

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
- Color (2026-11-10): segunda tinta **magenta de carta** (#b02a78) para luces, señales, hitos (techos de la Misión, cornisa/reloj/frontón de la torre, linterna) y el botón principal; **aguadas de bruma austral** bajo el grabado (mar #d6e4f1, tierra #e9eaee, ciudad #efdde8). Reglas en `DESIGN.md`.

## Cómo está armado
- `scripts/mapa.mjs`: GeoJSON de OpenStreetMap (`docs/lugar/`, `docs/lugar/osm/`) → `src/data/mapa.json` (planta girada, costa horizontal, 100 unidades = 1 km).
- `scripts/relieve.py`: DEM Copernicus GLO-30 → `docs/lugar/dem-marco.bin` (solo si cambia el marco).
- `scripts/maqueta.mjs`: mapa.json + DEM → `src/data/maqueta.json` (proyección isométrica horneada, relieve ×7, tramos sin accidentes comprimidos, el cabo como sólido diseñado según las fotos, ocultamiento). Tiene `assert` de geografía (baliza al filo, ruta detrás de la baliza, misión del lado de tierra, orden a lo largo de la costa).
- `npm run mapa` corre los dos scripts de Node.
- `src/components/Maqueta.astro` (estilo, impresión y niebla de papel), `MaquetaBaliza/Mision/Torre.astro` (viñetas en ejes isométricos), `Hero.astro` (texto y, en el svg `.cielo`, todo lo que se mueve con SMIL: haz, barcos, camiones, avión, satélite, olas). `src/layouts/Base.astro`: barra con logo y entrada de la letra.
- Ojo (rendimiento): nada de máscaras SVG/CSS sobre la maqueta ni animaciones CSS encima (The No-Mask Rule en `DESIGN.md`). Para capturar con Chrome headless a 2x/3x usar `--run-all-compositor-stages-before-draw`: sin esa opción la captura sale a veces en blanco porque el dibujo todavía no terminó de pintarse (es un efecto de la captura, no de la página).
- Fotos de referencia en `flow/` (fuera de git): `ref-cabo-*`, `ref-mision-*`, `3-torre-de-agua-*`.

## Lo que se descartó (no volver)
- Imágenes generadas con IA (Flow/Gemini) para la geografía: no conocen el lugar.
- Planta, caballera e isométrica plana (matriz afín sobre el plano); las opciones B (lámina con marco), C (recorrido con scroll) y D (planta con el cabo levantado); la vista del cabo como lámina aparte. Están en el historial de git (hasta `8ac00ff`).

## Secciones (2026-11-10, sin commitear todavía)
Orden en `src/pages/index.astro`: Hero → Laboratorio → Proyectos (Penon + Estación) → Productos → Nosotros + Contacto (en `Nosotros.astro`) → pie (en `Base.astro`). Todo se decidió con Leono mirando la página en vivo.
- **Laboratorio** (`Laboratorio.astro`): índice de cuatro líneas (IA e ingeniería —con ingeniería agéntica, sin enlace—, Vigilancia de incendios —con SMN—, Estación terrena, Software en producción). Entrada sutil: los filetes se trazan y la letra baja 7 px.
- **Penon** (`Penon.astro`, la sección abre directo con él; se sacó el título paraguas «Para el territorio»): panel fijo con el texto a la izquierda; a la derecha la isla en perspectiva (`scripts/isla.mjs` → `src/data/isla.json`, capas oficiales en `docs/lugar/isla/`). Con el scroll caen las capas (SMN, industrial y petrolera, rayos, contexto), cada una con su color de la paleta, y quedan apiladas; leyenda de capas abajo. Con la pila armada, el satélite pasa solo (rAF) y aparecen focos ilustrativos: dos «alerta» y uno «rotulado · yacimiento». Textos solo de `docs/penon-hechos.md`; flag `NOMBRAR_ORGANISMO`.
- **Estación terrena** (en `Proyectos.astro`): la Tierra grabada (`scripts/globo.mjs` → `src/data/globo.json`, costas Natural Earth 1:110m en `docs/lugar/mundo/`), norte arriba, antena QFH clavada en Río Grande, órbita polar; la señal baja, el dato sale por la red (estaciones ilustrativas). Texto: «armamos», «cuando está en línea» (hoy está fuera de línea). Se sacó el rótulo «RED TINYGS».
- **Productos** (`Productos.astro`): título «Nuestras plataformas» + bajada de Leono. **Kenos** con lugar propio: logo en una tinta (`public/kenos-logo-tinta.png`), caduceo grabado que se traza (Leono pidió dos serpientes con alas), y un rompecabezas-agenda: las piezas salen de un montón, arman la semana, los turnos atendidos (tilde) pasan a un lote «Presentación · obras sociales y prepagas»; las cuatro etiquetas aparecen al lado, al ritmo del reloj del svg. Abajo: «Lo usan profesionales…» (flag `NOMBRAR_CLIENTE` para CENIT). Después «Facturación electrónica, conectada a ARCA»: Hown, Yon, Kaux en filas + diagrama animado del comprobante (Teken como motor).
- **Nosotros + Contacto**: solo letra; sin nombres de personas.
- Sacados por Leono: planos con IA (no se anuncia lo que no existe), Tari, logos de producto salvo Kenos.

## Pendiente
0. **Commitear** lo de arriba (rama `rediseno-2026`; nada pusheado).
1. **Nosotros / Contacto / pie**: revisar con Leono (es lo que sigue en el orden de la página).
2. **`DESIGN.md`**: anotar las secciones nuevas (tamaños de letra de sección —el detector de impeccable los marca como fuera de la escala—, el patrón «lámina que se arma con el scroll», el rompecabezas, la Tierra grabada, colores por capa) y después la revisión final de impeccable.
3. Decisiones abiertas de Leono: nombrar a CENIT y «tres sedes»; si Kenos ya envía la presentación (la ficha de marca dice que no); enlazar `penon.howenh-labs.com` y yon.com.ar (sin landing); el enlace a TinyGS con la estación fuera de línea; la cuarta línea de Laboratorio («Software en producción» ↔ «Nuestras plataformas»); la bajada del hero que todavía dice «satélites».
4. Cierre: tipografías servidas desde el sitio, rendimiento (el HTML pesa ~230 KB gzip), deploy (destino sin confirmar).

Capturas de verificación: scripts con Playwright desde `~/Projects/tari/node_modules/playwright` (no hay en este repo).

Servidor local: `npx astro dev` (puerto 4321); build de producción: `npx astro build` y `npx astro preview`.
