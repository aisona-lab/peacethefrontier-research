import { describe, expect, test } from 'vitest';
import {
	H1_REGIMES,
	H1_SECTORS,
	evaluateDelegationPoint,
	simulateDelegationTrajectory,
	summarizeDelegation,
} from './model';

describe('H1 — Modelo de transición copiloto a agente autónomo', () => {
	test('es determinista para la misma semilla, régimen y sector', () => {
		const a = simulateDelegationTrajectory(7, H1_REGIMES[1]!, H1_SECTORS[0]!);
		const b = simulateDelegationTrajectory(7, H1_REGIMES[1]!, H1_SECTORS[0]!);
		expect(a).toEqual(b);
		expect(a).toHaveLength(11);
	});

	test('mayor fiabilidad por paso y mayor detección reducen monótonamente coste y riesgo', () => {
		const sector = H1_SECTORS[0]!;
		const bajo = evaluateDelegationPoint({
			sector,
			stepReliability: 0.92,
			detectionRate: 0.85,
			computeCost: 1.5,
		});
		const alto = evaluateDelegationPoint({
			sector,
			stepReliability: 0.99,
			detectionRate: 0.96,
			computeCost: 1.5,
		});
		expect(alto.chainReliability).toBeGreaterThan(bajo.chainReliability);
		expect(alto.undetectedTailRisk).toBeLessThan(bajo.undetectedTailRisk);
		expect(alto.agentExpectedCost).toBeLessThan(bajo.agentExpectedCost);
	});

	test('infraestructura de verificación desbloquea sectores de alta responsabilidad frente al régimen conservador', () => {
		const seeds = Array.from({ length: 20 }, (_, i) => i + 1);
		const rows = H1_REGIMES.flatMap((regime) =>
			H1_SECTORS.flatMap((sector) =>
				seeds.flatMap((seed) => simulateDelegationTrajectory(seed, regime, sector)),
			),
		);
		expect(rows).toHaveLength(3300);
		const summary = summarizeDelegation(rows);
		const sciBase = summary.find(
			(s) => s.regime === 'baseline-coevolution' && s.sector === 'computational-science',
		)!;
		const gridCons = summary.find(
			(s) => s.regime === 'conservative' && s.sector === 'energy-grid-dispatch',
		)!;
		const gridVerif = summary.find(
			(s) => s.regime === 'verifier-infrastructure' && s.sector === 'energy-grid-dispatch',
		)!;
		expect(sciBase.median_crossover_year).not.toBeNull();
		expect(sciBase.median_crossover_year!).toBeLessThanOrEqual(2031);
		expect(gridCons.adoption_share_2036).toBe(0);
		expect(gridVerif.adoption_share_2036).toBeGreaterThan(gridCons.adoption_share_2036);
	});
});
