import { describe, expect, test } from 'vitest';
import { simular } from './modelo';
import { valoresCentrales, type Valores } from './parametros';
import { ANIOS, INDICADORES, VARIABLES } from './tipos';

const k = valoresCentrales();
const PASOS = [0, 0.25, 0.5, 0.75, 1];

describe('modelo', () => {
	test('devuelve 101 años (2026–2126) para cada variable', () => {
		const s = simular({ paz: 0.5, frontera: 0.5 }, k);
		for (const v of VARIABLES) expect(s[v]).toHaveLength(ANIOS);
	});

	test('arranca en los valores de 2026', () => {
		const s = simular({ paz: 0.5, frontera: 0.5 }, k);
		expect(s.capacidad[0]).toBe(0);
		expect(s.automatizacion[0]).toBeCloseTo(k.a0, 10);
		expect(s.robots[0]).toBe(k.r0);
		expect(s.temperatura[0]).toBe(k.t0);
		expect(s.riesgo[0]).toBe(0);
		expect(s.riesgo[1]).toBeGreaterThan(0);
	});

	test('en 2026 todos los futuros parten del mismo mundo', () => {
		const hoy = simular({ paz: 0.5, frontera: 0.5 }, k);
		for (const paz of PASOS)
			for (const frontera of PASOS) {
				const s = simular({ paz, frontera }, k);
				for (const ind of INDICADORES) expect(s[ind][0], ind).toBeCloseTo(hoy[ind][0], 10);
			}
		expect(hoy.poder[0]).toBe(k.pi0);
	});

	test('invariantes: nada infinito, fracciones en [0, 1], índices en su rango', () => {
		for (const paz of PASOS)
			for (const frontera of PASOS) {
				const s = simular({ paz, frontera }, k);
				for (const ind of INDICADORES) for (const v of s[ind]) expect(Number.isFinite(v)).toBe(true);
				for (const ind of ['automatizacion', 'empleo', 'energiaLimpia', 'riesgo'] as const)
					for (const v of s[ind]) {
						expect(v).toBeGreaterThanOrEqual(0);
						expect(v).toBeLessThanOrEqual(1);
					}
				for (const v of s.poder) expect(v).toBeGreaterThanOrEqual(0);
				for (const v of s.poder) expect(v).toBeLessThanOrEqual(100);
				for (const v of s.desigualdad) expect(v).toBeGreaterThanOrEqual(20);
				for (const v of s.desigualdad) expect(v).toBeLessThanOrEqual(90);
			}
	});

	test('la temperatura cumple exactamente la relación TCRE con emisiones constantes', () => {
		const fijo: Valores = { ...k, qRate: 0, gammaMin: 0, gammaMax: 0, eia0: 0, u0: 0, em0: 40 };
		const s = simular({ paz: 0.5, frontera: 0.5 }, fijo);
		expect(s.emisiones[3]).toBeCloseTo(40, 10);
		expect(s.temperatura[10]).toBeCloseTo(k.t0 + (k.tcre * 40 * 10) / 1000, 10);
	});

	test('más frontera da más capacidad en 2126, con la paz fija', () => {
		for (const paz of PASOS) {
			const capacidades = PASOS.map((frontera) => simular({ paz, frontera }, k).capacidad[100]);
			expect(capacidades).toEqual([...capacidades].sort((a, b) => a - b));
		}
	});

	test('más paz da menos riesgo en 2126, con la frontera fija', () => {
		for (const frontera of PASOS) {
			const riesgos = PASOS.map((paz) => simular({ paz, frontera }, k).riesgo[100]);
			expect(riesgos).toEqual([...riesgos].sort((a, b) => b - a));
		}
	});

	test('el riesgo acumulado empieza en 0 en 2026: todavía no ha pasado ningún año', () => {
		for (const paz of PASOS) for (const frontera of PASOS) expect(simular({ paz, frontera }, k).riesgo[0]).toBe(0);
	});

	test('la electricidad de la IA nunca supera su cuota máxima de la electricidad mundial', () => {
		for (const paz of PASOS)
			for (const frontera of PASOS) {
				const s = simular({ paz, frontera }, k);
				s.energiaIA.forEach((v, t) => expect(v).toBeLessThanOrEqual(k.cuotaIA * s.electricidad[t] + 1e-9));
			}
	});

	test('la paz alta no elimina la concentración del poder: con mucha IA aparece la institucional', () => {
		const fronteraEnPaz = simular({ paz: 0.85, frontera: 0.85 }, k).poder;
		expect(fronteraEnPaz[100]).toBeGreaterThan(fronteraEnPaz[0] + 5);
		const carrera = simular({ paz: 0.15, frontera: 0.85 }, k).poder;
		expect(carrera[100]).toBeGreaterThan(fronteraEnPaz[100]);
	});

	test('con poca paz estallan crisis cada 15 años desde 2035; con mucha paz, ninguna', () => {
		const inicios = (paz: number) => {
			const c = simular({ paz, frontera: 0.5 }, k).crisis;
			return c.flatMap((v, t) => (v === 1 && (t === 0 || c[t - 1] === 0) ? [2026 + t] : []));
		};
		expect(inicios(0.15).slice(0, 3)).toEqual([2035, 2050, 2065]);
		expect(inicios(0.85)).toEqual([]);
	});

	test('una crisis dura D años y frena la capacidad', () => {
		const s = simular({ paz: 0.15, frontera: 0.85 }, k);
		expect(s.crisis.slice(9, 15)).toEqual([1, 1, 1, 1, 1, 0]);
		const crecimientoEnCrisis = s.capacidad[11] - s.capacidad[10];
		const crecimientoSinCrisis = s.capacidad[16] - s.capacidad[15];
		expect(crecimientoEnCrisis).toBeLessThan(crecimientoSinCrisis);
	});
});
