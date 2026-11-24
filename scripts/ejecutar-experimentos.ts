import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
	H1_REGIMES,
	H1_SECTORS,
	H1_VERSION,
	simulateDelegationTrajectory,
	summarizeDelegation,
} from '../experiments/h1-delegacion-autonoma/model.ts';
import {
	H2_CAPABILITY_LEVELS,
	H2_REGIMES,
	H2_VERSION,
	simulateCoordinationScenario,
	summarizeCoordination,
} from '../experiments/h2-coordinacion-multiagente/model.ts';
import {
	H3_DOMAINS,
	H3_VERSION,
	simulateDomainTrajectory,
	summarizeDomains,
} from '../experiments/h3-ia-cientifica-vs-consumer/model.ts';

type Bilingual = { es: string; en: string };

export interface ExperimentArtifactFile {
	role: 'dataset' | 'schema' | 'source-code';
	path: string;
	repository_path: string;
	sha256: string;
	bytes: number;
	license: 'CC-BY-4.0' | 'Apache-2.0';
}

export interface PortfolioExperimentManifest {
	manifest_version: 1;
	id: string;
	hypothesis: 'H1' | 'H2' | 'H3';
	version: string;
	release_date: string;
	synthetic: true;
	title: Bilingual;
	description: Bilingual;
	code_repository_path: string;
	paper_slug: Bilingual;
	row_count: number;
	seed_count: number;
	reproduction_command: string;
	check_command: string;
	summary: unknown[];
	files: ExperimentArtifactFile[];
	limitations: Bilingual;
}

const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n';

function toCsv<T extends object>(rows: readonly T[]): { csv: string; columns: string[] } {
	const first = rows[0];
	if (!first) throw new Error('Experiment produced zero rows');
	const columns = Object.keys(first);
	const lines = [
		columns.join(','),
		...rows.map((r) => columns.map((k) => String((r as Record<string, unknown>)[k])).join(',')),
	];
	return { csv: lines.join('\n') + '\n', columns };
}

function makeExperimentBundle<T extends object>(spec: {
	id: string;
	hypothesis: 'H1' | 'H2' | 'H3';
	version: string;
	title: Bilingual;
	description: Bilingual;
	paperSlug: Bilingual;
	rows: readonly T[];
	seedCount: number;
	summary: unknown[];
	limitations: Bilingual;
}): { manifest: PortfolioExperimentManifest; files: Record<string, string> } {
	const root = `public/datos/experimentos/${spec.id}`;
	const publicBase = `/datos/experimentos/${spec.id}`;
	const codeRepoDir = `experiments/${spec.id}`;
	const sourceContent = readFileSync(`${codeRepoDir}/model.ts`, 'utf8');
	const { csv, columns } = toCsv(spec.rows);
	const schema = {
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: `${spec.id} synthetic dataset v${spec.version}`,
		type: 'object',
		required: columns,
		properties: Object.fromEntries(
			columns.map((c) => [
				c,
				{
					description: `Column ${c} of reproducible experiment ${spec.id} (synthetic=true).`,
				},
			]),
		),
	};

	const files: Record<string, string> = {};
	const entries: ExperimentArtifactFile[] = [];
	const add = (
		name: string,
		role: ExperimentArtifactFile['role'],
		content: string,
		license: ExperimentArtifactFile['license'],
	) => {
		const repository_path = `${root}/${name}`;
		files[repository_path] = content;
		entries.push({
			role,
			path: `${publicBase}/${name}`,
			repository_path,
			sha256: createHash('sha256').update(content).digest('hex'),
			bytes: Buffer.byteLength(content),
			license,
		});
	};

	add('dataset.csv', 'dataset', csv, 'CC-BY-4.0');
	add('schema.json', 'schema', json(schema), 'CC-BY-4.0');
	add('model.ts', 'source-code', sourceContent, 'Apache-2.0');

	const manifest: PortfolioExperimentManifest = {
		manifest_version: 1,
		id: spec.id,
		hypothesis: spec.hypothesis,
		version: spec.version,
		release_date: '2026-11-24',
		synthetic: true,
		title: spec.title,
		description: spec.description,
		code_repository_path: codeRepoDir,
		paper_slug: spec.paperSlug,
		row_count: spec.rows.length,
		seed_count: spec.seedCount,
		reproduction_command: 'npm run experiments:generate',
		check_command: 'npm run experiments:check',
		summary: spec.summary,
		files: entries,
		limitations: spec.limitations,
	};
	files[`${root}/manifest.json`] = json(manifest);
	return { manifest, files };
}

export function buildAllExperiments(): {
	manifests: PortfolioExperimentManifest[];
	files: Record<string, string>;
} {
	const seedsH1 = Array.from({ length: 20 }, (_, i) => i + 1);
	const rowsH1 = H1_REGIMES.flatMap((regime) =>
		H1_SECTORS.flatMap((sector) =>
			seedsH1.flatMap((seed) => simulateDelegationTrajectory(seed, regime, sector)),
		),
	);
	const b1 = makeExperimentBundle({
		id: 'h1-delegacion-autonoma',
		hypothesis: 'H1',
		version: H1_VERSION,
		title: {
			es: 'Economía de delegación y fiabilidad compuesta (2026–2036)',
			en: 'Delegation economics and compound reliability (2026–2036)',
		},
		description: {
			es: 'Umbrales de transición de copiloto a infraestructura autónoma en ciencia, educación, gobierno, gestión sanitaria y red eléctrica.',
			en: 'Copilot-to-autonomous infrastructure crossover thresholds across science, education, government, health admin and grid dispatch.',
		},
		paperSlug: {
			es: 'de-copilotos-a-agentes-autonomos',
			en: 'from-copilots-to-autonomous-agents',
		},
		rows: rowsH1,
		seedCount: seedsH1.length,
		summary: summarizeDelegation(rowsH1),
		limitations: {
			es: 'Modelo estructural parametrizado (100 % sintético); no es un ensayo clínico ni una medición observacional de plantillas laborales reales.',
			en: 'Parameterized structural model (100% synthetic); not a clinical trial or an observational measurement of real workforces.',
		},
	});

	const seedsH2 = Array.from({ length: 25 }, (_, i) => i + 1);
	const rowsH2 = H2_REGIMES.flatMap((regime) =>
		H2_CAPABILITY_LEVELS.flatMap((cap) =>
			seedsH2.map((seed) => simulateCoordinationScenario(seed, regime, cap)),
		),
	);
	const b2 = makeExperimentBundle({
		id: 'h2-coordinacion-multiagente',
		hypothesis: 'H2',
		version: H2_VERSION,
		title: {
			es: 'Juego multi-agente de coordinación y distorsión de benchmarks',
			en: 'Multi-agent coordination and benchmark-distortion game',
		},
		description: {
			es: 'Simulación estratégica de 8 actores en 40 rondas comparando carrera no coordinada, umbrales estáticos y compromisos verificables.',
			en: '8-actor, 40-round strategic simulation comparing uncoordinated racing, static benchmark gates and verifiable commitments.',
		},
		paperSlug: {
			es: 'superinteligencia-como-coordinacion',
			en: 'superintelligence-as-coordination',
		},
		rows: rowsH2,
		seedCount: seedsH2.length,
		summary: summarizeCoordination(rowsH2),
		limitations: {
			es: 'Juego estilizado con funciones de pago explícitas (100 % sintético); ilustra mecanismos de incentivos y Goodhart, no predice tratados reales.',
			en: 'Stylized game with explicit payoff functions (100% synthetic); illustrates incentive and Goodhart mechanisms rather than predicting real treaties.',
		},
	});

	const seedsH3 = Array.from({ length: 25 }, (_, i) => i + 1);
	const rowsH3 = H3_DOMAINS.flatMap((spec) =>
		seedsH3.flatMap((seed) => simulateDomainTrajectory(seed, spec)),
	);
	const b3 = makeExperimentBundle({
		id: 'h3-ia-cientifica-vs-consumer',
		hypothesis: 'H3',
		version: H3_VERSION,
		title: {
			es: 'Embudos de descubrimiento con oráculo verificable frente a IA consumer',
			en: 'Verifiable-oracle discovery funnels versus consumer AI',
		},
		description: {
			es: 'Ley de Amdahl del descubrimiento y excedente acumulado por PFLOP-día en materiales, triaje preclínico abstracto, clima y física frente a consumo.',
			en: 'Amdahl discovery bottlenecks and cumulative surplus per PFLOP-day across materials, abstract preclinical triage, climate and physics vs consumer AI.',
		},
		paperSlug: {
			es: 'ia-cientifica-frente-a-ia-consumo',
			en: 'scientific-ai-versus-consumer-ai',
		},
		rows: rowsH3,
		seedCount: seedsH3.length,
		summary: summarizeDomains(rowsH3),
		limitations: {
			es: 'Simulación estructural de embudos agregados (100 % sintética); conforme a R10 no modela moléculas ni protocolos experimentales.',
			en: 'Aggregate pipeline simulation (100% synthetic); per R10 it models no molecules or experimental protocols.',
		},
	});

	return {
		manifests: [b1.manifest, b2.manifest, b3.manifest],
		files: { ...b1.files, ...b2.files, ...b3.files },
	};
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	if (args.some((a) => a !== '--check')) {
		throw new Error('Usage: node scripts/ejecutar-experimentos.mjs [--check]');
	}
	const check = args.includes('--check');
	const { manifests, files } = buildAllExperiments();
	for (const [path, content] of Object.entries(files)) {
		if (check) {
			const current = await readFile(path, 'utf8');
			if (current !== content) throw new Error(`Experiment artifact mismatch: ${path}`);
		} else {
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, content, 'utf8');
		}
	}
	console.log(
		json({
			mode: check ? 'verified' : 'generated',
			experiments: manifests.map((m) => ({
				id: m.id,
				hypothesis: m.hypothesis,
				rows: m.row_count,
				files: m.files.length,
			})),
		}),
	);
}

const isDirectRun =
	typeof process !== 'undefined' &&
	Boolean(process.argv[1]) &&
	import.meta.url.endsWith('/scripts/ejecutar-experimentos.ts');

if (isDirectRun) {
	main().catch((err) => {
		console.error(err);
		process.exitCode = 1;
	});
}
