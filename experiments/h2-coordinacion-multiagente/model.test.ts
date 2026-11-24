import { describe, expect, test } from 'vitest';
import {
	H2_CAPABILITY_LEVELS,
	H2_REGIMES,
	simulateCoordinationScenario,
	summarizeCoordination,
} from './model';

describe('H2 — Simulación de coordinación multi-agente y ley de Goodhart', () => {
	test('es determinista por semilla, régimen y multiplicador de capacidad', () => {
		const a = simulateCoordinationScenario(11, 'static-benchmark-gate', 10);
		const b = simulateCoordinationScenario(11, 'static-benchmark-gate', 10);
		expect(a).toEqual(b);
	});

	test('escalar capacidad sin coordinación empeora fallos sistémicos y la brecha de Goodhart crece en benchmarks estáticos', () => {
		const seeds = Array.from({ length: 25 }, (_, i) => i + 1);
		const rows = H2_REGIMES.flatMap((regime) =>
			H2_CAPABILITY_LEVELS.flatMap((cap) =>
				seeds.map((seed) => simulateCoordinationScenario(seed, regime, cap)),
			),
		);
		expect(rows).toHaveLength(500);
		const summary = summarizeCoordination(rows);

		const raceLow = summary.find((s) => s.regime === 'uncoordinated-race' && s.capability_multiplier === 1)!;
		const raceHigh = summary.find((s) => s.regime === 'uncoordinated-race' && s.capability_multiplier === 25)!;
		expect(raceHigh.mean_incident_rate).toBeGreaterThan(raceLow.mean_incident_rate * 2.5);

		const gateLow = summary.find((s) => s.regime === 'static-benchmark-gate' && s.capability_multiplier === 1)!;
		const gateHigh = summary.find((s) => s.regime === 'static-benchmark-gate' && s.capability_multiplier === 25)!;
		expect(gateHigh.mean_goodhart_divergence).toBeGreaterThan(gateLow.mean_goodhart_divergence * 2);

		const coordinatedMod = summary.find((s) => s.regime === 'adaptive-interoperability' && s.capability_multiplier === 10)!;
		expect(coordinatedMod.mean_incident_rate).toBeLessThan(raceHigh.mean_incident_rate * 0.35);
		expect(coordinatedMod.mean_net_welfare).toBeGreaterThan(raceHigh.mean_net_welfare);
	});
});
