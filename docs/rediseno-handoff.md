# Handoff · Rediseño de la web de Howenh Labs

> Estado al 2026-11-09. Leer esto primero en la sesión nueva.

## Contexto
- Fecha límite: **2026-11-26**, reunión de Leono con el ministro de Tierra del Fuego por Penon.
- Howenh se presenta como **laboratorio** (IA, datos satelitales, estación terrena, software en producción, planos con IA en desarrollo), no como la empresa de Penon.
- Verdad de producto: `PRODUCT.md`. Hechos publicables de Penon: `docs/penon-hechos.md` (Penon sin tilde).
- Contrato de dirección (impeccable): `.impeccable/surfaces/src-pages-index-astro.md`.

## Decisiones tomadas
- **Mundo visual:** grabado en una sola tinta azul cobalto (#1f3a8f) sobre papel blanco frío (#f6f7fb). EB Garamond para titulares, Archivo para la interfaz, Martian Mono para rótulos. Fusión de las direcciones A (grabado azul), B (faro que ilumina) y J (atlas). De la D (acuarela) solo se toma el formato de tarjeta para los productos.
- **Stack:** Astro 7, en la rama `rediseno-2026` (sin commits). Archivos: `src/pages/index.astro`, `src/components/Hero.astro`, `src/scripts/grabado.ts` (foto → grabado de líneas), `src/scripts/panorama.ts` (relieve DEM, descartado).
- **Lugar sin nombrarlo:** el diseño no dice ciudad ni provincia; solo las coordenadas de Río Grande (53°47′09″ S · 67°42′07″ O), discretas en una esquina. El título, la descripción y el texto alternativo sí nombran Tierra del Fuego.
- **El hero invita a bajar** ("Conocer el laboratorio ↓") y a agendar una reunión (Google Calendar).

## Lo que se probó y se descartó
- Relieve real (Copernicus DEM 30 m) en líneas o isométrico: la costa sale casi plana y el Cabo Domingo no se reconoce.
- Mapa isométrico generado con Flow / Nano Banana: Flow regenera toda la imagen en cada edición y no conoce el lugar. Nadie lo reconoce. No volver a ese camino.

## Dirección actual (propuesta, pendiente del OK de Leono)
- **Hero:** el Cabo Domingo real pasado a grabado (como la primera versión de `Hero.astro` con `grabado.ts`), con la baliza arriba, su haz y un barco que llega.
- **La Misión Salesiana y la Torre de Agua** van más abajo, como láminas grabadas en las secciones del laboratorio, para que el local las reconozca al bajar.
- **Fotos:** idealmente propias de Leono, en alta resolución. Falta pasarle la lista de encuadres (acantilado desde la playa con la baliza, la Misión, la Torre de Agua).
- **Mapa ilustrado** por un ilustrador, de ser posible de Río Grande: para después del 26.

## Datos del lugar
- La baliza del Cabo Domingo está arriba de la meseta: torre de reticulado metálico con panel blanco de tablillas, linterna y riendas. Coordenadas OSM: -53.6873, -67.8476.
- De norte a sur: Cabo Domingo, Misión Salesiana (-53.7247, -67.7989, del lado de adentro de la Ruta 3), ciudad. La Ruta 3 corre entre la costa y la Misión y pasa por detrás del cabo. El río Grande desemboca al sur de la ciudad.
- Torre de Agua de Río Grande: torre de mampostería octogonal, apenas ahusada, con reloj arriba y entrada con frontón.
- La Misión tiene una historia dolorosa con los selk'nam: mostrarla como patrimonio, sin tono celebratorio y sin fotos históricas de personas.

## Material
- Carpeta `flow/` (ignorada por git): fotos de referencia del cabo, la misión y la torre, y los intentos de Flow.
- Imágenes de dominio público y CC con su fuente: `.impeccable/mocks/decision/img/sources.json`. Las fotos del cabo que aportó Leono no tienen autor ni permiso confirmados.
- Bocetos: `.impeccable/mocks/decision/index.html` (ronda 1) y `.impeccable/mocks/decision/r2/index.html` (ronda 2, A a J).

## Próximos pasos
1. Confirmar con Leono la dirección actual y pasarle la lista de fotos.
2. Mientras tanto: secciones del laboratorio, productos (tarjetas en tinta azul) y quiénes somos.
3. Volver el hero a la versión del Cabo Domingo grabado con la foto definitiva.
4. Cierre: revisión final de impeccable, `DESIGN.md`, tipografías servidas desde el sitio, rendimiento y deploy (destino sin confirmar).

Servidor local: `npx astro dev` (puerto 4321); se corta con `npx astro dev stop`.
