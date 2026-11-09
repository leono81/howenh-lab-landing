# Penon — hechos publicables

Fuente única para todo copy sobre Penon en la landing. Lo verificó la sesión de penonInsight contra el código y los docs de ese repo (2026-11-08). Lo que no está acá no se publica; lo "no verificado" no se estima ni se redondea.

## Para quién
- Gobierno de Tierra del Fuego: Ministerio de Producción y Ambiente → Secretaría de Ambiente → Subsecretaría de Manejo del Fuego (Servicio Provincial creado por la Ley 1579/2024). La denominación "Ministerio de Ambiente + Secretaría de Manejo del Fuego" es vieja.
- Lo usan personal del gobierno y brigadistas, con login. No hay registro público.
- **Pendiente de Leono:** fecha oficial de puesta en servicio, cantidad de usuarios, si se puede nombrar al ministerio como cliente. No escribir "convenio" ni "contrato" sin su confirmación: el convenio está en borrador.

## Qué hace
- Focos de calor satelitales: VIIRS (NOAA-20 y NOAA-21) y MODIS, vía NASA FIRMS; para NOAA-20/21 también NOAA NESDIS, que publica antes. **No** decir "satélites de la NASA" a secas, ni "tres VIIRS": Suomi NPP no aporta datos desde el 2/11/2026 (FIRMS vacío desde esa fecha).
- Agrupa focos cercanos en incendios y sigue cada fuego como unidad.
- Índice de peligro FWI en 3 zonas, con observaciones oficiales del SMN y partes de guardia de las brigadas (no Open-Meteo).
- Avisos meteorológicos oficiales del SMN, en el mapa y por Telegram.
- Rayos reales del GOES-19. Imagen GOES en vivo solo como contexto (no alerta).
- Contexto: viento, clima, relieve, áreas protegidas, poblados, ejidos, zonas industriales y petroleras.
- Alertas en pantalla y por Telegram con mapa y KMZ; un operador cierra cada una con motivo, y queda registrado quién.
- Detecciones en zonas industriales se **rotulan**, no se descartan.
- Principio: **solo se muestra lo observado y medido; Penon no pronostica.** Excepción rotulada: CAPE y clima por coordenada son modelo.

## Tiempos
- FIRMS cada 30 min; NESDIS, rayos y GOES FDC cada 10 min; avisos SMN cada 15 min; FWI cada hora (12–22 h).
- Latencia satélite→alerta de punta a punta: **no medida, no publicar número.**
- Frase segura: "Los satélites pasan varias veces al día; lo detectado llega al mapa en un máximo de 30 minutos después de publicado." No prometer detección "en minutos".

## Números de uso o impacto
Ninguno verificado. No hay casos documentados de "avisó antes". Nadie los inventa. El histórico contable arranca alrededor del 7/10/2026 (commit 62c4652 dejó de purgar focos a los 5 días); antes de eso no hay datos para contar.

## No mostrar
C2 (brigadas, LoRa/Meshtastic, Starlink); capa de fogones, mapa offline, recepción satelital directa; infraestructura (dominios de backend, VPS, endpoints, roles, Telegram, nombres); incidentes; análisis competitivos. `penon.howenh-labs.com` es pública pero pide login: Leono decide si se linkea.
