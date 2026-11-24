import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { PARAMETROS, valoresCentrales, type Parametro } from './parametros';
import { validarParametros } from './validar-parametros';
import { poblacionOnu } from './datos-onu';

describe('parámetros', () => {
	test('todos los parámetros reales son válidos', () => {
		expect(() => validarParametros()).not.toThrow();
	});

	test('un valor central fuera de su rango rompe con el nombre del parámetro', () => {
		const roto: Record<string, Parametro> = {
			tcre: { ...PARAMETROS.tcre, central: 0.9 },
		};
		expect(() => validarParametros(roto)).toThrow('Parámetro tcre: el valor central queda fuera del rango');
	});

	test('cada parámetro declara procedencia; las relaciones con evidencia exigen fuente', () => {
		for (const [nombre, p] of Object.entries(PARAMETROS)) {
			expect(['observado', 'estimado', 'derivado', 'calibrado', 'supuesto'], nombre).toContain(p.relacion);
			if (p.relacion !== 'supuesto') expect(p.fuente, nombre).toMatch(/^[a-z0-9-]+$/);
		}
	});

	test('ningún valor se atribuye a una fuente que no lo da (revisión final, hallazgo 1)', () => {
		const relacion = (n: keyof typeof PARAMETROS) => PARAMETROS[n].relacion;
		// eTot0: la AIE da el crecimiento de la electricidad mundial, no el total (revisión de la fase G).
		for (const n of ['a0', 'kMin', 'kMax', 'eTot0'] as const) expect(relacion(n), n).toBe('supuesto');
		for (const n of ['l50', 'eps', 'hNat', 'hIa', 'hConf', 'zOnu'] as const) expect(relacion(n), n).toBe('calibrado');
		for (const n of ['gMax', 'gMin', 'rMin'] as const) expect(relacion(n), n).toBe('derivado');
		for (const n of ['gini0', 'r0', 'eia0', 'e0', 'te0', 'q0', 'em0', 'u0', 't0', 'tcre'] as const) expect(relacion(n), n).toBe('estimado');
	});

	test('valoresCentrales devuelve el central de cada parámetro', () => {
		const v = valoresCentrales();
		expect(v.tcre).toBe(0.45);
		expect(Object.keys(v)).toHaveLength(Object.keys(PARAMETROS).length);
	});
});

describe('población de la ONU', () => {
	test('interpola la variante media entre puntos', () => {
		expect(poblacionOnu(2025)).toBeCloseTo(8.23, 5);
		expect(poblacionOnu(2027.5)).toBeCloseTo(8.4, 5);
	});

	test('el máximo cae a mediados de los 2080 y 2100 queda en 10,2 mil millones (resumen WPP 2024)', () => {
		const anios = Array.from({ length: 76 }, (_, i) => 2025 + i);
		const pico = anios.reduce((a, b) => (poblacionOnu(b) > poblacionOnu(a) ? b : a));
		expect(pico).toBeGreaterThanOrEqual(2080);
		expect(pico).toBeLessThanOrEqual(2089);
		expect(poblacionOnu(2100)).toBeCloseTo(10.2, 1);
	});

	test('después de 2100 prolonga la tasa 2095–2100', () => {
		const tasa = (10.18 / 10.24) ** (1 / 5);
		expect(poblacionOnu(2110)).toBeCloseTo(10.18 * tasa ** 10, 6);
	});
});

test('parametros.ts no importa Zod: lo usa la isla y Zod en el navegador intenta eval (bloqueado por la CSP)', () => {
	expect(readFileSync('src/lib/futuros/parametros.ts', 'utf8')).not.toMatch(/from 'astro\/zod'|from 'zod'/);
});

describe('validación de procedencia', () => {
 test.each(['observado', 'estimado', 'derivado', 'calibrado'] as const)('%s exige fuente', relacion => {
  const { fuente, ...p } = PARAMETROS.gMax;
  expect(() => validarParametros({ roto: {...p, relacion} })).toThrow('fuente');
 });
 test.each(['unidad', 'periodo', 'notas'] as const)('rechaza %s ausente o sin traducción', campo => {
  for (const valor of [undefined, { es: 'válido' }, {es: 'válido', en: '  '}]) {
   expect(() => validarParametros({ roto: {...PARAMETROS.gMax, [campo]: valor} as Parametro })).toThrow('Parámetro roto');
  }
 });
 test('no acepta la etiqueta ambigua dato', () => {
  expect(() => validarParametros({roto: {...PARAMETROS.tcre, relacion: 'dato'} as unknown as Parametro})).toThrow();
 });
});
