// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Carlos Nicolás Soto — Peace The Frontier Research Portfolio
// Pure, deterministic discovery-funnel vs. attention-saturation model for Hypothesis H3.
// R10 compliant: therapeutics-preclinical-triage models abstract stage-transition statistics only.

export const H3_VERSION = '1.0.0';
export const H3_START_YEAR = 2026;
export const H3_YEARS = 10;

export type DomainId =
	| 'materials-discovery'
	| 'therapeutics-preclinical-triage'
	| 'climate-earth-systems'
	| 'fundamental-physics'
	| 'consumer-assistant'
	| 'digital-media';

export interface DomainSpec {
	readonly id: DomainId;
	readonly domainClass: 'scientific-oracle' | 'consumer-attention';
	readonly oracleFidelity: number;
	readonly physicalBottleneckShare: number;
	readonly annualSearchGrowth: number;
	readonly annualLabAutomationGrowth: number;
	readonly structuralUnitValue: number;
	readonly computeIntensityPflopDays: number;
}

export const H3_DOMAINS: readonly DomainSpec[] = [
	{
		id: 'materials-discovery',
		domainClass: 'scientific-oracle',
		oracleFidelity: 0.88,
		physicalBottleneckShare: 0.34,
		annualSearchGrowth: 1.55,
		annualLabAutomationGrowth: 0.24,
		structuralUnitValue: 18.5,
		computeIntensityPflopDays: 2.4,
	},
	{
		id: 'therapeutics-preclinical-triage',
		domainClass: 'scientific-oracle',
		oracleFidelity: 0.76,
		physicalBottleneckShare: 0.52,
		annualSearchGrowth: 1.48,
		annualLabAutomationGrowth: 0.16,
		structuralUnitValue: 24.0,
		computeIntensityPflopDays: 2.8,
	},
	{
		id: 'climate-earth-systems',
		domainClass: 'scientific-oracle',
		oracleFidelity: 0.86,
		physicalBottleneckShare: 0.26,
		annualSearchGrowth: 1.5,
		annualLabAutomationGrowth: 0.22,
		structuralUnitValue: 19.0,
		computeIntensityPflopDays: 3.1,
	},
	{
		id: 'fundamental-physics',
		domainClass: 'scientific-oracle',
		oracleFidelity: 0.93,
		physicalBottleneckShare: 0.28,
		annualSearchGrowth: 1.46,
		annualLabAutomationGrowth: 0.19,
		structuralUnitValue: 17.5,
		computeIntensityPflopDays: 2.6,
	},
	{
		id: 'consumer-assistant',
		domainClass: 'consumer-attention',
		oracleFidelity: 0.38,
		physicalBottleneckShare: 0.12,
		annualSearchGrowth: 1.6,
		annualLabAutomationGrowth: 0.1,
		structuralUnitValue: 6.2,
		computeIntensityPflopDays: 3.6,
	},
	{
		id: 'digital-media',
		domainClass: 'consumer-attention',
		oracleFidelity: 0.31,
		physicalBottleneckShare: 0.08,
		annualSearchGrowth: 1.65,
		annualLabAutomationGrowth: 0.08,
		structuralUnitValue: 4.4,
		computeIntensityPflopDays: 3.4,
	},
];

export interface OracleFunnelRow {
	synthetic: true;
	dataset_version: string;
	seed: number;
	domain: DomainId;
	domain_class: DomainSpec['domainClass'];
	year: number;
	in_silico_speedup: number;
	physical_validation_speedup: number;
	amdahl_pipeline_speedup: number;
	bottleneck_share_physical: number;
	validated_output_units: number;
	annual_structural_surplus: number;
	cumulative_surplus: number;
	cumulative_surplus_per_pflop: number;
}

export interface DomainSummary {
	domain: DomainId;
	domain_class: DomainSpec['domainClass'];
	runs: number;
	mean_pipeline_speedup_2035: number;
	mean_physical_bottleneck_2035: number;
	mean_cumulative_surplus_2035: number;
	mean_surplus_per_pflop_2035: number;
}

function createPrng(seed: number): () => number {
	if (!Number.isSafeInteger(seed) || seed < 1 || seed > 0xffffffff) {
		throw new RangeError('seed must be a positive 32-bit integer');
	}
	let state = seed >>> 0;
	return () => {
		state = (Math.imul(1664525, state) + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}

const round6 = (v: number) => Number(v.toFixed(6));

/** Amdahl's Law applied to hybrid in-silico + physical validation pipelines. */
export function amdahlDiscoverySpeedup(params: {
	inSilicoSpeedup: number;
	physicalSpeedup: number;
	physicalBottleneckShare: number;
}): { effectiveSpeedup: number; physicalTimeShare: number } {
	const { inSilicoSpeedup, physicalSpeedup, physicalBottleneckShare } = params;
	if (inSilicoSpeedup <= 0 || physicalSpeedup <= 0) {
		throw new RangeError('speedups must be strictly positive');
	}
	if (physicalBottleneckShare < 0 || physicalBottleneckShare >= 1) {
		throw new RangeError('physicalBottleneckShare must be in [0, 1)');
	}
	const inSilicoTerm = (1 - physicalBottleneckShare) / inSilicoSpeedup;
	const physicalTerm = physicalBottleneckShare / physicalSpeedup;
	const totalCycleTime = inSilicoTerm + physicalTerm;
	return {
		effectiveSpeedup: 1 / totalCycleTime,
		physicalTimeShare: physicalTerm / totalCycleTime,
	};
}

export function simulateDomainTrajectory(seed: number, spec: DomainSpec): OracleFunnelRow[] {
	const domainIndex = H3_DOMAINS.findIndex((d) => d.id === spec.id);
	const next = createPrng(seed * 157 + domainIndex * 29 + 1);
	const growthFactor = 0.92 + next() * 0.16;
	const labFactor = 0.88 + next() * 0.24;

	let cumulativeSurplus = 0;
	let cumulativeCompute = 0;
	let knowledgeStock = 1.0;

	const rows: OracleFunnelRow[] = [];
	for (let step = 0; step < H3_YEARS; step++) {
		const year = H3_START_YEAR + step;
		const shock = 0.94 + next() * 0.12;
		const inSilicoSpeedup = Math.pow(spec.annualSearchGrowth * growthFactor, step);
		const physicalSpeedup = 1 + spec.annualLabAutomationGrowth * labFactor * step;
		const amdahl = amdahlDiscoverySpeedup({
			inSilicoSpeedup,
			physicalSpeedup,
			physicalBottleneckShare: spec.physicalBottleneckShare,
		});

		const annualCompute = spec.computeIntensityPflopDays * Math.pow(1.18, step);
		cumulativeCompute += annualCompute;

		let validatedUnits: number;
		let annualSurplus: number;

		if (spec.domainClass === 'scientific-oracle') {
			// Non-rival scientific discoveries compound structural productivity when verified by physical oracles
			validatedUnits = amdahl.effectiveSpeedup * spec.oracleFidelity * shock;
			annualSurplus = validatedUnits * spec.structuralUnitValue * (1 + 0.14 * Math.log1p(knowledgeStock));
			knowledgeStock += validatedUnits * 0.35;
		} else {
			// Consumer output faces a finite human-attention ceiling (Michaelis-Menten saturation) + commoditization
			const attentionSaturated = (3.2 * amdahl.effectiveSpeedup) / (2.2 + amdahl.effectiveSpeedup);
			const commoditizationDecay = Math.pow(0.95, step);
			validatedUnits = attentionSaturated * spec.oracleFidelity * shock;
			annualSurplus = attentionSaturated * spec.structuralUnitValue * commoditizationDecay * shock;
		}

		cumulativeSurplus += annualSurplus;

		rows.push({
			synthetic: true,
			dataset_version: H3_VERSION,
			seed,
			domain: spec.id,
			domain_class: spec.domainClass,
			year,
			in_silico_speedup: round6(inSilicoSpeedup),
			physical_validation_speedup: round6(physicalSpeedup),
			amdahl_pipeline_speedup: round6(amdahl.effectiveSpeedup),
			bottleneck_share_physical: round6(amdahl.physicalTimeShare),
			validated_output_units: round6(validatedUnits),
			annual_structural_surplus: round6(annualSurplus),
			cumulative_surplus: round6(cumulativeSurplus),
			cumulative_surplus_per_pflop: round6(cumulativeSurplus / cumulativeCompute),
		});
	}
	return rows;
}

export function summarizeDomains(rows: readonly OracleFunnelRow[]): DomainSummary[] {
	return H3_DOMAINS.map((spec) => {
		const endRows = rows.filter((r) => r.domain === spec.id && r.year === H3_START_YEAR + H3_YEARS - 1);
		const mean = (fn: (r: OracleFunnelRow) => number) =>
			round6(endRows.reduce((acc, r) => acc + fn(r), 0) / endRows.length);
		return {
			domain: spec.id,
			domain_class: spec.domainClass,
			runs: endRows.length,
			mean_pipeline_speedup_2035: mean((r) => r.amdahl_pipeline_speedup),
			mean_physical_bottleneck_2035: mean((r) => r.bottleneck_share_physical),
			mean_cumulative_surplus_2035: mean((r) => r.cumulative_surplus),
			mean_surplus_per_pflop_2035: mean((r) => r.cumulative_surplus_per_pflop),
		};
	});
}
