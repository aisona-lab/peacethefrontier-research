import { readFile } from 'node:fs/promises';
import { z } from 'astro/zod';

export const esquemaManifiestoEmpirico = z.object({
	manifest_version: z.literal(1),
	id: z.literal('h1-observado'),
	hypothesis: z.literal('H1'),
	synthetic: z.literal(false),
	status: z.enum(['collection-pending', 'collecting', 'calibrated']),
	protocol_path: z.literal('experiments/h1-empirico/PROTOCOL.md'),
	last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	observed_row_count: z.number().int().nonnegative(),
	csv_path: z.literal('/datos/empirico/h1-observado.csv'),
	csv_sha256: z.string().regex(/^[a-f0-9]{64}$/),
	license: z.literal('CC-BY-4.0'),
});

export interface RegistroEmpiricoH1 {
	readonly recordId: string;
	readonly collectedDate: string;
	readonly sourceType: 'open-repo-pr' | 'author-agent-log';
	readonly sourceRef: string;
	readonly sector: string;
	readonly chainSteps: number;
	readonly stepFailures: number;
	readonly verificationMinutes: number;
	readonly estimatedManualMinutes: number | null;
	readonly outcome: 'accepted-clean' | 'accepted-with-rework' | 'rejected';
	readonly notes: string;
}

export interface ResumenEmpiricoH1 {
	readonly manifest: z.infer<typeof esquemaManifiestoEmpirico>;
	readonly records: readonly RegistroEmpiricoH1[];
	readonly meanStepFailureRate: number | null;
	readonly meanVerificationMinutes: number | null;
	readonly cleanAcceptanceRate: number | null;
}

export async function leerDatosEmpiricosH1(): Promise<ResumenEmpiricoH1> {
	const [rawManifest, rawCsv] = await Promise.all([
		readFile('public/datos/empirico/manifest.json', 'utf8'),
		readFile('public/datos/empirico/h1-observado.csv', 'utf8'),
	]);
	const manifest = esquemaManifiestoEmpirico.parse(JSON.parse(rawManifest));
	const lines = rawCsv.trim().split(/\r?\n/).slice(1).filter((l) => l.trim().length > 0);
	const records: RegistroEmpiricoH1[] = lines.map((line) => {
		const [
			,
			recordId,
			collectedDate,
			sourceType,
			sourceRef,
			sector,
			chainSteps,
			stepFailures,
			verificationMinutes,
			estimatedManualMinutes,
			outcome,
			...rest
		] = line.split(',');
		return {
			recordId: recordId!,
			collectedDate: collectedDate!,
			sourceType: sourceType as RegistroEmpiricoH1['sourceType'],
			sourceRef: sourceRef!,
			sector: sector!,
			chainSteps: Number(chainSteps),
			stepFailures: Number(stepFailures),
			verificationMinutes: Number(verificationMinutes),
			estimatedManualMinutes: estimatedManualMinutes ? Number(estimatedManualMinutes) : null,
			outcome: outcome as RegistroEmpiricoH1['outcome'],
			notes: rest.join(','),
		};
	});

	if (records.length === 0) {
		return {
			manifest,
			records: [],
			meanStepFailureRate: null,
			meanVerificationMinutes: null,
			cleanAcceptanceRate: null,
		};
	}

	const totalSteps = records.reduce((acc, r) => acc + r.chainSteps, 0);
	const totalFailures = records.reduce((acc, r) => acc + r.stepFailures, 0);
	const totalVerif = records.reduce((acc, r) => acc + r.verificationMinutes, 0);
	const clean = records.filter((r) => r.outcome === 'accepted-clean').length;

	return {
		manifest,
		records,
		meanStepFailureRate: totalSteps > 0 ? totalFailures / totalSteps : null,
		meanVerificationMinutes: totalVerif / records.length,
		cleanAcceptanceRate: clean / records.length,
	};
}
