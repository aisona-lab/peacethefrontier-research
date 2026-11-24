import { describe, expect, test } from 'vitest';
import { simular } from './modelo';
import { PARAMETROS, valoresCentrales } from './parametros';
import { sensibilidad } from './sensibilidad';

const centro = { paz: 0.5, frontera: 0.5 };
const k = valoresCentrales();

describe('sensibilidad (una a una, en el centro)', () => {
	test('un efecto por parámetro, ordenados de mayor a menor oscilación', () => {
		const efectos = sensibilidad(centro, 'temperatura', 2100);
		expect(efectos).toHaveLength(Object.keys(PARAMETROS).length);
		const oscilaciones = efectos.map((e) => Math.abs(e.alto - e.bajo));
		expect(oscilaciones).toEqual([...oscilaciones].sort((a, b) => b - a));
	});

	test('mueve solo un parámetro a su mínimo y a su máximo', () => {
		const tcre = sensibilidad(centro, 'temperatura', 2100).find((e) => e.parametro === 'tcre');
		const i = 2100 - 2026;
		expect(tcre?.bajo).toBeCloseTo(simular(centro, { ...k, tcre: PARAMETROS.tcre.min }).temperatura[i], 10);
		expect(tcre?.alto).toBeCloseTo(simular(centro, { ...k, tcre: PARAMETROS.tcre.max }).temperatura[i], 10);
	});

	test('un parámetro que no entra en el indicador no lo mueve', () => {
		const mu = sensibilidad(centro, 'temperatura', 2100).find((e) => e.parametro === 'mu');
		expect(mu?.alto).toBe(mu?.bajo);
	});

	test('el texto de /futuros/ dice que h_conf es lo que más mueve el riesgo en 2100 (si cambia, revisa el texto)', () => {
		expect(sensibilidad(centro, 'riesgo', 2100)[0].parametro).toBe('hConf');
	});

	test('rechaza años fuera del modelo', () => {
		expect(() => sensibilidad(centro, 'riesgo', 2200)).toThrow(/2026.*2126/);
	});
});
