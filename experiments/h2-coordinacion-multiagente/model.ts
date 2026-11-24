// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Carlos Nicolás Soto — Peace The Frontier Research Portfolio
// Pure, deterministic multi-agent game-theoretic simulation for Hypothesis H2.

export const H2_VERSION = '1.0.0';
export const H2_ACTORS = 8;
export const H2_ROUNDS = 40;
export const H2_CAPABILITY_LEVELS = [1, 2, 5, 10, 25] as const;

export type CoordinationRegimeId =
	| 'uncoordinated-race'
	| 'static-benchmark-gate'
	| 'verifiable-audit-commitment'
	| 'adaptive-interoperability';

export const H2_REGIMES: readonly CoordinationRegimeId[] = [
	'uncoordinated-race',
	'static-benchmark-gate',
	'verifiable-audit-commitment',
	'adaptive-interoperability',
];

export interface CoordinationRow {
	synthetic: true;
	dataset_version: string;
	seed: number;
	regime: CoordinationRegimeId;
	capability_multiplier: number;
	actors: number;
	rounds: number;
	mean_safety_margin: number;
	mean_proxy_gaming: number;
	benchmark_score: number;
	goodhart_divergence: number;
	systemic_incident_rate: number;
	gross_output: number;
	externality_damage: number;
	net_social_welfare: number;
}

export interface CoordinationSummary {
	regime: CoordinationRegimeId;
	capability_multiplier: number;
	scenarios: number;
	mean_safety_margin: number;
	mean_goodhart_divergence: number;
	mean_incident_rate: number;
	mean_net_welfare: number;
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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round6 = (v: number) => Number(v.toFixed(6));

/** Equilibrium budget split (deployment a, genuine safety s, benchmark gaming g) for an actor. */
export function actorAllocation(params: {
	regime: CoordinationRegimeId;
	capability: number;
	competitivePressure: number;
	noise: number;
}): { deploy: number; safety: number; gaming: number; proxyFidelity: number } {
	const { regime, capability, competitivePressure, noise } = params;
	const logCap = Math.log2(capability);

	let safety: number;
	let gaming: number;
	let proxyFidelity: number;

	switch (regime) {
		case 'uncoordinated-race': {
			// Private actor internalizes only 1/N of shared systemic risk; racing erodes safety as C grows.
			proxyFidelity = 0.5;
			safety = clamp(0.24 - 0.028 * logCap - 0.06 * competitivePressure + noise, 0.05, 0.45);
			gaming = clamp(0.04 + 0.01 * logCap, 0.02, 0.15);
			break;
		}
		case 'static-benchmark-gate': {
			// Static benchmark fidelity degrades as capability outpaces fixed evaluation suites.
			proxyFidelity = 0.78 / (1 + 0.11 * (capability - 1));
			safety = clamp(0.3 - 0.032 * logCap - 0.04 * competitivePressure + noise, 0.08, 0.5);
			gaming = clamp(0.08 + 0.055 * logCap + 0.04 * (1 - proxyFidelity), 0.05, 0.42);
			break;
		}
		case 'verifiable-audit-commitment': {
			// Adversarial audit penalizes gaming and enforces minimum safety floor across labs.
			proxyFidelity = 0.9;
			safety = clamp(0.46 + 0.012 * logCap - 0.015 * competitivePressure + noise, 0.35, 0.68);
			gaming = clamp(0.03 - 0.003 * logCap, 0.01, 0.06);
			break;
		}
		case 'adaptive-interoperability': {
			// Scalable mutual verification + full liability internalization: safety co-scales with capability.
			proxyFidelity = clamp(0.88 + 0.02 * logCap, 0.88, 0.98);
			safety = clamp(0.5 + 0.038 * logCap - 0.01 * competitivePressure + noise, 0.42, 0.78);
			gaming = clamp(0.018 - 0.002 * logCap, 0.005, 0.04);
			break;
		}
	}

	const deploy = clamp(1 - safety - gaming, 0.12, 0.92);
	const norm = deploy + safety + gaming;
	return {
		deploy: deploy / norm,
		safety: safety / norm,
		gaming: gaming / norm,
		proxyFidelity,
	};
}

export function simulateCoordinationScenario(
	seed: number,
	regime: CoordinationRegimeId,
	capability: number,
): CoordinationRow {
	if (capability <= 0) throw new RangeError('capability must be positive');
	const regimeOffset = H2_REGIMES.indexOf(regime) * 31;
	const next = createPrng(seed * 131 + capability * 17 + regimeOffset + 1);

	let sumSafety = 0;
	let sumGaming = 0;
	let sumBenchmark = 0;
	let incidents = 0;
	let grossOutput = 0;
	let externalityDamage = 0;

	for (let round = 0; round < H2_ROUNDS; round++) {
		const marketShock = 0.35 + next() * 0.45;
		let roundComplement = 1;
		let roundGross = 0;

		for (let actor = 0; actor < H2_ACTORS; actor++) {
			const noise = (next() - 0.5) * 0.04;
			const alloc = actorAllocation({
				regime,
				capability,
				competitivePressure: marketShock,
				noise,
			});
			const benchmark =
				alloc.proxyFidelity * alloc.safety + (1 - alloc.proxyFidelity) * (alloc.safety + alloc.gaming * 1.8);
			sumSafety += alloc.safety;
			sumGaming += alloc.gaming;
			sumBenchmark += Math.min(1, benchmark);

			// Per-actor interaction hazard rises with unverified capability intensity C * deploy * (1 - safety)^2
			const protocolDamping =
				regime === 'adaptive-interoperability'
					? 0.28
					: regime === 'verifiable-audit-commitment'
						? 0.46
						: 1.0;
			const actorHazard = clamp(
				0.016 * Math.pow(capability, 0.62) * alloc.deploy * Math.pow(1 - alloc.safety, 2.1) * protocolDamping,
				0,
				0.65,
			);
			roundComplement *= 1 - actorHazard;
			roundGross += Math.pow(capability, 0.72) * alloc.deploy * (0.85 + 0.3 * alloc.safety);
		}

		const systemicIncidentProb = 1 - roundComplement;
		const draw = next();
		const incidentOccurred = draw < systemicIncidentProb;
		if (incidentOccurred) {
			incidents += 1;
			// Blast radius scales super-linearly with capability when coordination fails
			externalityDamage += 5.8 * Math.pow(capability, 0.92);
		}
		grossOutput += roundGross;
	}

	const totalDecisions = H2_ROUNDS * H2_ACTORS;
	const meanSafety = sumSafety / totalDecisions;
	const meanGaming = sumGaming / totalDecisions;
	const meanBenchmark = sumBenchmark / totalDecisions;
	const goodhartDivergence = Math.max(0, meanBenchmark - meanSafety);
	const incidentRate = incidents / H2_ROUNDS;
	const netWelfare = grossOutput - externalityDamage;

	return {
		synthetic: true,
		dataset_version: H2_VERSION,
		seed,
		regime,
		capability_multiplier: capability,
		actors: H2_ACTORS,
		rounds: H2_ROUNDS,
		mean_safety_margin: round6(meanSafety),
		mean_proxy_gaming: round6(meanGaming),
		benchmark_score: round6(meanBenchmark),
		goodhart_divergence: round6(goodhartDivergence),
		systemic_incident_rate: round6(incidentRate),
		gross_output: round6(grossOutput),
		externality_damage: round6(externalityDamage),
		net_social_welfare: round6(netWelfare),
	};
}

export function summarizeCoordination(rows: readonly CoordinationRow[]): CoordinationSummary[] {
	const summaries: CoordinationSummary[] = [];
	for (const regime of H2_REGIMES) {
		for (const cap of H2_CAPABILITY_LEVELS) {
			const subset = rows.filter((r) => r.regime === regime && r.capability_multiplier === cap);
			if (!subset.length) continue;
			const mean = (fn: (r: CoordinationRow) => number) =>
				round6(subset.reduce((acc, r) => acc + fn(r), 0) / subset.length);
			summaries.push({
				regime,
				capability_multiplier: cap,
				scenarios: subset.length,
				mean_safety_margin: mean((r) => r.mean_safety_margin),
				mean_goodhart_divergence: mean((r) => r.goodhart_divergence),
				mean_incident_rate: mean((r) => r.systemic_incident_rate),
				mean_net_welfare: mean((r) => r.net_social_welfare),
			});
		}
	}
	return summaries;
}
