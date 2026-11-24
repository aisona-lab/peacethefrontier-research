import { describe, expect, test } from 'vitest';
import { simular } from './modelo';
import { CORRIDAS, mulberry32, muestrear, percentil, proyectar, SEMILLA } from './montecarlo';
import { PARAMETROS } from './parametros';
import { ANIOS, INDICADORES, VARIABLES } from './tipos';

describe('azar con semilla', () => {
	test('la misma semilla repite la secuencia y otra semilla la cambia', () => {
		const a = mulberry32(2026);
		const b = mulberry32(2026);
		const c = mulberry32(7);
		const sa = [a(), a(), a()];
		expect([b(), b(), b()]).toEqual(sa);
		expect([c(), c(), c()]).not.toEqual(sa);
		for (const v of sa) expect(v).toBeGreaterThanOrEqual(0);
		for (const v of sa) expect(v).toBeLessThan(1);
	});

	test('muestrear respeta cada rango y redondea los enteros', () => {
		const azar = mulberry32(1);
		for (let i = 0; i < 50; i++) {
			const v = muestrear(azar);
			for (const [nombre, p] of Object.entries(PARAMETROS)) {
				const valor = v[nombre as keyof typeof v];
				expect(valor).toBeGreaterThanOrEqual(p.min);
				expect(valor).toBeLessThanOrEqual(p.max);
			}
			expect(Number.isInteger(v.dCrisis)).toBe(true);
		}
	});
});

describe('percentil', () => {
	test('interpola entre posiciones', () => {
		expect(percentil([0, 10, 20, 30, 40], 0.5)).toBe(20);
		expect(percentil([0, 10, 20, 30, 40], 0.1)).toBe(4);
		expect(percentil([5], 0.9)).toBe(5);
	});
});

describe('proyectar', () => {
	const pos = { paz: 0.3, frontera: 0.7 };

	test('es determinista con la misma semilla', () => {
		expect(proyectar(pos)).toEqual(proyectar(pos));
	});

	test('la banda contiene a la mediana en cada año e indicador', () => {
		const r = proyectar(pos);
		expect(r.anios[0]).toBe(2026);
		expect(r.anios.at(-1)).toBe(2126);
		for (const ind of INDICADORES)
			r.p50[ind].forEach((m, t) => {
				expect(r.p10[ind][t]).toBeLessThanOrEqual(m);
				expect(m).toBeLessThanOrEqual(r.p90[ind][t]);
			});
	});

	test('los percentiles son los de ordenar cada año desde cero', () => {
		for (const posicion of [{ paz: 0.15, frontera: 0.85 }, { paz: 0.85, frontera: 0.15 }]) {
			const r = proyectar(posicion);
			const azar = mulberry32(SEMILLA);
			const sims = Array.from({ length: CORRIDAS }, () => simular(posicion, muestrear(azar)));
			for (const v of VARIABLES)
				for (let t = 0; t < ANIOS; t++) {
					const orden = Float64Array.from(sims, (s) => s[v][t]).sort();
					expect(r.p10[v][t], `${v} ${t}`).toBe(percentil(orden, 0.1));
					expect(r.p50[v][t], `${v} ${t}`).toBe(percentil(orden, 0.5));
					expect(r.p90[v][t], `${v} ${t}`).toBe(percentil(orden, 0.9));
				}
		}
	});

	test('200 corridas gastan menos de 25 ms de CPU en la mediana de 7 (75 ms en CI)', () => {
		// La mediana, no el mínimo: el mínimo escondía que el recálculo rozaba los 50 ms (revisión final, hallazgo 4).
		// Tiempo de CPU de este proceso (Vitest corre cada archivo en el suyo): otras pruebas en paralelo no lo inflan.
		proyectar(pos);
		const tiempos = Array.from({ length: 7 }, (_, i) => {
			const inicio = process.cpuUsage();
			proyectar({ paz: 0.1 * i, frontera: 0.4 });
			const { user, system } = process.cpuUsage(inicio);
			return (user + system) / 1000;
		}).sort((a, b) => a - b);
		expect(tiempos[3]).toBeLessThan(process.env.CI ? 75 : 25);
	});
});
