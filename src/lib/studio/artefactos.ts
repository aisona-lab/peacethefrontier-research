import { readFile } from 'node:fs/promises';
import { z } from 'astro/zod';
import { HIPOTESIS_IDS } from '../programa/hipotesis';

const traduccion = z.object({ es: z.string().min(1), en: z.string().min(1) });
const ruta = z.string().regex(/^\/datos\/studio\/[A-Za-z0-9._-]+$/);

export const esquemaArtefacto = z.object({
	synthetic: z.literal(true),
	status: z.literal('synthetic-toy-experiment'),
	version: z.string(),
	title: traduccion,
	description: traduccion,
	license: z.object({ id: z.literal('CC-BY-4.0'), url: z.url() }),
	code_license: z.object({ id: z.literal('Apache-2.0'), path: ruta }),
	seeds: z.array(z.number().int()),
	experiment: z.object({
		row_count: z.number().int().positive(),
		hours_per_seed: z.number().int().positive(),
		policy_count: z.number().int().positive(),
	}),
	policies: z.array(
		z.object({
			id: z.string(),
			label: traduccion,
			capacity_slots: z.number().positive(),
			recovery_slots_per_hour: z.number().positive(),
			metrics: z.object({
				service_ratio: z.number().min(0).max(1),
				total_unmet_service_units: z.number().nonnegative(),
				shortage_hours: z.number().int().nonnegative(),
			}),
		}),
	),
	files: z.array(
		z.object({
			role: z.enum(['dataset', 'schema', 'dataset-card', 'license', 'source-code']),
			path: ruta,
			sha256: z.string().regex(/^[a-f0-9]{64}$/),
			bytes: z.number().int().positive(),
			license: z.enum(['CC-BY-4.0', 'Apache-2.0']),
			language: z.enum(['es', 'en']).optional(),
		}),
	),
});

export const EXPERIMENTO_IDS = [
	'h1-delegacion-autonoma',
	'h2-coordinacion-multiagente',
	'h3-ia-cientifica-vs-consumer',
] as const;
export type ExperimentoId = (typeof EXPERIMENTO_IDS)[number];

const rutaExperimento = z.string().regex(/^\/datos\/experimentos\/[a-z0-9-]+\/[A-Za-z0-9._-]+$/);

export const esquemaExperimentoPortafolio = z.object({
	manifest_version: z.literal(1),
	id: z.enum(EXPERIMENTO_IDS),
	hypothesis: z.enum(HIPOTESIS_IDS),
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	synthetic: z.literal(true),
	title: traduccion,
	description: traduccion,
	code_repository_path: z.string().regex(/^experiments\/[a-z0-9-]+$/),
	paper_slug: traduccion,
	row_count: z.number().int().positive(),
	seed_count: z.number().int().positive(),
	reproduction_command: z.string().min(1),
	check_command: z.string().min(1),
	summary: z.array(z.record(z.string(), z.unknown())).min(1),
	files: z
		.array(
			z.object({
				role: z.enum(['dataset', 'schema', 'source-code']),
				path: rutaExperimento,
				repository_path: z.string().min(1),
				sha256: z.string().regex(/^[a-f0-9]{64}$/),
				bytes: z.number().int().positive(),
				license: z.enum(['CC-BY-4.0', 'Apache-2.0']),
			}),
		)
		.length(3),
	limitations: traduccion,
});

export type ExperimentoPortafolio = z.infer<typeof esquemaExperimentoPortafolio>;

let cargado: Promise<z.infer<typeof esquemaArtefacto>> | undefined;
export function leerArtefacto() {
	return (cargado ??= readFile('public/datos/studio/manifest.json', 'utf8').then((text) =>
		esquemaArtefacto.parse(JSON.parse(text)),
	));
}

let experimentosCargados: Promise<ExperimentoPortafolio[]> | undefined;
export function leerExperimentosPortafolio(): Promise<ExperimentoPortafolio[]> {
	return (experimentosCargados ??= Promise.all(
		EXPERIMENTO_IDS.map((id) =>
			readFile(`public/datos/experimentos/${id}/manifest.json`, 'utf8').then((text) =>
				esquemaExperimentoPortafolio.parse(JSON.parse(text)),
			),
		),
	));
}

export async function leerExperimento(id: string): Promise<ExperimentoPortafolio> {
	const lista = await leerExperimentosPortafolio();
	const exp = lista.find((e) => e.id === id);
	if (!exp) throw new Error(`Experimento desconocido: ${id}`);
	return exp;
}
