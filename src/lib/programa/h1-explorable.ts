// Motor puro del explorable interactivo de H1 (R22): sliders, año de cruce, mapa de calor de inversión,
// contraste con el CSV publicado y serialización segura en URL. Sin DOM ni dependencias externas.
import {
	H1_END_YEAR,
	H1_REGIMES,
	H1_SECTORS,
	H1_START_YEAR,
	evaluateDelegationPoint,
	type SectorParameters,
	type TrajectoryRegime,
} from '../../../experiments/h1-delegacion-autonoma/model';

export type H1SectorId = SectorParameters['id'];
export type H1RegimeId = TrajectoryRegime['id'];

export interface H1InteractiveParams {
	readonly sectorId: H1SectorId;
	readonly regimeId: H1RegimeId;
	readonly baseStepReliability: number;
	readonly steps: number;
	readonly agentAuditCost: number;
	readonly baseDetectionRate: number;
}

export interface H1YearlyPoint {
	readonly year: number;
	readonly stepReliability: number;
	readonly chainReliability: number;
	readonly detectionRate: number;
	readonly tailRisk: number;
	readonly copilotCost: number;
	readonly agentCost: number;
	readonly netSaving: number;
	readonly passesSafety: boolean;
	readonly autonomousDominates: boolean;
}

export interface H1TrajectoryResult {
	readonly crossoverYear: number | null;
	readonly copilotCost: number;
	readonly point2031: H1YearlyPoint;
	readonly point2036: H1YearlyPoint;
	readonly yearly: readonly H1YearlyPoint[];
}

export interface H1HeatmapCell {
	readonly col: number;
	readonly row: number;
	readonly p0: number;
	readonly steps: number;
	readonly crossoverYear: number | null;
	readonly regimeClass: 'never' | 'late' | 'early';
	readonly tailRisk2031: number;
	readonly netSaving2031: number;
}

export interface H1HeatmapData {
	readonly pValues: readonly number[];
	readonly kValues: readonly number[];
	readonly cells: readonly H1HeatmapCell[];
	/** Para cada K, menor índice de p0 donde ocurre cruce dentro de 2026-2036 (null si nunca cruza). */
	readonly flipIndexByRow: readonly (number | null)[];
	/** Para cada K, menor índice de p0 donde ocurre cruce en ≤5 años (≤2031). */
	readonly flip5yIndexByRow: readonly (number | null)[];
	readonly shareEarly: number;
	readonly shareLate: number;
	readonly shareNever: number;
}

export interface H1CsvBenchmarkSummary {
	readonly totalRows: number;
	readonly matchedRows: number;
	readonly seeds: number;
	readonly medianCrossoverYear: number | null;
	readonly adoptionShare2031: number;
	readonly adoptionShare2036: number;
}

export const H1_LIMITS = {
	p0: { min: 0.6, max: 0.985, step: 0.005 },
	steps: { min: 2, max: 32, step: 1 },
	audit: { min: 0.5, max: 40, step: 0.5 },
	det: { min: 0.5, max: 0.99, step: 0.01 },
} as const;

export const H1_SECTOR_LABELS: Record<H1SectorId, { es: string; en: string }> = {
	'computational-science': { es: 'Ciencia computacional', en: 'Computational science' },
	'education-tutoring': { es: 'Educación y tutoría', en: 'Education and tutoring' },
	'public-administration': { es: 'Administración pública', en: 'Public administration' },
	'health-workflow-admin': { es: 'Gestión sanitaria (admin.)', en: 'Health admin (non-clinical)' },
	'energy-grid-dispatch': { es: 'Despacho de red eléctrica', en: 'Power-grid dispatch' },
};

export const H1_REGIME_LABELS: Record<H1RegimeId, { es: string; en: string }> = {
	conservative: { es: 'Conservador (error ÷2 cada 4,2 años)', en: 'Conservative (error ÷2 every 4.2y)' },
	'baseline-coevolution': { es: 'Coevolución base (error ÷2 cada 2,4 años)', en: 'Baseline co-evolution (error ÷2 every 2.4y)' },
	'verifier-infrastructure': { es: 'Infraestructura verificadora (det. ÷2 cada 2 años)', en: 'Verifier infrastructure (miss ÷2 every 2y)' },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round3 = (v: number) => Math.round(v * 1000) / 1000;

export function sectorBase(id: H1SectorId): SectorParameters {
	const found = H1_SECTORS.find((s) => s.id === id);
	if (!found) throw new RangeError(`Sector desconocido: ${id}`);
	return found;
}

export function regimenBase(id: H1RegimeId): TrajectoryRegime {
	const found = H1_REGIMES.find((r) => r.id === id);
	if (!found) throw new RangeError(`Régimen desconocido: ${id}`);
	return found;
}

export function defaultParamsForSector(
	sectorId: H1SectorId = 'health-workflow-admin',
	regimeId: H1RegimeId = 'baseline-coevolution',
): H1InteractiveParams {
	const s = sectorBase(sectorId);
	return {
		sectorId,
		regimeId,
		baseStepReliability: s.baseStepReliability,
		steps: s.steps,
		agentAuditCost: s.agentAuditCost,
		baseDetectionRate: s.baseDetectionRate,
	};
}

export function computeCrossoverTrajectory(params: H1InteractiveParams): H1TrajectoryResult {
	const base = sectorBase(params.sectorId);
	const regime = regimenBase(params.regimeId);
	const sector: SectorParameters = {
		...base,
		steps: Math.round(clamp(params.steps, H1_LIMITS.steps.min, H1_LIMITS.steps.max)),
		agentAuditCost: clamp(params.agentAuditCost, H1_LIMITS.audit.min, H1_LIMITS.audit.max),
		baseStepReliability: clamp(params.baseStepReliability, H1_LIMITS.p0.min, H1_LIMITS.p0.max),
		baseDetectionRate: clamp(params.baseDetectionRate, H1_LIMITS.det.min, H1_LIMITS.det.max),
	};

	const initialError = 1 - sector.baseStepReliability;
	const initialMiss = 1 - sector.baseDetectionRate;
	const yearly: H1YearlyPoint[] = [];

	for (let year = H1_START_YEAR; year <= H1_END_YEAR; year++) {
		const elapsed = year - H1_START_YEAR;
		const stepError = initialError * Math.pow(0.5, elapsed / regime.errorHalvingYears);
		const stepReliability = Math.min(0.9999, 1 - stepError);
		const verifierMiss =
			regime.verifierErrorHalvingYears === null
				? initialMiss
				: initialMiss * Math.pow(0.5, elapsed / regime.verifierErrorHalvingYears);
		const detectionRate = Math.min(0.999, 1 - verifierMiss);
		const computeCost = 1.8 * Math.pow(0.82, elapsed);

		const point = evaluateDelegationPoint({
			sector,
			stepReliability,
			detectionRate,
			computeCost,
		});

		yearly.push({
			year,
			stepReliability,
			chainReliability: point.chainReliability,
			detectionRate,
			tailRisk: point.undetectedTailRisk,
			copilotCost: point.copilotCost,
			agentCost: point.agentExpectedCost,
			netSaving: point.netCostSaving,
			passesSafety: point.passesSafetyThreshold,
			autonomousDominates: point.autonomousDominates,
		});
	}

	const first = yearly.find((y) => y.autonomousDominates);
	const point2031 = yearly.find((y) => y.year === 2031)!;
	const point2036 = yearly.find((y) => y.year === 2036)!;

	return {
		crossoverYear: first ? first.year : null,
		copilotCost: point2031.copilotCost,
		point2031,
		point2036,
		yearly,
	};
}

/** Calcula los 5 sectores aplicando los mismos desplazamientos relativos elegidos por el lector. */
export function computeAllSectorsComparison(params: H1InteractiveParams): {
	sectorId: H1SectorId;
	crossoverYear: number | null;
	tailRisk2031: number;
	netSaving2031: number;
	isSelected: boolean;
}[] {
	const activeBase = sectorBase(params.sectorId);
	const deltaP = params.baseStepReliability - activeBase.baseStepReliability;
	const deltaK = params.steps - activeBase.steps;
	const auditRatio = params.agentAuditCost / activeBase.agentAuditCost;
	const deltaDet = params.baseDetectionRate - activeBase.baseDetectionRate;

	return H1_SECTORS.map((sec) => {
		const isSelected = sec.id === params.sectorId;
		const effective: H1InteractiveParams = isSelected
			? params
			: {
					sectorId: sec.id,
					regimeId: params.regimeId,
					baseStepReliability: clamp(sec.baseStepReliability + deltaP, H1_LIMITS.p0.min, H1_LIMITS.p0.max),
					steps: Math.round(clamp(sec.steps + deltaK, H1_LIMITS.steps.min, H1_LIMITS.steps.max)),
					agentAuditCost: clamp(sec.agentAuditCost * auditRatio, H1_LIMITS.audit.min, H1_LIMITS.audit.max),
					baseDetectionRate: clamp(sec.baseDetectionRate + deltaDet, H1_LIMITS.det.min, H1_LIMITS.det.max),
				};
		const res = computeCrossoverTrajectory(effective);
		return {
			sectorId: sec.id,
			crossoverYear: res.crossoverYear,
			tailRisk2031: res.point2031.tailRisk,
			netSaving2031: res.point2031.netSaving,
			isSelected,
		};
	});
}

/** Mapa de calor p0 × K marcando dónde se invierte la conclusión (Copiloto ↔ Autónomo). */
export function computeSensitivityHeatmap(params: H1InteractiveParams): H1HeatmapData {
	const cols = 19;
	const pValues = Array.from({ length: cols }, (_, i) =>
		round3(H1_LIMITS.p0.min + ((H1_LIMITS.p0.max - H1_LIMITS.p0.min) * i) / (cols - 1)),
	);
	const kValues = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32];
	const cells: H1HeatmapCell[] = [];
	const flipIndexByRow: (number | null)[] = [];
	const flip5yIndexByRow: (number | null)[] = [];

	let early = 0;
	let late = 0;
	let never = 0;

	for (let row = 0; row < kValues.length; row++) {
		const k = kValues[row]!;
		let firstCrossCol: number | null = null;
		let firstEarlyCol: number | null = null;
		for (let col = 0; col < pValues.length; col++) {
			const p0 = pValues[col]!;
			const res = computeCrossoverTrajectory({ ...params, baseStepReliability: p0, steps: k });
			const regimeClass: H1HeatmapCell['regimeClass'] =
				res.crossoverYear === null ? 'never' : res.crossoverYear <= 2031 ? 'early' : 'late';
			if (regimeClass === 'early') early++;
			else if (regimeClass === 'late') late++;
			else never++;
			if (firstCrossCol === null && res.crossoverYear !== null) firstCrossCol = col;
			if (firstEarlyCol === null && res.crossoverYear !== null && res.crossoverYear <= 2031) firstEarlyCol = col;
			cells.push({
				col,
				row,
				p0,
				steps: k,
				crossoverYear: res.crossoverYear,
				regimeClass,
				tailRisk2031: res.point2031.tailRisk,
				netSaving2031: res.point2031.netSaving,
			});
		}
		flipIndexByRow.push(firstCrossCol);
		flip5yIndexByRow.push(firstEarlyCol);
	}

	const total = cells.length;
	return {
		pValues,
		kValues,
		cells,
		flipIndexByRow,
		flip5yIndexByRow,
		shareEarly: early / total,
		shareLate: late / total,
		shareNever: never / total,
	};
}

/** Parsea el CSV público de 3.300 filas en cliente sin dependencias para contrastar con el escenario publicado. */
export function parseH1CsvSummary(
	csvText: string,
	sectorId: H1SectorId,
	regimeId: H1RegimeId,
): H1CsvBenchmarkSummary {
	const lines = csvText.trim().split(/\r?\n/);
	if (lines.length < 2) {
		throw new Error('CSV vacío o sin filas');
	}
	const headers = lines[0]!.split(',');
	const idx = (name: string) => {
		const i = headers.indexOf(name);
		if (i < 0) throw new Error(`Columna ausente en CSV: ${name}`);
		return i;
	};
	const iSeed = idx('seed');
	const iRegime = idx('regime');
	const iSector = idx('sector');
	const iYear = idx('year');
	const iDom = idx('autonomous_dominates');

	const bySeed = new Map<number, { cross: number | null; dom2031: boolean; dom2036: boolean }>();
	let matchedRows = 0;

	for (let n = 1; n < lines.length; n++) {
		const cols = lines[n]!.split(',');
		if (cols[iRegime] !== regimeId || cols[iSector] !== sectorId) continue;
		matchedRows++;
		const seed = Number(cols[iSeed]);
		const year = Number(cols[iYear]);
		const dom = cols[iDom] === 'true';
		const rec = bySeed.get(seed) ?? { cross: null, dom2031: false, dom2036: false };
		if (dom && (rec.cross === null || year < rec.cross)) rec.cross = year;
		if (year === 2031 && dom) rec.dom2031 = true;
		if (year === 2036 && dom) rec.dom2036 = true;
		bySeed.set(seed, rec);
	}

	const entries = [...bySeed.values()];
	const seeds = entries.length;
	if (seeds === 0) {
		return {
			totalRows: lines.length - 1,
			matchedRows: 0,
			seeds: 0,
			medianCrossoverYear: null,
			adoptionShare2031: 0,
			adoptionShare2036: 0,
		};
	}

	const crosses = entries
		.map((e) => e.cross)
		.filter((y): y is number => y !== null)
		.sort((a, b) => a - b);
	const medianCrossoverYear =
		crosses.length >= Math.ceil(seeds / 2)
			? (crosses[Math.floor((seeds - 1) / 2)] ?? null)
			: null;

	return {
		totalRows: lines.length - 1,
		matchedRows,
		seeds,
		medianCrossoverYear,
		adoptionShare2031: entries.filter((e) => e.dom2031).length / seeds,
		adoptionShare2036: entries.filter((e) => e.dom2036).length / seeds,
	};
}

export function leerParametrosH1(search: URLSearchParams): H1InteractiveParams {
	const rawSector = search.get('sector');
	const sectorId: H1SectorId = H1_SECTORS.some((s) => s.id === rawSector)
		? (rawSector as H1SectorId)
		: 'health-workflow-admin';
	const rawRegime = search.get('regime');
	const regimeId: H1RegimeId = H1_REGIMES.some((r) => r.id === rawRegime)
		? (rawRegime as H1RegimeId)
		: 'baseline-coevolution';
	const defaults = defaultParamsForSector(sectorId, regimeId);

	const num = (key: string, fallback: number, min: number, max: number) => {
		const raw = search.get(key);
		if (raw === null || raw === '') return fallback;
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
	};

	return {
		sectorId,
		regimeId,
		baseStepReliability: round3(num('p0', defaults.baseStepReliability, H1_LIMITS.p0.min, H1_LIMITS.p0.max)),
		steps: Math.round(num('k', defaults.steps, H1_LIMITS.steps.min, H1_LIMITS.steps.max)),
		agentAuditCost: Number(num('audit', defaults.agentAuditCost, H1_LIMITS.audit.min, H1_LIMITS.audit.max).toFixed(1)),
		baseDetectionRate: Number(num('det', defaults.baseDetectionRate, H1_LIMITS.det.min, H1_LIMITS.det.max).toFixed(2)),
	};
}

export function escribirParametrosH1(params: H1InteractiveParams): string {
	const query = new URLSearchParams({
		sector: params.sectorId,
		regime: params.regimeId,
		p0: params.baseStepReliability.toFixed(3),
		k: String(Math.round(params.steps)),
		audit: params.agentAuditCost.toFixed(1),
		det: params.baseDetectionRate.toFixed(2),
	});
	return `?${query.toString()}`;
}
