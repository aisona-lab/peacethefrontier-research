import { describe, expect, test } from 'vitest';
import { OBJETIVOS, evaluar, anioUmbral } from './calibracion';
import { proyectar } from './montecarlo';
import { ANIO_INICIAL } from './tipos';

describe('calibración contra datos y estimaciones publicadas (spec §5.6)', () => {
	for (const objetivo of OBJETIVOS)
		test(objetivo.descripcion.es, () => {
			const { valor, cumple } = evaluar(objetivo);
			expect(cumple, `${objetivo.id} = ${valor}, esperado entre ${objetivo.min} y ${objetivo.max}`).toBe(true);
		});
});

describe('honestidad de la calibración (revisión final, hallazgo 8)', () => {
	test('se evalúa sobre las medianas de Monte Carlo, que es lo que muestran las páginas', () => {
		const p50 = proyectar({ paz: 0.5, frontera: 0.5 }).p50.temperatura;
		const media = p50.slice(2081 - ANIO_INICIAL, 2100 - ANIO_INICIAL + 1).reduce((a, b) => a + b, 0) / 20;
		const objetivo = OBJETIVOS.find((o) => o.id === 'temp-centro')!;
		expect(objetivo.valor()).toBeCloseTo(media, 10);
	});

	test('no quedan objetivos que se cumplen por construcción', () => {
		expect(OBJETIVOS.map((o) => o.id)).not.toContain('computo-anual');
	});

	test('cada objetivo dice qué clase de referencia es', () => {
		for (const o of OBJETIVOS) expect(['oficial', 'industria', 'expertos'], o.id).toContain(o.tipo);
	});
});

// An absent crossing must never become a plausible year (2025).
describe('umbrales de calibración', () => {
 test.each([
  [[], null], [[0.1, 0.49], null], [[0.5, 0.6], 2026], [[0.1, 0.5], 2027],
 ] as [number[], number | null][])('primera fecha para %j: %s', (valores, esperado) => {
  expect(anioUmbral(valores, 0.5)).toBe(esperado);
 });
 test('un umbral no alcanzado falla incluso si el rango incluye cero', () => {
  expect(evaluar({ ...OBJETIVOS[0], min: 0, max: 1, valor: () => null })).toEqual({ valor: null, cumple: false });
 });
});
