// node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrar, validarPedido, validarEntrada, limitador, HERRAMIENTAS, RESULTADOS } from './reglas.mjs';

test('el filtro deja pasar lo que se puede decir', () => {
  for (const s of [
    'Penon no pronostica: muestra lo observado y medido.',
    'Penon no hace pronósticos.',
    'Predecir, no: Penon muestra lo observado y medido.',
    '¿Predecir? No. Muestra lo observado.',
    'Eso en segundos no te lo puedo dar.',
    'Lo detectado llega al mapa en un máximo de 30 minutos después de publicado.',
    'Te llevo a Hablemos para coordinar una reunión.',
    '¿Querés contratar Kenos? Te armo el pedido.',
    'En el consultorio, la secretaria carga los turnos en Kenos.',
    'El laboratorio en un minuto.',
    'Lo usan brigadistas y personal de gobierno, con acceso restringido.',
    'Hown te devuelve la factura de ARCA (A, B o C) con su PDF.',
  ])
    assert.equal(filtrar(s), null, s);
});

test('el filtro corta lo que no se puede decir', () => {
  for (const [s, regla] of [
    ['Tenemos un convenio con la provincia.', 'convenio'],
    ['Fue contratado por la provincia.', 'contrato'],
    ['Lo usa el Ministerio de Producción y Ambiente.', 'organismo'],
    ['Trabajamos con el gobierno provincial.', 'organismo'],
    ['Penon pronostica dónde va a haber fuego.', 'pronostico'],
    ['Penon puede predecir los incendios.', 'pronostico'],
    ['Penon predice.', 'pronostico'],
    ['La alerta llega en 5 minutos.', 'latencia'],
    ['Avisa en segundos.', 'latencia'],
    ['La alerta llega en pocos minutos.', 'latencia'],
    ['Detecta el foco en minutos.', 'latencia'],
    ['Lo ves en tiempo real.', 'latencia'],
    ['La precisión es del 95 %.', 'metrica'],
    ['Cuesta $ 300.000 por mes.', 'precio'],
    ['Sale 200 USD.', 'precio'],
    ['Garantizamos que no se escapa ningún foco.', 'garantia'],
    ['Esto es legalmente vinculante.', 'vinculante'],
    ['Estamos en Río Grande.', 'ciudad'],
    ['Lo usa CENIT.', 'cliente'],
  ])
    assert.equal(filtrar(s), regla, s);
});

test('el pedido: alternado, empieza y termina en el visitante, con topes', () => {
  assert.deepEqual(validarPedido({ mensajes: [{ rol: 'vos', texto: '  ¿Qué es Penon? ' }] }), [{ rol: 'vos', texto: '¿Qué es Penon?' }]);
  const tres = [{ rol: 'vos', texto: 'a' }, { rol: 'taiyin', texto: 'b' }, { rol: 'vos', texto: 'c' }];
  assert.equal(validarPedido({ mensajes: tres }).length, 3);
  for (const malo of [
    null,
    {},
    { mensajes: [] },
    { mensajes: [{ rol: 'taiyin', texto: 'hola' }] },
    { mensajes: tres.slice(0, 2) }, // termina en Taiyin
    { mensajes: [{ rol: 'vos', texto: '   ' }] },
    { mensajes: [{ rol: 'vos', texto: 'x'.repeat(501) }] },
    { mensajes: [{ rol: 'vos', texto: 1 }] },
    { mensajes: Array.from({ length: 17 }, (_, i) => ({ rol: i % 2 ? 'taiyin' : 'vos', texto: 'x' })) },
  ])
    assert.equal(validarPedido(malo), null, JSON.stringify(malo)?.slice(0, 80));
});

test('las tools: solo listas cerradas y campos conocidos', () => {
  assert.deepEqual(validarEntrada('llevar_a', { seccion: 'penon' }), { accion: 'llevar_a', seccion: 'penon' });
  assert.equal(validarEntrada('llevar_a', { seccion: 'admin' }), null);
  assert.equal(validarEntrada('llevar_a', { seccion: 'penon', extra: 1 }), null);
  assert.deepEqual(validarEntrada('fijar', { cosa: 'hown' }), { accion: 'fijar', cosa: 'hown' });
  assert.equal(validarEntrada('fijar', { cosa: 'teken' }), null);
  assert.deepEqual(validarEntrada('recorrido', {}), { accion: 'recorrido' });
  assert.deepEqual(validarEntrada('preparar_reunion', { organizacion: ' Clínica ', interes: 'Ver Kenos', nombre: '' }), {
    accion: 'preparar_reunion',
    organizacion: 'Clínica',
    interes: 'Ver Kenos',
    nombre: '',
  });
  assert.equal(validarEntrada('preparar_reunion', { organizacion: 'x'.repeat(81), interes: '', nombre: '' }), null);
  assert.equal(validarEntrada('borrar_todo', {}), null);
  // cada tool tiene su resultado
  for (const h of HERRAMIENTAS) assert.ok(RESULTADOS[h.name], h.name);
});

test('el limitador corta al pasar el tope y se libera con la ventana', () => {
  const pasa = limitador(2, 1000);
  assert.ok(pasa('a', 0));
  assert.ok(pasa('a', 10));
  assert.ok(!pasa('a', 20));
  assert.ok(pasa('b', 20));
  assert.ok(pasa('a', 1015));
});
