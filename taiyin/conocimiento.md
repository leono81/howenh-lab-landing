# CONOCIMIENTO

Lo publicado por Howenh Labs. Sale del texto de la página y de `docs/penon-hechos.md`; cuando cambie la página, se actualiza acá a mano.

## Howenh Labs

- Un laboratorio de software e inteligencia artificial de Tierra del Fuego, sobre la costa atlántica de la isla. «Un laboratorio en el borde del continente. Inteligencia artificial, satélites y software en producción. Hechos con tiempo, cerca del mar.»
- Hace software para el lugar donde vive y, desde ahí, para el resto del país.
- Los nombres de Howenh y de sus productos vienen de las lenguas de los pueblos originarios de la isla, las primeras voces de esa tierra, que tenía nombre mucho antes de llamarse Tierra del Fuego.
- Trabaja en cuatro líneas:
  1. Inteligencia artificial e ingeniería: inteligencia artificial dentro de sus aplicaciones, e ingeniería agéntica (agentes que trabajan con el equipo para diseñar, construir y probar el software).
  2. Vigilancia de incendios: Penon.
  3. Estación terrena: una estación propia en la isla.
  4. Software en producción: sistemas para profesionales de la salud, comercios y estudios contables, en uso con clientes reales.

## Penon

- Detección temprana y vigilancia satelital de incendios forestales en Tierra del Fuego.
- Junta en un solo mapa, capa sobre capa, lo que ven los satélites y lo que se sabe del territorio, para que quienes combaten el fuego vean cada foco con su contexto.
- Principio: solo se muestra lo observado y medido; Penon no pronostica.
- Estado: en producción. Lo usan brigadistas y personal de gobierno, con usuario y acceso restringido; no tiene registro público.
- Las capas:
  - Territorial: la isla, sus lagos y el bosque nativo.
  - SMN: el peligro de incendio del día (índice FWI) en tres zonas, con observaciones oficiales del Servicio Meteorológico Nacional y partes de guardia de las brigadas. También los avisos meteorológicos oficiales del SMN.
  - Industrial y petrolera: lo que se detecta ahí se rotula, no se descarta.
  - Rayos: los rayos que registra el satélite GOES-19. La imagen de GOES en vivo se usa solo como contexto, no como alerta.
  - Contexto: viento, clima, relieve, áreas protegidas, poblados y ejidos: lo que hay alrededor de cada foco.
  - Satelital: focos de calor de los sensores VIIRS (satélites NOAA-20 y NOAA-21) y MODIS, que publica NASA FIRMS (LANCE); para NOAA-20 y NOAA-21 también NOAA NESDIS. Los satélites pasan varias veces al día y lo detectado llega al mapa en un máximo de 30 minutos después de publicado.
- Agrupa los focos cercanos en incendios y sigue cada fuego como una unidad.
- Las alertas aparecen en pantalla con su mapa y un archivo KMZ. Un operador cierra cada alerta con su motivo, y queda registrado quién lo hizo.
- Por qué existe: el 30 de noviembre de 2022 empezó un incendio a 12 km de Tolhuin, en la Reserva Corazón de la Isla. Duró unos tres meses, quemó cerca de 12.000 hectáreas y llegó a tener unos 1.000 brigadistas trabajando.

## Estación terrena

- En Tierra del Fuego Howenh armó una estación para escuchar satélites pequeños: una placa LilyGO T3 con radio LoRa en 433 MHz y una antena helicoidal cuadrifilar (QFH).
- Cuando está en línea, lo que recibe se suma a TinyGS, una red abierta de estaciones en todo el mundo.

## Las plataformas

Además de los proyectos para el territorio, Howenh crea sus propios SaaS: los diseña, los programa y los mantiene seguros.

### Kenos (kenos.app)

- Para profesionales y centros de salud: turnos, pacientes y la administración del consultorio, con las obras sociales y las prepagas, en un solo sistema.
- Lo que hace: turnos y agenda por profesional; pacientes e historia clínica; órdenes y sesiones; presentación a las coberturas; reportes y métricas.
- Su base de datos está inscripta en el Registro Nacional de Bases de Datos Privadas, ante la Dirección Nacional de Protección de Datos Personales (AAIP), conforme al artículo 21 de la Ley 25.326.

### Facturación y contabilidad, conectadas a ARCA

- Hown (hown.howenh-labs.com), para quien factura sin mostrador: un bot de Telegram al que le mandás un audio o un texto y te devuelve la factura de ARCA (A, B o C) con su PDF.
- Yon, para comercios de mostrador: una web app para vender y facturar, con clientes, productos y stock, métricas e historial. Si se corta la señal sigue vendiendo: las facturas esperan en cola y salen solas cuando vuelve la conexión.
- Teken es el motor interno: lleva el comprobante a ARCA y vuelve con el CAE.
- Kaux, sistema contable para contadores y estudios: trae de ARCA los libros de IVA para que el contador los revise y los corrija antes de subirlos (los sube el contador), y liquida los sueldos con los convenios incluidos.

## Contacto

- En la sección Hablemos: «Contanos qué necesitás y coordinamos una reunión. Si querés trabajar con nosotros, también es por acá.»
- La reunión se agenda desde el botón «Agendar una reunión», y el correo es contacto@howenh-labs.com.
- Redes: Instagram y LinkedIn, en el pie de la página.
