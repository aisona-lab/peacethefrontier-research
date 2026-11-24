import { describe, expect, test } from 'vitest';
import { detectarEventos, textoEvento } from './eventos';
import { ANIOS, seriesVacias, VARIABLES, type Series } from './tipos';

/** Series planas en 0 salvo lo que se sobrescriba. */
function series(cambios: Partial<Record<keyof Series, (t: number) => number>>): Series {
	const s = seriesVacias();
	for (const v of VARIABLES)
		for (let t = 0; t < ANIOS; t++) s[v].push(cambios[v]?.(t) ?? (v === 'emisiones' ? 40 : 0));
	return s;
}

describe('eventos', () => {
	test('se dispara una vez, en el primer año que cruza el umbral', () => {
		const ev = detectarEventos(series({ automatizacion: (t) => t / 50 }));
		expect(ev.filter((e) => e.id === 'ia-mitad-tareas')).toEqual([{ id: 'ia-mitad-tareas', anio: 2051 }]);
	});

	test('las crisis se registran en cada inicio', () => {
		const ev = detectarEventos(series({ crisis: (t) => (t >= 9 && t < 14) || (t >= 24 && t < 29) ? 1 : 0 }));
		expect(ev.filter((e) => e.id === 'crisis').map((e) => e.anio)).toEqual([2035, 2050]);
	});

	test('el pico de población corresponde al máximo anterior al descenso', () => {
		const ev = detectarEventos(series({ poblacion: (t) => 10 - Math.abs(t - 60) / 100 }));
		expect(ev.find((e) => e.id === 'pico-poblacion')?.anio).toBe(2086);
	});

	test('sale en orden cronológico', () => {
		const ev = detectarEventos(series({ temperatura: (t) => 1.4 + t / 20, robots: (t) => t / 30 }));
		const anios = ev.map((e) => e.anio);
		expect(anios).toEqual([...anios].sort((a, b) => a - b));
	});

	test('textoEvento traduce y devuelve el id si no lo conoce', () => {
		expect(textoEvento('crisis', 'en')).toMatch(/global crisis/);
		expect(textoEvento('desconocido', 'es')).toBe('desconocido');
	});
});

describe('pico de población en series límite', () => {
 test.each([
  [[8, 9, 9, 9, 8], 2029],
  [[9, 8, 7], 2026],
  [[8, 9, 10], undefined],
  [[9, 9, 9], undefined],
  [[8, 9, 9], undefined],
  [[8, 9, 8, 10, 9], 2029],
 ] as [number[], number | undefined][])('máximo de %j: %s', (poblacion, esperado) => {
  const s = series({});
  s.poblacion = poblacion;
  expect(detectarEventos(s).find(e => e.id === 'pico-poblacion')?.anio).toBe(esperado);
 });
});
