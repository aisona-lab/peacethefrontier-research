import { describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { buildArtifactBundle } from '../../../scripts/generar-resiliencia.ts';
import { createScenario, POLICIES, simulateContinuity, summarizePolicies, type Policy } from './resilience';

const small: Policy = { id: 'fixture', capacitySlots: 10, recoverySlotsPerHour: 2 };
const fixture = (demand: number[], shocks: number[]) => demand.map((demandServiceUnits, hour) => ({
	hour, demandServiceUnits, requestedUnavailableSlots: shocks[hour] ?? 0,
}));

describe('synthetic continuity: conserved capacity and hourly service', () => {
	test('serves bounded demand in a healthy system without inventing repairs', () => {
		const rows = simulateContinuity({ seed: 1, policy: small, scenario: fixture([0, 7, 15], []) });
		expect(rows.map(r => r.served_service_units)).toEqual([0, 7, 10]);
		expect(rows.map(r => r.unmet_service_units)).toEqual([0, 0, 5]);
		expect(rows.map(r => r.recovered_slots)).toEqual([0, 0, 0]);
		expect(rows.map(r => r.service_ratio)).toEqual([1, 1, 2 / 3]);
	});

	test('a six-slot interruption recovers only after service, over three hours', () => {
		const rows = simulateContinuity({ seed: 1, policy: small, scenario: fixture([10, 10, 10, 10], [6]) });
		expect(rows.map(r => r.served_service_units)).toEqual([4, 6, 8, 10]);
		expect(rows.map(r => r.unavailable_end_slots)).toEqual([4, 2, 0, 0]);
		expect(rows.map(r => r.recovered_slots)).toEqual([2, 2, 2, 0]);
		expect(rows.map(r => r.recovered_to_full)).toEqual([false, false, true, false]);
	});

	test('caps repeated interruptions at surviving capacity and repairs at remaining loss', () => {
		const rows = simulateContinuity({ seed: 1, policy: small, scenario: fixture([10, 10, 10], [20, 20]) });
		expect(rows.map(r => r.newly_unavailable_slots)).toEqual([10, 2, 0]);
		expect(rows.map(r => r.unavailable_during_slots)).toEqual([10, 10, 8]);
		expect(rows.map(r => r.served_service_units)).toEqual([0, 0, 2]);
		const fast = simulateContinuity({ seed: 1, policy: { ...small, recoverySlotsPerHour: 30 }, scenario: fixture([10, 10], [3]) });
		expect(fast.map(r => r.recovered_slots)).toEqual([3, 0]);
		expect(fast.map(r => r.served_service_units)).toEqual([7, 10]);
	});

	test('zero recovery preserves loss and unmet demand is discarded each hour', () => {
		const rows = simulateContinuity({ seed: 1, policy: { ...small, recoverySlotsPerHour: 0 }, scenario: fixture([20, 1], [5]) });
		expect(rows.map(r => r.unavailable_end_slots)).toEqual([5, 5]);
		expect(rows.map(r => r.served_service_units)).toEqual([5, 1]);
		expect(rows.map(r => r.unmet_service_units)).toEqual([15, 0]);
	});

	test('faster recovery reduces subsequent deficits in an independently specified case', () => {
		const scenario = fixture([10, 10, 10, 10], [6]);
		const fast = simulateContinuity({ seed: 1, policy: { ...small, recoverySlotsPerHour: 6 }, scenario });
		expect(fast.map(r => r.served_service_units)).toEqual([4, 10, 10, 10]);
		const extra = simulateContinuity({ seed: 1, policy: { ...small, capacitySlots: 16 }, scenario });
		expect(extra.map(r => r.served_service_units)).toEqual([10, 10, 10, 10]);
	});

	test('repeats a seed exactly, changes another seed, and shares exogenous inputs across policies', () => {
		const scenario = createScenario(17);
		expect(scenario).toHaveLength(48);
		expect(createScenario(17)).toEqual(scenario);
		expect(createScenario(18)).not.toEqual(scenario);
		const a = simulateContinuity({ seed: 17, policy: POLICIES[0] });
		expect(simulateContinuity({ seed: 17, policy: POLICIES[0] })).toEqual(a);
		for (const policy of POLICIES) {
			const b = simulateContinuity({ seed: 17, policy });
			expect(b.map(r => [r.hour, r.demand_service_units, r.requested_unavailable_slots]))
				.toEqual(a.map(r => [r.hour, r.demand_service_units, r.requested_unavailable_slots]));
		}
	});

	test('conserves slots and work units for all 2,880 labelled hourly rows', () => {
		let count = 0;
		for (const policy of POLICIES) for (let seed = 1; seed <= 20; seed++) {
			const rows = simulateContinuity({ seed, policy });
			expect(rows).toHaveLength(48);
			for (const [hour, r] of rows.entries()) {
				count++;
				expect(r.synthetic).toBe(true);
				expect([r.seed, r.policy, r.hour]).toEqual([seed, policy.id, hour]);
				expect(r.unavailable_start_slots).toBe(hour ? rows[hour - 1].unavailable_end_slots : 0);
				expect(r.unavailable_start_slots + r.newly_unavailable_slots - r.recovered_slots).toBe(r.unavailable_end_slots);
				expect(r.available_during_slots + r.unavailable_during_slots).toBe(r.capacity_slots);
				expect(r.served_service_units + r.unmet_service_units).toBe(r.demand_service_units);
				expect(r.served_service_units).toBeLessThanOrEqual(r.available_during_slots * r.step_hours);
				expect(r.newly_unavailable_slots).toBeLessThanOrEqual(r.requested_unavailable_slots);
				expect(r.recovered_slots).toBeLessThanOrEqual(r.recovery_budget_slots_per_hour * r.step_hours);
				expect(r.recovered_slots).toBeLessThanOrEqual(r.unavailable_during_slots);
				for (const v of Object.values(r)) if (typeof v === 'number') {
					expect(Number.isFinite(v)).toBe(true);
					expect(v).toBeGreaterThanOrEqual(0);
				}
				expect(r.unavailable_end_slots).toBeLessThanOrEqual(r.capacity_slots);
				expect(r.service_ratio).toBeLessThanOrEqual(1);
				expect(r.capacity_availability_ratio).toBeLessThanOrEqual(1);
			}
		}
		expect(count).toBe(2880);
	});

	test.each([
		{ seed: -1 }, { seed: 1.5 }, { seed: 2 ** 32 },
		{ policy: { ...small, capacitySlots: 0 } },
		{ policy: { ...small, recoverySlotsPerHour: -1 } },
		{ policy: { ...small, capacitySlots: 2.5 } },
		{ scenario: fixture([-1], []) }, { scenario: fixture([NaN], []) },
		{ scenario: fixture([1], [-1]) },
		{ scenario: [{ hour: 1, demandServiceUnits: 1, requestedUnavailableSlots: 0 }] },
	])('rejects invalid dimensional inputs: %j', invalid => {
		expect(() => simulateContinuity({ seed: 1, policy: small, ...invalid })).toThrow(RangeError);
	});

	test('aggregates demand-weighted service and capacity-hours with hand-calculated totals', () => {
		const rows = simulateContinuity({ seed: 1, policy: small, scenario: fixture([10, 10, 10, 10], [6]) });
		const [metrics] = summarizePolicies(rows);
		expect(metrics).toMatchObject({
			policy: 'fixture', rows: 4, scenarios: 1,
			total_demand_service_units: 40, total_served_service_units: 28, total_unmet_service_units: 12,
			service_ratio: 0.7, capacity_availability_ratio: 0.7,
			shortage_hours: 3, recovered_slots: 6, fully_recovered_events: 1,
			installed_capacity_slot_hours: 40, unavailable_slot_hours: 12,
			mean_final_unavailable_slots: 0,
		});
		expect(summarizePolicies([])).toEqual([]);
		const noDemand = simulateContinuity({ seed: 1, policy: small, scenario: fixture([0], [10]) });
		expect(summarizePolicies(noDemand)[0]).toMatchObject({ service_ratio: 1, capacity_availability_ratio: 0 });
	});
});

describe('generated continuity artifact contract', () => {
	test('publishes reproducible CSV, row schema, scoped licence and bilingual cards with verifiable hashes', () => {
		const bundle = buildArtifactBundle();
		expect(buildArtifactBundle()).toEqual(bundle);
		const { manifest, files } = bundle;
		expect(manifest).toMatchObject({
			manifest_version: 1, version: '1.0.0', synthetic: true,
			experiment: { row_count: 2880, hours_per_seed: 48, policy_count: 3, rows_per_policy: 960 },
			license: { id: 'CC-BY-4.0' },
		});
		expect(manifest.seeds).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
		expect(manifest.files).toHaveLength(7);
		for (const file of manifest.files) {
			const content = files[file.repository_path];
			expect(file.path).toBe('/' + file.repository_path.replace(/^public\//, ''));
			expect(file.license).toBe(file.role === 'source-code' || file.path.endsWith('LICENSE-Apache-2.0.txt') ? 'Apache-2.0' : 'CC-BY-4.0');
			expect(file.bytes).toBe(Buffer.byteLength(content));
			expect(file.sha256).toBe(createHash('sha256').update(content).digest('hex'));
		}
		const csvFile = manifest.files.find(f => f.role === 'dataset')!;
		const schemaFile = manifest.files.find(f => f.role === 'schema')!;
		const csv = files[csvFile.repository_path].trimEnd().split('\n');
		const header = csv[0].split(',');
		const schema = JSON.parse(files[schemaFile.repository_path]);
		expect(csv).toHaveLength(2881);
		expect(Object.keys(schema.properties)).toEqual(header);
		expect(schema.required).toEqual(header);
		expect(schema.properties.synthetic.const).toBe(true);
		expect(schema.properties.capacity_slots.unit).toBe('slot');
		expect(schema.properties.demand_service_units.unit).toBe('service_unit');
		const modelRows = POLICIES.flatMap(policy => Array.from({ length: 20 }, (_, i) =>
			simulateContinuity({ seed: i + 1, policy })).flat());
		for (const [i, line] of csv.slice(1).entries()) {
			expect(line.split(',')).toEqual(header.map(key => String(modelRows[i][key as keyof typeof modelRows[number]])));
		}
		expect(manifest.policies.map(p => p.metrics)).toEqual(summarizePolicies(modelRows));
		expect(manifest.policies.map(p => p.metrics.rows)).toEqual([960, 960, 960]);
		expect(manifest.files.filter(f => f.role === 'dataset-card').map(f => f.language).sort()).toEqual(['en', 'es']);
	});

	test('ships the exact standalone simulator, executable without project dependencies, under its own code licence', () => {
		const { manifest, files } = buildArtifactBundle();
		const source = files['public/datos/studio/simulator.ts'];
		expect(source).toBe(readFileSync('src/lib/studio/resilience.ts', 'utf8'));
		const sandbox = { module: { exports: {} as typeof import('./resilience') } };
		runInNewContext(transformSync(source, { loader: 'ts', format: 'cjs' }).code, sandbox);
		const rows = sandbox.module.exports.simulateContinuity({ seed: 1, policy: small, scenario: fixture([10, 10, 10, 10], [6]) });
		expect(rows.map(r => r.served_service_units)).toEqual([4, 6, 8, 10]);
		expect(manifest.files.find(f => f.role === 'source-code')).toMatchObject({ path: '/datos/studio/simulator.ts', license: 'Apache-2.0' });
		expect(manifest.files.find(f => f.path.endsWith('LICENSE-Apache-2.0.txt'))).toMatchObject({ role: 'license', license: 'Apache-2.0' });
		expect(source).toContain('SPDX-License-Identifier: Apache-2.0');
		expect(files['public/datos/studio/LICENSE-Apache-2.0.txt']).toContain('END OF TERMS AND CONDITIONS');
		expect(manifest.license.id).toBe('CC-BY-4.0');
	});
});
