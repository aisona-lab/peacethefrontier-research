import { describe, expect, test } from 'vitest';
import { anioEn, posicion, TRAMOS } from './escala';

describe('escala del tiempo por tramos (design §5)', () => {
	test('los tramos cubren de 3500 a. C. a 2126 y sus anchos suman 1', () => {
		expect(TRAMOS[0].desde).toBe(-3500);
		expect(TRAMOS.at(-1)!.hasta).toBe(2126);
		for (let i = 1; i < TRAMOS.length; i++) expect(TRAMOS[i].desde).toBe(TRAMOS[i - 1].hasta);
		expect(TRAMOS.reduce((s, t) => s + t.ancho, 0)).toBeCloseTo(1, 10);
	});

	test('cada frontera de tramo cae en la suma de los anchos anteriores', () => {
		let acumulado = 0;
		for (const t of TRAMOS) {
			expect(posicion(t.desde)).toBeCloseTo(acumulado, 10);
			acumulado += t.ancho;
		}
		expect(posicion(2126)).toBe(1);
	});

	test('el presente se expande: 2000–2026 ocupa tanto como 3000 años de Antigüedad', () => {
		expect(posicion(2026) - posicion(2000)).toBeCloseTo(posicion(-500) - posicion(-3500), 10);
	});

	test('ida y vuelta, creciente y recortada a la línea', () => {
		let anterior = -1;
		for (let anio = -3500; anio <= 2126; anio += 37) {
			const x = posicion(anio);
			expect(x).toBeGreaterThan(anterior);
			expect(anioEn(x)).toBeCloseTo(anio, 6);
			anterior = x;
		}
		expect(posicion(-9000)).toBe(0);
		expect(posicion(3000)).toBe(1);
	});
});
