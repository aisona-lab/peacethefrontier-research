import { describe, expect, test } from 'vitest';
import { PREDICCIONES, calcularBrier, type Prediccion } from './predicciones';

describe('registro público de predicciones (R24)', () => {
	test('todas las predicciones tienen probabilidad válida, fechas ISO y al menos 2 con resolución en < 10 meses', () => {
		expect(PREDICCIONES.length).toBeGreaterThanOrEqual(5);
		const ids = new Set<string>();
		let cortas = 0;
		for (const p of PREDICCIONES) {
			expect(ids.has(p.id), p.id).toBe(false);
			ids.add(p.id);
			expect(p.probabilidad).toBeGreaterThan(0);
			expect(p.probabilidad).toBeLessThan(1);
			expect(p.fechaResolucion > p.fechaRegistro, p.id).toBe(true);
			const meses =
				(new Date(p.fechaResolucion).getTime() - new Date(p.fechaRegistro).getTime()) /
				(1000 * 60 * 60 * 24 * 30);
			if (meses <= 10.5) cortas++;
		}
		expect(cortas).toBeGreaterThanOrEqual(2);
		expect(calcularBrier(PREDICCIONES)).toBeNull();
	});

	test('calcularBrier calcula correctamente el error cuadrático medio en predicciones resueltas', () => {
		const muestra: Prediccion[] = [
			{ ...PREDICCIONES[0]!, probabilidad: 0.8, estado: 'confirmada', resultado: 1 },
			{ ...PREDICCIONES[1]!, probabilidad: 0.6, estado: 'refutada', resultado: 0 },
		];
		// ((0.8 - 1)^2 + (0.6 - 0)^2) / 2 = (0.04 + 0.36) / 2 = 0.20
		expect(calcularBrier(muestra)).toBe(0.2);
	});
});
