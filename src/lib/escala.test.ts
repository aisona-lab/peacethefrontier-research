import { describe, expect, test } from 'vitest';
import { BANDAS, BANDA_IDS, EXP_MAX, EXP_MIN, HITOS, exponente, posicion } from './escala';

describe('regla de escala', () => {
	test('los extremos caen en 0 % y 100 %', () => {
		expect(posicion(EXP_MIN)).toBe(0);
		expect(posicion(EXP_MAX)).toBe(100);
		expect(posicion(0)).toBeCloseTo(27.03, 2);
	});

	test('las bandas son contiguas y cubren toda la regla', () => {
		expect(BANDAS.map((b) => b.id)).toEqual([...BANDA_IDS]);
		expect(BANDAS[0].desde).toBe(EXP_MIN);
		expect(BANDAS.at(-1)!.hasta).toBe(EXP_MAX);
		BANDAS.slice(1).forEach((b, i) => expect(b.desde).toBe(BANDAS[i].hasta));
	});

	test('los hitos están dentro de la regla y en orden', () => {
		const exps = HITOS.map((h) => h.exp);
		expect(exps).toEqual([...exps].sort((a, b) => a - b));
		exps.forEach((e) => expect(e).toBeGreaterThanOrEqual(EXP_MIN));
		exps.forEach((e) => expect(e).toBeLessThanOrEqual(EXP_MAX));
	});

	test('el exponente usa el signo menos tipográfico', () => {
		expect(exponente(-10)).toBe('−10');
		expect(exponente(0)).toBe('0');
		expect(exponente(27)).toBe('27');
	});
});
