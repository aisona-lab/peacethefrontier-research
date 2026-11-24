// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Peace The Frontier Research Studio
// Licence: https://www.apache.org/licenses/LICENSE-2.0 (full copy accompanies simulator.ts).
// Pure, synthetic service-continuity experiment; no runtime or UI dependencies.
export const DATASET_VERSION = '1.0.0';

export interface Policy {
	readonly id: string;
	readonly capacitySlots: number;
	readonly recoverySlotsPerHour: number;
}

export interface ScenarioHour {
	readonly hour: number;
	readonly demandServiceUnits: number;
	readonly requestedUnavailableSlots: number;
}

export const POLICIES: readonly Policy[] = [
	{ id: 'steady', capacitySlots: 100, recoverySlotsPerHour: 4 },
	{ id: 'rapid-recovery', capacitySlots: 100, recoverySlotsPerHour: 12 },
	{ id: 'extra-capacity', capacitySlots: 125, recoverySlotsPerHour: 4 },
];

export interface ContinuityRow {
	synthetic: true;
	dataset_version: string;
	seed: number;
	policy: string;
	hour: number;
	step_hours: 1;
	capacity_slots: number;
	recovery_budget_slots_per_hour: number;
	demand_service_units: number;
	requested_unavailable_slots: number;
	newly_unavailable_slots: number;
	unavailable_start_slots: number;
	unavailable_during_slots: number;
	available_during_slots: number;
	served_service_units: number;
	unmet_service_units: number;
	recovered_slots: number;
	unavailable_end_slots: number;
	service_ratio: number;
	capacity_availability_ratio: number;
	recovered_to_full: boolean;
}

export interface PolicyMetrics {
	policy: string;
	rows: number;
	scenarios: number;
	total_demand_service_units: number;
	total_served_service_units: number;
	total_unmet_service_units: number;
	service_ratio: number;
	capacity_availability_ratio: number;
	shortage_hours: number;
	recovered_slots: number;
	fully_recovered_events: number;
	installed_capacity_slot_hours: number;
	unavailable_slot_hours: number;
	mean_final_unavailable_slots: number;
}

function integerAtLeast(value: number, minimum: number, name: string): void {
	if (!Number.isSafeInteger(value) || value < minimum) {
		throw new RangeError(`${name} must be a safe integer >= ${minimum}`);
	}
}

function validateSeed(seed: number): void {
	integerAtLeast(seed, 0, 'seed');
	if (seed > 0xffffffff) throw new RangeError('seed must fit in an unsigned 32-bit integer');
}

/** Same three PRNG draws each hour, independent of any recovery policy. */
export function createScenario(seed: number, hours = 48): ScenarioHour[] {
	validateSeed(seed);
	integerAtLeast(hours, 1, 'hours');
	let state = seed;
	const next = () => {
		state = (Math.imul(1664525, state) + 1013904223) >>> 0;
		return state / 0x100000000;
	};
	const dailyDemand = [58, 56, 54, 54, 58, 65, 74, 83, 91, 97, 102, 105, 106, 104, 100, 98, 97, 101, 104, 99, 90, 80, 70, 62];
	return Array.from({ length: hours }, (_, hour) => {
		const jitter = Math.floor(next() * 17) - 8;
		const interruptionDraw = next();
		const magnitude = 20 + Math.floor(next() * 26);
		const interrupted = [8, 24, 36].includes(hour) || (hour >= 4 && interruptionDraw < 0.08);
		return { hour, demandServiceUnits: dailyDemand[hour % 24] + jitter, requestedUnavailableSlots: interrupted ? magnitude : 0 };
	});
}

/** One slot delivers one service unit/hour. Service precedes end-of-hour repair. */
export function simulateContinuity({ seed, policy, scenario = createScenario(seed) }: {
	seed: number;
	policy: Policy;
	scenario?: readonly ScenarioHour[];
}): ContinuityRow[] {
	validateSeed(seed);
	integerAtLeast(policy.capacitySlots, 1, 'capacitySlots');
	integerAtLeast(policy.recoverySlotsPerHour, 0, 'recoverySlotsPerHour');
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(policy.id)) throw new RangeError('policy id must be a lowercase slug');
	if (!scenario.length) throw new RangeError('scenario must contain at least one hour');
	let unavailable = 0;
	return scenario.map((input, hour) => {
		if (input.hour !== hour) throw new RangeError('scenario hours must be contiguous, starting at zero');
		integerAtLeast(input.demandServiceUnits, 0, 'demandServiceUnits');
		integerAtLeast(input.requestedUnavailableSlots, 0, 'requestedUnavailableSlots');
		const start = unavailable;
		const newlyUnavailable = Math.min(input.requestedUnavailableSlots, policy.capacitySlots - start);
		const during = start + newlyUnavailable;
		const available = policy.capacitySlots - during;
		const served = Math.min(input.demandServiceUnits, available);
		const recovered = Math.min(policy.recoverySlotsPerHour, during);
		unavailable = during - recovered;
		return {
			synthetic: true, dataset_version: DATASET_VERSION, seed, policy: policy.id, hour, step_hours: 1,
			capacity_slots: policy.capacitySlots, recovery_budget_slots_per_hour: policy.recoverySlotsPerHour,
			demand_service_units: input.demandServiceUnits, requested_unavailable_slots: input.requestedUnavailableSlots,
			newly_unavailable_slots: newlyUnavailable, unavailable_start_slots: start,
			unavailable_during_slots: during, available_during_slots: available,
			served_service_units: served, unmet_service_units: input.demandServiceUnits - served,
			recovered_slots: recovered, unavailable_end_slots: unavailable,
			service_ratio: input.demandServiceUnits === 0 ? 1 : served / input.demandServiceUnits,
			capacity_availability_ratio: available / policy.capacitySlots,
			recovered_to_full: during > 0 && unavailable === 0,
		};
	});
}

/** Ratios use pooled work and capacity-hours; final loss includes censored runs. */
export function summarizePolicies(rows: readonly ContinuityRow[]): PolicyMetrics[] {
	const groups = new Map<string, ContinuityRow[]>();
	for (const row of rows) {
		const group = groups.get(row.policy) ?? [];
		group.push(row);
		groups.set(row.policy, group);
	}
	return [...groups].map(([policy, group]) => {
		const sum = (value: (row: ContinuityRow) => number) => group.reduce((total, row) => total + value(row), 0);
		const demand = sum(r => r.demand_service_units);
		const served = sum(r => r.served_service_units);
		const capacityHours = sum(r => r.capacity_slots * r.step_hours);
		const unavailableHours = sum(r => r.unavailable_during_slots * r.step_hours);
		const finalBySeed = new Map<number, ContinuityRow>();
		for (const row of group) {
			if (!finalBySeed.has(row.seed) || row.hour > finalBySeed.get(row.seed)!.hour) finalBySeed.set(row.seed, row);
		}
		return {
			policy, rows: group.length, scenarios: finalBySeed.size,
			total_demand_service_units: demand, total_served_service_units: served,
			total_unmet_service_units: sum(r => r.unmet_service_units),
			service_ratio: demand === 0 ? 1 : served / demand,
			capacity_availability_ratio: 1 - unavailableHours / capacityHours,
			shortage_hours: sum(r => r.unmet_service_units > 0 ? 1 : 0),
			recovered_slots: sum(r => r.recovered_slots),
			fully_recovered_events: sum(r => r.recovered_to_full ? 1 : 0),
			installed_capacity_slot_hours: capacityHours, unavailable_slot_hours: unavailableHours,
			mean_final_unavailable_slots: [...finalBySeed.values()].reduce((total, row) => total + row.unavailable_end_slots, 0) / finalBySeed.size,
		};
	});
}
