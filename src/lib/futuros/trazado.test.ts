import { describe, expect, test } from 'vitest';
import { ESCALAS, GRAFICOS, rutaBanda, rutaLinea, xAnio, yValor } from './trazado';
import { INDICADORES } from './tipos';

const escala = { min: 0, max: 1 };

describe('trazado SVG', () => {
	test('línea: x reparte los años, y invierte el valor', () => {
		expect(rutaLinea([0, 0.5, 1], escala, 100, 50)).toBe('M0,50L50,25L100,0');
	});

	test('banda: arriba de ida, abajo de vuelta, cerrada', () => {
		expect(rutaBanda([0, 0], [1, 1], escala, 10, 10)).toBe('M0,0L10,0L10,10L0,10Z');
	});

	test('los valores fuera de escala se pegan al borde', () => {
		expect(yValor(2, escala, 10)).toBe(0);
		expect(yValor(-1, escala, 10)).toBe(10);
	});

	test('escala logarítmica', () => {
		expect(yValor(1000, { min: 100, max: 100_000, log: true }, 30)).toBe(20);
	});

	test('x del último año es el ancho completo', () => {
		expect(xAnio(100, 101, 200)).toBe(200);
	});

	test('cada indicador tiene escala y aparece en exactamente un gráfico', () => {
		const enGraficos = GRAFICOS.flatMap((g) => g.series);
		for (const ind of INDICADORES) {
			expect(ESCALAS[ind]).toBeDefined();
			expect(enGraficos.filter((s) => s === ind)).toHaveLength(1);
		}
	});
});
