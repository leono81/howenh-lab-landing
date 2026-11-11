# Mapa del hero: costa norte de Río Grande (datos verificados)

Fecha de la investigación: 2026-11-09. Todo lo marcado [OSM] se midió en OpenStreetMap (Overpass/Nominatim) y se recalculó sobre los GeoJSON de esta carpeta. [WEB] = leído en la fuente citada. [INF] = inferencia mía, no confirmada. Mapa de referencia con la geometría real: `mapa-real.svg` / `mapa-real.png`.

## Resumen de la geografía (leelo primero)

De noroeste a sudeste la costa es **una diagonal casi recta, rumbo ~135° (mar al NE)**, ~15,7 km entre la baliza y la boca del río. La Ruta 3 corre tierra adentro (SO) pegada a la costa; recién en la rotonda (-53.735, -67.779) se separa y baja casi vertical por el oeste de la ciudad. La ciudad está **chica, en el extremo SE, justo en la desembocadura**, y el aeropuerto queda al este de la ruta, al oeste del centro.

## Lugares

**Cabo Domingo.** Nodo `natural=cape` node/3607789180 en -53.68843, -67.84683 [OSM]. NO es un cerro ni una península: es una convexidad suave (cientos de metros) de una costa casi recta; a 4 km hacia el SE la costa ya entra 0,3 km respecto de la tangente [OSM, medido]. Según fuentes es el borde de una meseta baja y larga: SRTM da 0 m en el mar y 91 m en la baliza en ~200-300 m horizontales (acantilado casi vertical hacia el mar), después una meseta ondulada de 40-60 m que baja a ~20 m a 5 km tierra adentro [perfil-cabo.json, SRTM30, margen ±10 m]. Fuentes discrepan en la altura (80, 90, 100 m) [WEB es.wikipedia.org/wiki/Cabo_Domingo]. Barranca ocre: la foto actual (`flow/1-cabo-acantilado.jpg`) muestra **cárcavas verticales profundas, capas horizontales de sedimento, un talud de derrubio al pie y la cima plana**, con la baliza en el borde. La foto vieja de Borgatello (Commons) la muestra lisa: manda la actual. Al pie, playa de canto rodado y restinga en bajamar (mareas de hasta ~8 m) [WEB hispanopedia]. Fotos de Leono (`flow/ref-cabo-23..27.png`, 2026-11-09): de lejos es un yunque: meseta plana que sube suave tierra adentro → hacia la punta, borde superior de roca casi vertical con capas, ladera con cárcavas y la punta que cae al mar; **la baliza está en el punto más alto, al filo**. El DEM de 30 m redondea ese filo y no alcanza para la vista de costa: esa se dibuja a partir de las fotos. **El pictograma tiene que mostrar**: el borde de una meseta (arriba plano, corte vertical hacia el mar, rampa suave hacia adentro), vista de costado, apoyado sobre la costa diagonal; nunca un cono aislado.

**Baliza.** node/3607789181 "Faro Cabo Domingo" en -53.687288, -67.847593 [OSM, confirmado por Nominatim]. Está a ~69-76 m del borde de la costa. Es una torre de celosía metálica de ~6 m, con panel solar, tensores y farol arriba, construida en 1933 [WEB es.wikipedia.org/wiki/Faro_Cabo_Domingo; foto Commons "Faro Cabo Domingo.jpg"]. Los colores de la ficha (blanco/negro) vs la foto (blanco y farol rojo) no coinciden: en una tinta, dibujar solo silueta de celosía con farol. **Mostrar**: una aguja finita en el borde de la meseta, minúscula frente al acantilado. No es un faro de edificio. Ojo: el "Radar 3D Cabo Domingo" (node/10761531195, -53.68253, -67.87035, militar) está 2 km al ONO; no es la baliza.

**Misión Salesiana.** Capilla way/1058700771 en -53.7247, -67.7989; polígono de la escuela way/476428019 [OSM]. A 5,1-5,25 km de la baliza, rumbo ~142° (SE, no sur). A ~190 m de la RN3 y ~540 m del mar. **Queda al SO de la ruta, o sea del lado de tierra adentro; la ruta queda entre la misión y el mar** (producto cruzado, verificado dos veces). Edificios bajos y blancos, galpones, invernadero; capilla chica en el eje del camino de entrada (1899) [WEB es.wikipedia / interpatagonia]. Capilla (foto `flow/2-mision.jpg`): paredes blancas de chapa acanalada, planta en cruz con varios cuerpos bajos, techos a dos aguas de chapa roja, y un campanario cuadrado con el campanario abierto y un remate piramidal rojo con cruz. Cerco de tablas blancas, camino recto de entrada, el mar visible detrás. Monumento Histórico Nacional. Tono: fue un lugar donde murieron muchos selk'nam; sin folklore decorativo ni cementerio como adorno. **Mostrar**: un conjunto bajo, pegado a la ruta del lado de tierra, con un acceso corto que sale de ella.

**Ruta Nacional 3.** Way principal 321733129 y vecinos [OSM]. Viene del NO cruzando el Río Chico por Puente Viejo (-53.6735, -67.9357), hace un recodo tierra adentro unos 3-4 km al oeste del cabo, y **se arrima a la costa en el cabo: pasa ~600 m al SSO de la baliza** (a ~490 m del nodo del cabo), por detrás, nunca por el acantilado ni la playa. Sigue paralela a la costa a 0,2-0,5 km, pasa a ~190 m de la misión, hasta la rotonda de -53.7349, -67.7793. Ahí gira casi al sur: es la circunvalación (ways 254568630, 784865687, 851863164, ref RN3) por el borde oeste de la ciudad, lon ≈ -67.778, ~8,8 km, hasta -53.8095. Después va al SO y cruza el Río Grande en el puente way/68247929 (-53.8358, -67.7915) y sigue al sur. **No entra a la ciudad**; el acceso urbano es la RP7 (Acceso Norte). El nombre "Padre José Zink" figura en el puente; en la circunvalación hay un tag con ese nombre en varios ways [OSM]. La baliza queda del lado del mar de la ruta; la misión del lado de tierra.

**Ciudad.** Mancha residencial entre lat -53.757 y -53.806, lon -67.765 y -67.655 [OSM]; ~2 km² residencial + 1,6 km² industrial. Cuadrícula girada ~45°: ejes dominantes 130-135° (paralelo a la costa) y 40-45° (perpendicular) [OSM, medido sobre calles]. Costanera: Av. Héroes de Malvinas (RP7) pegada al mar en el borde NE; Acceso Norte entra por el NO. Está en el extremo SE del recorte, contra la desembocadura; se ve chica frente a los 15 km de costa. Aviso: `ciudad.geojson` guarda solo polígonos de uso de suelo >= 2 ha, por eso en el mapa la mancha urbana se lee sobre todo por las avenidas. **Mostrar**: una cuña de manzanas giradas 45° entre el mar (NE) y el río (S), fuera de la ruta. Ojo: existe un barrio llamado "Cabo Domingo" dentro de la ciudad (node/9518306475, -53.7658, -67.7210); no es el cabo, no dibujar la baliza ahí.

**Torre de Agua.** La emblemática es la "Antigua Torre de Aguas" way/828268896 en -53.78558, -67.69586 [OSM], Fagnano y Lasserre 386, frente/borde norte de la plaza Almirante Brown, a ~325 m de la costa y ~500 m de la boca del río [OSM + WEB minutofueguino.com.ar, airelibre.com.ar]. En OSM la huella es un cuadrado de ~8,4 m, pero está simplificada: la foto (`flow/3-torre-de-agua-dia.jpg`) muestra una **torre ochavada (octogonal)**, apenas ahusada, revocada en color claro, con remate plano y cornisa saliente, óculos redondos arriba, un reloj redondo (hoy lo tiene; el de 2021 se describió como provisorio), dos ventanas angostas verticales y una puerta de madera bajo un pórtico con frontón. Altura ~18 m; hoy es mirador y oficina de turismo; las fechas discrepan según la fuente (1937/1948/1954) [WEB]. **Mostrar**: el prisma ochavado alto con reloj y pórtico, como hito vertical dentro de la trama. Las otras tres `man_made=water_tower` (ways 1482314662/63, 1484067352, tanques de 14 m a 2,4-3 km al NO) NO son la torre emblema.

**Río Grande y desembocadura.** Way/147153507 [OSM]. Entra desde el SO con meandros, cruza la RN3 en el puente (-53.836, -67.79), bordea el sur de la ciudad y desemboca en **-53.7856, -67.6879, en el extremo ESTE de la ciudad** (a ~0,5 km de la torre), no al sur. El estuario se ensancha en embudo: 0,25-0,9 km al oeste, ~1 km desde lon -67.72, 2,2-2,5 km en la boca [OSM, medido]. Wikipedia lo describe como zona difusa de mallín salino y playa de marea [WEB es.wikipedia.org/wiki/Río_Grande_(río_de_Tierra_del_Fuego)]. Alrededor de la boca y al sur de la ciudad hay una red de arroyos/cauces de marea chicos (ways 900519570-85, entre otros). Puentes: RN3 (way 68247929), Antiguo Puente Colgante (way/158778647, junto al anterior) y viaducto Av. Carlos Pacheco (way/114796342, -53.8068, -67.6858, cerca de la boca; probablemente el Puente Mosconi de 1981, [INF]). **Mostrar**: un río serpenteante que viene del SO por detrás de la ciudad y se abre a la boca justo al borde urbano.

**Aeropuerto.** Relation 10889755 (SAWE/RGA) [OSM]. Pista way/784012678 08/26, asfalto, ~1.995 m, de -53.77715, -67.7343 a -53.77795, -67.76466; rumbo verdadero ~87,5° (casi horizontal en el mapa; la diferencia con "08" es magnético vs verdadero [INF]). Terminal way/868917421 en -53.7817, -67.7543, ~125 x 34 m, ~450-500 m al sur de la pista, con aprons y hangares al sur y calles de rodaje formando una T en el lado oeste. Queda **al ESTE de la RN3 (ruta en lon -67.778, pista desde -67.765), tierra adentro (~2,6 km de la costa NE), al norte del río (~3 km)**; ~3,3 km al OSO-O del centro, no "5 km al NO" como dice Wikipedia. **Mostrar**: una pista recta y larga con la terminal debajo, entre la ruta y la ciudad. El rumbo 07/25 de algunos sitios no se pudo resolver (sin AIP); no afecta el dibujo. No inventar un Skyhawk exhibido (no confirmado).

## Errores a evitar

1. El cabo no es un cerro aislado ni una isla ni una península: es una convexidad leve de una costa recta, con meseta detrás.
2. **No hay ningún río entre el cabo y la ciudad.** Lo único: lagunas tierra adentro al oeste de la RN3 (Don Bosco, Larga, de los Cisnes, del Peñón, Redonda), arroyos intermitentes diminutos junto a la ciudad, y la red de marea de la boca. El Río Chico desemboca **al NO** del cabo (-53.6788, -67.9099), no entre cabo y ciudad.
3. Al NO de la baliza hay un entrante: ría del Río Chico, un gancho angosto (~1 km de ancho) de unos 3,5-5 km hacia el oeste. Es una inferencia de topología de costa (dos coastlines paralelas) [OSM+INF], no confirmada con satélite: dibujarlo es opcional, pero no trazar una costa limpia hacia el ONO.
4. La RN3 va tierra adentro (SO), pegada a la costa, nunca sobre el acantilado; **la baliza está del lado del mar de la ruta, la misión del lado de tierra**. No poner la misión del lado del mar.
5. La RN3 no cruza la ciudad: la circunvalación pasa 3,5-4 km al oeste del centro; cruza el río ~8 km al SO.
6. El río desemboca al ESTE de la ciudad, no al sur; el aeropuerto no está sobre la costa ni al sur del río.
7. No confundir el barrio "Cabo Domingo" (en la ciudad) con el cabo; no tomar los tanques de agua de 14 m por la torre.
8. No dibujar barco varado en la boca (no hay evidencia; el Desdémona está a ~80 km), ni puerto operativo (el de Caleta La Misión quedó inconcluso), ni la torre como prisma cuadrado con tejas (es ochavada), ni estilo selk'nam decorativo.
9. La baliza es diminuta frente a la meseta; la torre es el hito vertical más alto de la ciudad.

## Encuadre propuesto

- **Bbox**: lat -53.84 a -53.66, lon -67.93 a -67.66 (cabo arriba a la izquierda; abajo el puente de la RN3 y los meandros del río; a la derecha la boca). Si no importa el puente, cortar en -53.82.
- **Orientación**: con norte arriba la costa ya es una diagonal de ~135°, pero deja mucho vacío (mar arriba a la derecha, estepa abajo a la izquierda). Recomendado: rotar ~45° en sentido antihorario para que la costa quede casi horizontal con el mar arriba, y la cuadrícula urbana ortogonal. Es la opción más limpia para un grabado y la que mejor muestra el cabo como borde de meseta.
- **Escala vertical**: exagerar el relieve de la meseta ~4-6x (91 m sobre 5 km es invisible a escala real); mantener la horizontal real. La baliza, la torre y el avión como íconos grandes (no a escala).
- **Entran**: cabo con baliza, misión, RN3 completa del recorte (con el recodo hacia el cabo y la circunvalación), ciudad con torre, río con meandros y boca, aeropuerto con pista y terminal, 2-3 lagunas tierra adentro como textura.
- **No entran**: Río Chico y su ría (solo si hay espacio), radar militar, puerto Caleta La Misión, Margen Sur, parque industrial, monumentos, cementerio, los 3 tanques de agua.
- Comprimir la distancia cabo-ciudad (15 km) con una nota de "esquemático"; no mover los lugares fuera de su orden.

## Plataformas de imagen

Conclusión: la geometría NO se genera con IA; sale de OSM proyectado a SVG, estilizado con trazo y hachurado a una tinta. La IA solo para íconos chicos (baliza, torre, avión) pegados encima.

| Plataforma | Gratis hoy | Comentario | Estado |
|---|---|---|---|
| Google Flow (ya pagás) | 50 créditos/día sin plan; +200/mes AI Plus, +1.000/mes AI Pro | Alcanza para íconos. Edición local por "lasso": la prensa lo menciona, la ayuda oficial no; probalo en tu cuenta | verificado (cuotas) / dudoso (lasso) |
| Gemini API / AI Studio | NO hay cuota gratis de imagen | Los blogs con "500 por día" están desactualizados | verificado |
| Ideogram | 30 créditos/semana; inpainting solo pago | Imágenes públicas en free | verificado |
| Recraft | Free sin licencia comercial, imágenes públicas | Único con SVG nativo, pero no sirve para el mapa | verificado |
| Adobe Firefly | Generaciones diarias sin cifra; Fill y vector son pagos | Licencia comercial del plan free no aclarada | parcial |
| Hugging Face (Qwen-Image-Edit, Apache 2.0) | ZeroGPU, cuota no verificada | Inpainting en Spaces de terceros; disponibilidad variable | parcial |
| ComfyUI local | Ilimitado | Depende de tu GPU (no sé cuál tenés); FLUX.2 klein 4B es Apache 2.0 según blogs | sin verificar |
| Leonardo, Krea, Bing/Designer, ChatGPT free, Playground | Cifras solo de blogs | Licencia comercial dudosa o volátil: descartar para uso comercial | sin verificar |

**Recomendación**: mapa por script (gratis, exacto, vectorial, sin marca de agua); Flow, que ya pagás, para los íconos. No hace falta otra plataforma. Atribución obligatoria: "© OpenStreetMap contributors" (ODbL).

## Fuentes

- OSM vía Overpass (overpass-api.de, base 2026-11-09) y Nominatim; GeoJSON en esta carpeta; elementos citados por id.
- SRTM30 vía opentopodata.org (`perfil-cabo.json`).
- es.wikipedia.org/wiki/Cabo_Domingo; es.hispanopedia.com/wiki/Cabo_Domingo; es.wikipedia.org/wiki/Faro_Cabo_Domingo; findelmundo.tur.ar/en/actividades/s/115.
- es.wikipedia.org/wiki/Río_Grande_(Tierra_del_Fuego); es.wikipedia.org/wiki/Río_Grande_(río_de_Tierra_del_Fuego).
- interpatagonia.com/riogrande/mision-salesiana.html; welcomeargentina.com/riogrande/mision-salesiana.html; Wikipedia "Misión Salesiana Nuestra Señora de la Candelaria".
- minutofueguino.com.ar (torre de agua, 26/05/2021); ushuaia-info.com.ar (torre reinaugurada); airelibre.com.ar (torre, 2024).
- Commons: Faro_Cabo_Domingo.jpg (CC BY-SA 3.0), "Misión Salesiana de la Candelaria con el Cabo Domingo" (dominio público).
- es.wikipedia.org/wiki/Aeropuerto_Internacional_Gobernador_Ramón_Trejo_Noel.
- Plataformas: support.google.com/flow/answer/16526234, aistudio.google.com/docs/pricing, docs.ideogram.ai, recraft.ai/pricing, huggingface.co/Qwen/Qwen-Image-Edit.

## Pendiente (no verificado)

Capilla y torre resueltas con tus fotos de `flow/` (sin autor ni permiso confirmados: sirven de referencia, no para publicar). Queda: existencia del lasso en Flow, si la entrante del Río Chico es agua permanente, si el viaducto Carlos Pacheco es el Mosconi, camino de acceso al cabo desde la RN3.
