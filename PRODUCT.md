# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro, con salida estática (elegido por Leono el 2026-11-08). Reemplaza al `index.html` suelto con Tailwind por CDN. El destino de deploy está sin confirmar: no es un proyecto de Vercel.

## Users

Es la web institucional de Howenh Labs. Le habla a tres audiencias, en este orden:

1. **Gobierno (principal).** Ministros, secretarías y municipios que evalúan a Howenh como proveedor de tecnología. El caso inmediato: el 2026-11-26 Leono se reúne con el ministro de la provincia de Tierra del Fuego por Penon. Esa persona, o su equipo, va a entrar a la web para saber quién está detrás.
2. **Empresas y profesionales.** Clientes y potenciales clientes de los SaaS: profesionales de la salud (Kenos), estudios contables (Kaux), contribuyentes (Hown y Teken).
3. **Talento.** Gente que podría sumarse al equipo.

Los inversores no son audiencia de esta web.

## Product Purpose

Que Howenh Labs se vea como lo que ya es: una empresa de Tierra del Fuego que hace software en producción para gobierno y para profesionales. Empieza a ser vista en Buenos Aires, sobre todo por Kenos, y la web actual (de hace un año) no está a la altura de ese paso.

Éxito: alguien del gobierno sale de la web convencido de que la empresa detrás de Penon es seria, y un profesional o un candidato entiende qué hace Howenh y cómo contactarla.

## Positioning

- **Howenh se muestra como laboratorio, no como empresa de un producto** (Leono, 2026-11-08). Penon es una línea de trabajo entre otras y no el centro de la web.
- Líneas del laboratorio, según Leono: inteligencia artificial aplicada, datos satelitales, una estación terrena propia y software en producción (Kenos, Penon, Teken, Hown). En desarrollo: bots que dibujan planos de casas y edificios (repo `~/Projects/construccion`). Se presenta como "en desarrollo", nunca como producto terminado.
- Es un laboratorio de software e IA aplicada **desde Tierra del Fuego**, no un estudio porteño con una sucursal en el sur.
- Los nombres de los productos vienen de las lenguas **selk'nam y yámana**, igual que "Howenh", y algunos logos también toman de ahí. Es una identidad que otra empresa no puede copiar con verdad.
- Penon monitorea incendios en la misma tierra que se llamó "del Fuego" por los fuegos de sus pueblos originarios.

## Operating Context

Los productos (verificado en cada repo el 2026-11-08):

| Producto | Qué es | Estado público |
|---|---|---|
| **Penon** | Monitoreo de incendios forestales para el Gobierno de Tierra del Fuego. "Penon" = huella en selk'nam; se escribe sin tilde. | En producción. Hechos publicables solo de `docs/penon-hechos.md`. |
| **Kenos** | SaaS multi-tenant para profesionales de la salud: pacientes, turnos, órdenes, sesiones, facturación y obras sociales. | En producción. |
| **Teken** | Servicio de facturación electrónica integrado con ARCA, con API REST (`teken.howenh-labs.com`). | En producción. |
| **Hown** | Bot de Telegram para emitir facturas electrónicas desde el celular, sobre Teken. Ya tiene su sitio: `hown.howenh-labs.com`. | En producción. |
| **Kaux** | Plataforma de carga masiva a ARCA para estudios contables. | Sin confirmar. |
| **Yon** | PWA offline-first del ecosistema Howenh. | Sin confirmar: no está documentado qué hace para el usuario. |
| **Tari** | Existe un repo. | Sin confirmar. |

**Decisión abierta:** qué productos aparecen en la web y con qué peso.

## Capabilities and Constraints

- **Fecha límite:** 2026-11-26. Si algo no llega, se recorta todo menos Penon.
- **No hay generación de imágenes con IA** (Higgsfield ya no está). Las imágenes salen de material de dominio público, de fotos reales con su fuente, o de visualizaciones hechas en código.
- **Penon:** no se nombra al organismo de gobierno ni se habla de "convenio" hasta que Leono lo confirme, después del 26. El sitio tiene que admitir las dos versiones del texto.
- **Penon:** las reglas de qué se puede decir y qué no están en `docs/penon-hechos.md`. Penon no pronostica, la latencia no está medida, las detecciones industriales se rotulan y no se filtran.
- **CENIT** (primer cliente empresa de Kenos): no se nombra sin confirmación de Leono.

## Brand Commitments

- El nombre es **Howenh Labs**. El contenido va en español.
- Los nombres de los productos son selk'nam o yámana y se respetan tal cual (Penon sin tilde).
- **Logos de los productos** (no forman un sistema común entre sí):
  - Kenos: `~/Projects/kenos_front-am/public/kenos-logo.png` (solo PNG).
  - Penon: `~/Projects/penonInsight/apps/web/public/penon-logo-white.png` y `penon-logo-black.png` (lazos entrelazados con una S).
  - Hown: `~/Projects/hown-landing/public/logo-mark.svg` y `logo.svg`.
  - Yon: `~/Projects/yon/docs/design/logo/yon-icono.svg`.
  - Kaux: `~/Projects/assets/kaux/marca/logo/final/` (SVG).
  - Teken: no tiene logo.
- **No usar** `penonInsight/apps/web/public/penon-logo.png`: es una figura del Hain generada con IA.
- **Material ceremonial selk'nam** (fotos del Hain, cuerpos pintados, espíritus): no se usa como decoración. Es sagrado, hay comunidades selk'nam y yagán vivas, y la audiencia principal es un gobierno fueguino.
- **Referencias que nombró Leono:** anthropic.com y hermes-agent.nousresearch.com. De Anthropic le atrae que las imágenes impactan desde lo natural y lo matemático. De Nous, cómo trae imaginería mitológica y antigua. Las desarrolla new-work.

## Evidence on Hand

- `docs/penon-hechos.md`: hechos de Penon verificados contra su repo.
- **Incendio de la Reserva Corazón de la Isla (2022):** inicio el 30/11/2022 a 12 km de Tolhuin, unas 12.000 ha, 3 meses y hasta unos 1.000 brigadistas en el pico. Verificado en prensa (sur54, elDiarioAR) según `~/Projects/penonInsight/docs/institucional/2026-07-01-penon-verificacion-independiente.md`.
- **Presentación de Penon** (`~/Projects/presentacion`): página narrativa propia de Penon con globo, órbita, capas y alerta. Sus imágenes en `public/incendios/` no tienen fuente documentada.
- **No existen:** testimonios, métricas de uso, cantidad de usuarios, casos documentados de "Penon avisó antes", foto del equipo. Nada de eso se fabrica.

## Product Principles

1. **Solo lo verificado.** Ante un gobierno, una afirmación inventada pesa más que diez verdaderas. Lo que no tiene fuente no se publica.
2. **El origen es la tierra.** Tierra del Fuego, sus lenguas y su paisaje son la identidad, no un decorado.
3. **Respeto antes que estética.** La cultura selk'nam y yámana se honra con la lengua, los relatos y el paisaje, nunca con lo sagrado.
4. **Producción, no promesa.** Howenh muestra software que ya funciona. Lo que está en desarrollo no se vende como hecho.
