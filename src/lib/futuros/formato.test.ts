import { describe, expect, test } from 'vitest';
import { celdaConBanda, formatear, INDICES_DECADAS, porcentaje } from './formato';
import type { Resultado, Series } from './tipos';

// Intl usa espacios de no separación; los normalizamos para comparar.
const f = (...args: Parameters<typeof formatear>) => formatear(...args).replace(/[  ]/g, ' ');

describe('formato de indicadores', () => {
	test('porcentajes', () => {
		expect(f('automatizacion', 0.412, 'es')).toBe('41 %');
		expect(f('automatizacion', 0.412, 'en')).toBe('41%');
		expect(f('riesgo', 0.079, 'es')).toBe('7,9 %');
		expect(f('riesgo', 0.328, 'en')).toBe('33%');
	});

	test('miles de millones y millones', () => {
		expect(f('robots', 2.13, 'es')).toBe('2,1 mil millones');
		expect(f('robots', 2.13, 'en')).toBe('2.1 billion');
		expect(f('robots', 0.51, 'es')).toBe('510 millones');
		expect(f('robots', 0.0051, 'en')).toBe('5.1 million');
		expect(f('poblacion', 10.18, 'es')).toBe('10,2 mil millones');
	});

	test('temperatura, energía, índices y ciencia', () => {
		expect(f('temperatura', 2.04, 'es')).toBe('2,0 °C');
		expect(f('energiaIA', 1008.4, 'en')).toBe('1,008 TWh');
		expect(f('poder', 84.3, 'es')).toBe('84/100');
		expect(f('ciencia', 9.71, 'es')).toBe('×9,7');
	});

	test('capacidad en palabras, sin abreviaturas ambiguas (en español "B" puede leerse como billón)', () => {
		expect(f('capacidad', 0, 'es')).toBe('×1');
		expect(f('capacidad', Math.log10(25_119), 'es')).toBe('×25 mil');
		expect(f('capacidad', 6, 'es')).toBe('×1 millón');
		expect(f('capacidad', 8.1, 'es')).toBe('×126 millones');
		expect(f('capacidad', 11.7, 'es')).toBe('×501 mil millones');
		expect(f('capacidad', 12, 'es')).toBe('×1 billón');
		expect(f('capacidad', 4, 'en')).toBe('×10 thousand');
		expect(f('capacidad', 9, 'en')).toBe('×1 billion');
		expect(f('capacidad', 12.3, 'en')).toBe('×2 trillion');
	});
});

describe('tablas', () => {
	test('celda con mediana y banda', () => {
		const serie = (v: number) => ({ temperatura: [v] }) as unknown as Series;
		const r: Resultado = { anios: [2026], p10: serie(1.3), p50: serie(1.42), p90: serie(1.55), eventos: [] };
		expect(celdaConBanda('temperatura', r, 0, 'es').replace(/[  ]/g, ' ')).toBe('1,4 °C (1,3 °C–1,6 °C)');
	});

	test('décadas de 2026 a 2126', () => {
		expect(INDICES_DECADAS).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
	});

	test('porcentaje de los controles', () => {
		expect(porcentaje('es', 0.85).replace(/[  ]/g, ' ')).toBe('85 %');
		expect(porcentaje('en', 0.85)).toBe('85%');
	});
});
