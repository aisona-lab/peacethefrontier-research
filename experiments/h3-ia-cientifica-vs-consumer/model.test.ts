import { describe, expect, test } from 'vitest';
import {
	H3_DOMAINS,
	amdahlDiscoverySpeedup,
	simulateDomainTrajectory,
	summarizeDomains,
} from './model';

describe('H3 — Modelo de embudo con oráculo verificable frente a IA consumer', () => {
	test('la ley de Amdahl limita la aceleración efectiva cuando la validación física no escala', () => {
		const res = amdahlDiscoverySpeedup({
			inSilicoSpeedup: 1000,
			physicalSpeedup: 1,
			physicalBottleneckShare: 0.5,
		});
		expect(res.effectiveSpeedup).toBeLessThan(2.01);
		expect(res.physicalTimeShare).toBeGreaterThan(0.99);
	});

	test('los dominios con oráculo físico superan en excedente por unidad de cómputo al régimen consumer y desplazan el cuello de botella al laboratorio', () => {
		const seeds = Array.from({ length: 25 }, (_, i) => i + 1);
		const rows = H3_DOMAINS.flatMap((spec) =>
			seeds.flatMap((seed) => simulateDomainTrajectory(seed, spec)),
		);
		expect(rows).toHaveLength(1500);
		const summary = summarizeDomains(rows);

		const sci = summary.filter((s) => s.domain_class === 'scientific-oracle');
		const cons = summary.filter((s) => s.domain_class === 'consumer-attention');
		const minSciEfficiency = Math.min(...sci.map((s) => s.mean_surplus_per_pflop_2035));
		const maxConsEfficiency = Math.max(...cons.map((s) => s.mean_surplus_per_pflop_2035));

		expect(minSciEfficiency).toBeGreaterThan(maxConsEfficiency * 3);
		const materials = summary.find((s) => s.domain === 'materials-discovery')!;
		expect(materials.mean_physical_bottleneck_2035).toBeGreaterThan(0.8);
	});
});
