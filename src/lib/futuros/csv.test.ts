import { expect, test } from 'vitest';
import { aCsv } from './csv';
import { proyectar } from './montecarlo';
import { ANIOS, INDICADORES } from './tipos';

const r = proyectar({ paz: 0.85, frontera: 0.15 });
const lineas = aCsv(r).trimEnd().split('\n');

test('una fila por año e indicador, con cabecera', () => {
	expect(lineas[0]).toBe('anio,indicador,unidad,p10,p50,p90');
	expect(lineas).toHaveLength(1 + ANIOS * INDICADORES.length);
});

test('números con punto decimal y percentiles en orden', () => {
	const fila = lineas.find((l) => l.startsWith('2100,temperatura,'))?.split(',') ?? [];
	expect(fila[2]).toBe('celsius');
	const [p10, p50, p90] = fila.slice(3).map(Number);
	expect(p50).toBeCloseTo(r.p50.temperatura[2100 - 2026], 3);
	expect(p10).toBeLessThanOrEqual(p50);
	expect(p50).toBeLessThanOrEqual(p90);
});
