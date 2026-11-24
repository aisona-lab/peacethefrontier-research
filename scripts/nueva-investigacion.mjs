#!/usr/bin/env node
// Generador CLI de nuevas investigaciones originales bilingües + esqueleto de experimento.
// Uso: npm run research:new -- --slug mi-estudio --en-slug my-study --hipotesis H1 --numero 6
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const leerArg = (nombre) => {
	const idx = args.indexOf(`--${nombre}`);
	return idx >= 0 ? args[idx + 1] : undefined;
};

const slugEs = leerArg('slug');
const slugEn = leerArg('en-slug') ?? slugEs;
const hipotesis = leerArg('hipotesis') ?? 'H1';
const numero = Number(leerArg('numero') ?? '6');

if (!slugEs || !/^[a-z0-9-]+$/.test(slugEs) || !slugEn || !/^[a-z0-9-]+$/.test(slugEn)) {
	console.error(
		'Uso: npm run research:new -- --slug <slug-es> [--en-slug <slug-en>] [--hipotesis H1|H2|H3] [--numero N]',
	);
	process.exit(1);
}
if (!['H1', 'H2', 'H3'].includes(hipotesis) || !Number.isInteger(numero) || numero < 1) {
	console.error('Parámetros inválidos: --hipotesis debe ser H1|H2|H3 y --numero un entero positivo.');
	process.exit(1);
}

const hoy = new Date().toISOString().slice(0, 10);
const expId = `${hipotesis.toLowerCase()}-${slugEs}`;
const expDir = `experiments/${expId}`;
const esPath = `src/content/articulos/es/${slugEs}.mdx`;
const enPath = `src/content/articulos/en/${slugEn}.mdx`;

for (const ruta of [expDir, esPath, enPath]) {
	if (existsSync(ruta)) {
		console.error(`Ya existe: ${ruta}`);
		process.exit(1);
	}
}

await mkdir(expDir, { recursive: true });

await writeFile(
	`${expDir}/model.ts`,
	`// SPDX-License-Identifier: Apache-2.0
// Copyright ${hoy.slice(0, 4)} Carlos Nicolás Soto — Peace The Frontier Research Portfolio

export const VERSION = '0.1.0';

export function runSimulation(seed: number): { seed: number; metric: number } {
	if (!Number.isSafeInteger(seed) || seed < 1) throw new RangeError('seed must be >= 1');
	return { seed, metric: seed * 1.0 };
}
`,
);

await writeFile(
	`${expDir}/model.test.ts`,
	`import { expect, test } from 'vitest';
import { runSimulation } from './model';

test('${expId}: determinismo básico', () => {
	expect(runSimulation(1)).toEqual(runSimulation(1));
});
`,
);

const plantillaEs = `---
titulo: "Título de la investigación (${hipotesis})"
resumen: "Resumen conciso de la hipótesis, el modelo formal y el hallazgo cuantitativo."
clave: wp-${slugEs}
tipoPublicacion: working-paper
serie: PTF-WP
numero: ${numero}
version: 0.1.0
hipotesis: ${hipotesis}
repositorioCodigo: ${expDir}
comandoReproduccion: npm test
temas: [ia, gobernanza]
evidencia: emergente
autor: Carlos Nicolás Soto
publicado: ${hoy}
revisado: ${hoy}
fuentes: [iasr-2026]
asistidoPorIA: true
estado: borrador
sensible: false
---

import Nota from '../../../components/articulo/Nota.astro';

## Pregunta e hipótesis (${hipotesis})

Describe la pregunta científica y su vínculo con el informe de referencia.<Nota f="iasr-2026" />

## Modelo formal y diseño experimental

Documenta ecuaciones, variables y semillas reproducibles en \`${expDir}\`.

## Hallazgos cuantitativos

Presenta las métricas verificadas y sus intervalos.

## Criterio de refutación y limitaciones

Declara explícitamente qué observación empírica futura refutaría esta hipótesis.
`;

const plantillaEn = `---
titulo: "Investigation title (${hipotesis})"
resumen: "Concise summary of the hypothesis, formal model and quantitative finding."
clave: wp-${slugEs}
tipoPublicacion: working-paper
serie: PTF-WP
numero: ${numero}
version: 0.1.0
hipotesis: ${hipotesis}
repositorioCodigo: ${expDir}
comandoReproduccion: npm test
temas: [ia, gobernanza]
evidencia: emergente
autor: Carlos Nicolás Soto
publicado: ${hoy}
revisado: ${hoy}
fuentes: [iasr-2026]
asistidoPorIA: true
estado: borrador
sensible: false
---

import Nota from '../../../components/articulo/Nota.astro';

## Question and hypothesis (${hipotesis})

State the scientific question and its connection to the reference report.<Nota f="iasr-2026" />

## Formal model and experimental design

Document equations, variables and reproducible seeds in \`${expDir}\`.

## Quantitative findings

Report verified metrics and ranges.

## Falsifiability criterion and limitations

Explicitly state which future empirical observation would falsify this hypothesis.
`;

await writeFile(esPath, plantillaEs);
await writeFile(enPath, plantillaEn);

console.log(JSON.stringify({ created: [expDir, esPath, enPath] }, null, 2));
