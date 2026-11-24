import { describe, expect, test } from 'vitest';
import { fronteraDe, fronteraSinRecorte, CRECIMIENTO_COMPUTO, HOY, SENALES_PAZ } from './hoy';
import { cuadranteCercano } from './posicion';

const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

describe('el punto de hoy', () => {
	test('la frontera sale del crecimiento medido del cómputo: 4,5× al año es el máximo del modelo', () => {
		expect(fronteraDe(4.5)).toBeCloseTo(1, 6);
		expect(fronteraDe(1.35)).toBeCloseTo(0, 6);
		expect(fronteraDe(4)).toBeCloseTo(0.9, 2);
		expect(fronteraDe(6)).toBe(1);
		expect(fronteraDe(1)).toBe(0);
	});

	test('la frontera de hoy va de 4× a 5× al año (Epoch AI)', () => {
		expect(HOY.frontera.min).toBeCloseTo(fronteraDe(4), 10);
		expect(HOY.frontera.max).toBe(1);
		expect(HOY.frontera.central).toBeCloseTo(1, 6);
	});

	test('la paz es la media de la rúbrica, con su rango', () => {
		expect(HOY.paz.min).toBeCloseTo(media(SENALES_PAZ.map((s) => s.min)), 10);
		expect(HOY.paz.max).toBeCloseTo(media(SENALES_PAZ.map((s) => s.max)), 10);
		expect(HOY.paz.central).toBeCloseTo((HOY.paz.min + HOY.paz.max) / 2, 10);
	});

	test('cada señal tiene un rango dentro de [0, 1] y al menos una fuente', () => {
		expect(SENALES_PAZ.length).toBeGreaterThanOrEqual(4);
		for (const s of SENALES_PAZ) {
			expect(0 <= s.min && s.min <= s.max && s.max <= 1, s.id).toBe(true);
			expect(s.fuentes.length, s.id).toBeGreaterThan(0);
		}
	});

	test('el texto de /futuros/ dice que hoy cae en Carrera (si cambia, revisa el texto)', () => {
		expect(cuadranteCercano({ paz: HOY.paz.central, frontera: HOY.frontera.central })).toBe('carrera');
	});
});

test('el marcador acotado conserva el crecimiento y la coordenada sin recorte', () => {
 expect(CRECIMIENTO_COMPUTO).toEqual({central: 4.5, min: 4, max: 5});
 expect(fronteraSinRecorte(5)).toBeCloseTo(1.08751, 4);
 expect(fronteraSinRecorte(1)).toBeLessThan(0);
 expect(fronteraDe(5)).toBe(1);
 expect(fronteraDe(1)).toBe(0);
});
