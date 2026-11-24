// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Carlos Nicolás Soto — Peace The Frontier Research Portfolio
// Pure, deterministic model for Hypothesis H1: Copilot-to-Autonomous Infrastructure Transition.

export const H1_VERSION = '1.0.0';
export const H1_START_YEAR = 2026;
export const H1_END_YEAR = 2036;

export interface SectorParameters {
	readonly id:
		| 'computational-science'
		| 'education-tutoring'
		| 'public-administration'
		| 'health-workflow-admin'
		| 'energy-grid-dispatch';
	readonly steps: number;
	readonly humanStepCost: number;
	readonly copilotSpeedup: number;
	readonly stepReviewCost: number;
	readonly agentAuditCost: number;
	readonly baseStepReliability: number;
	readonly baseDetectionRate: number;
	readonly recoveryCost: number;
	readonly undetectedLiability: number;
	readonly maxTailRisk: number;
}

export interface TrajectoryRegime {
	readonly id: 'conservative' | 'baseline-coevolution' | 'verifier-infrastructure';
	readonly errorHalvingYears: number;
	readonly verifierErrorHalvingYears: number | null;
}

export const H1_SECTORS: readonly SectorParameters[] = [
	{
		id: 'computational-science',
		steps: 8,
		humanStepCost: 10,
		copilotSpeedup: 0.42,
		stepReviewCost: 1.6,
		agentAuditCost: 3.0,
		baseStepReliability: 0.912,
		baseDetectionRate: 0.91,
		recoveryCost: 6,
		undetectedLiability: 45,
		maxTailRisk: 0.025,
	},
	{
		id: 'education-tutoring',
		steps: 6,
		humanStepCost: 7,
		copilotSpeedup: 0.38,
		stepReviewCost: 1.3,
		agentAuditCost: 2.2,
		baseStepReliability: 0.905,
		baseDetectionRate: 0.86,
		recoveryCost: 4,
		undetectedLiability: 32,
		maxTailRisk: 0.032,
	},
	{
		id: 'public-administration',
		steps: 7,
		humanStepCost: 8,
		copilotSpeedup: 0.35,
		stepReviewCost: 1.8,
		agentAuditCost: 3.4,
		baseStepReliability: 0.915,
		baseDetectionRate: 0.87,
		recoveryCost: 7,
		undetectedLiability: 65,
		maxTailRisk: 0.022,
	},
	{
		id: 'health-workflow-admin',
		steps: 9,
		humanStepCost: 11,
		copilotSpeedup: 0.32,
		stepReviewCost: 2.4,
		agentAuditCost: 5.5,
		baseStepReliability: 0.918,
		baseDetectionRate: 0.84,
		recoveryCost: 14,
		undetectedLiability: 210,
		maxTailRisk: 0.009,
	},
	{
		id: 'energy-grid-dispatch',
		steps: 10,
		humanStepCost: 12,
		copilotSpeedup: 0.3,
		stepReviewCost: 2.6,
		agentAuditCost: 6.0,
		baseStepReliability: 0.92,
		baseDetectionRate: 0.85,
		recoveryCost: 18,
		undetectedLiability: 280,
		maxTailRisk: 0.0055,
	},
];

export const H1_REGIMES: readonly TrajectoryRegime[] = [
	{ id: 'conservative', errorHalvingYears: 4.2, verifierErrorHalvingYears: null },
	{ id: 'baseline-coevolution', errorHalvingYears: 2.4, verifierErrorHalvingYears: 6.0 },
	{ id: 'verifier-infrastructure', errorHalvingYears: 2.4, verifierErrorHalvingYears: 2.0 },
];

export interface DelegationRow {
	synthetic: true;
	dataset_version: string;
	seed: number;
	regime: TrajectoryRegime['id'];
	sector: SectorParameters['id'];
	year: number;
	steps: number;
	step_reliability: number;
	chain_reliability: number;
	verifier_detection_rate: number;
	undetected_tail_risk: number;
	copilot_cost: number;
	agent_expected_cost: number;
	net_cost_saving: number;
	passes_safety_threshold: boolean;
	autonomous_dominates: boolean;
}

export interface SectorRegimeSummary {
	regime: TrajectoryRegime['id'];
	sector: SectorParameters['id'];
	runs: number;
	adoption_share_2031: number;
	adoption_share_2036: number;
	median_crossover_year: number | null;
	mean_net_saving_2036: number;
	mean_tail_risk_2036: number;
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

export function evaluateDelegationPoint(params: {
	sector: SectorParameters;
	stepReliability: number;
	detectionRate: number;
	computeCost: number;
}): {
	chainReliability: number;
	undetectedTailRisk: number;
	copilotCost: number;
	agentExpectedCost: number;
	netCostSaving: number;
	passesSafetyThreshold: boolean;
	autonomousDominates: boolean;
} {
	const { sector, stepReliability, detectionRate, computeCost } = params;
	if (stepReliability <= 0 || stepReliability >= 1) {
		throw new RangeError('stepReliability must be in (0, 1)');
	}
	if (detectionRate < 0 || detectionRate > 1) {
		throw new RangeError('detectionRate must be in [0, 1]');
	}
	const chainReliability = Math.pow(stepReliability, sector.steps);
	const chainFailure = 1 - chainReliability;
	const undetectedTailRisk = chainFailure * (1 - detectionRate);
	const copilotCost =
		sector.steps * ((1 - sector.copilotSpeedup) * sector.humanStepCost + sector.stepReviewCost);
	const expectedFailurePenalty =
		chainFailure * (detectionRate * sector.recoveryCost + (1 - detectionRate) * sector.undetectedLiability);
	const agentExpectedCost = computeCost + sector.agentAuditCost + expectedFailurePenalty;
	const netCostSaving = copilotCost - agentExpectedCost;
	const passesSafetyThreshold = undetectedTailRisk <= sector.maxTailRisk;
	return {
		chainReliability,
		undetectedTailRisk,
		copilotCost,
		agentExpectedCost,
		netCostSaving,
		passesSafetyThreshold,
		autonomousDominates: netCostSaving > 0 && passesSafetyThreshold,
	};
}

export function simulateDelegationTrajectory(
	seed: number,
	regime: TrajectoryRegime,
	sector: SectorParameters,
): DelegationRow[] {
	const next = createPrng(seed * 97 + H1_SECTORS.findIndex((s) => s.id === sector.id) * 13 + 1);
	const p0Jitter = (next() - 0.5) * 0.014;
	const halvingFactor = 0.85 + next() * 0.3;
	const auditMultiplier = 0.9 + next() * 0.2;

	const initialError = Math.min(0.14, Math.max(0.02, 1 - (sector.baseStepReliability + p0Jitter)));
	const initialVerifierMiss = 1 - sector.baseDetectionRate;
	const effectiveErrorHalving = regime.errorHalvingYears * halvingFactor;
	const adjustedSector: SectorParameters = {
		...sector,
		agentAuditCost: sector.agentAuditCost * auditMultiplier,
	};

	const rows: DelegationRow[] = [];
	for (let year = H1_START_YEAR; year <= H1_END_YEAR; year++) {
		const elapsed = year - H1_START_YEAR;
		const stepError = initialError * Math.pow(0.5, elapsed / effectiveErrorHalving);
		const stepReliability = Math.min(0.9999, 1 - stepError);
		const verifierMiss =
			regime.verifierErrorHalvingYears === null
				? initialVerifierMiss
				: initialVerifierMiss * Math.pow(0.5, elapsed / regime.verifierErrorHalvingYears);
		const detectionRate = Math.min(0.999, 1 - verifierMiss);
		const computeCost = 1.8 * Math.pow(0.82, elapsed);

		const result = evaluateDelegationPoint({
			sector: adjustedSector,
			stepReliability,
			detectionRate,
			computeCost,
		});

		rows.push({
			synthetic: true,
			dataset_version: H1_VERSION,
			seed,
			regime: regime.id,
			sector: sector.id,
			year,
			steps: sector.steps,
			step_reliability: round6(stepReliability),
			chain_reliability: round6(result.chainReliability),
			verifier_detection_rate: round6(detectionRate),
			undetected_tail_risk: round6(result.undetectedTailRisk),
			copilot_cost: round6(result.copilotCost),
			agent_expected_cost: round6(result.agentExpectedCost),
			net_cost_saving: round6(result.netCostSaving),
			passes_safety_threshold: result.passesSafetyThreshold,
			autonomous_dominates: result.autonomousDominates,
		});
	}
	return rows;
}

export function summarizeDelegation(rows: readonly DelegationRow[]): SectorRegimeSummary[] {
	const summaries: SectorRegimeSummary[] = [];
	for (const regime of H1_REGIMES) {
		for (const sector of H1_SECTORS) {
			const subset = rows.filter((r) => r.regime === regime.id && r.sector === sector.id);
			if (!subset.length) continue;
			const seeds = [...new Set(subset.map((r) => r.seed))].sort((a, b) => a - b);
			const crossovers: number[] = [];
			for (const seed of seeds) {
				const first = subset
					.filter((r) => r.seed === seed && r.autonomous_dominates)
					.sort((a, b) => a.year - b.year)[0];
				if (first) crossovers.push(first.year);
			}
			crossovers.sort((a, b) => a - b);
			const medianCrossover =
				crossovers.length >= Math.ceil(seeds.length / 2)
					? crossovers[Math.floor((seeds.length - 1) / 2)] ?? null
					: null;
			const rows2031 = subset.filter((r) => r.year === 2031);
			const rows2036 = subset.filter((r) => r.year === 2036);
			summaries.push({
				regime: regime.id,
				sector: sector.id,
				runs: seeds.length,
				adoption_share_2031: round6(
					rows2031.filter((r) => r.autonomous_dominates).length / rows2031.length,
				),
				adoption_share_2036: round6(
					rows2036.filter((r) => r.autonomous_dominates).length / rows2036.length,
				),
				median_crossover_year: medianCrossover,
				mean_net_saving_2036: round6(
					rows2036.reduce((acc, r) => acc + r.net_cost_saving, 0) / rows2036.length,
				),
				mean_tail_risk_2036: round6(
					rows2036.reduce((acc, r) => acc + r.undetected_tail_risk, 0) / rows2036.length,
				),
			});
		}
	}
	return summaries;
}
