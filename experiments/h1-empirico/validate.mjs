#!/usr/bin/env node
// Validador estricto del dataset empírico de H1 (public/datos/empirico/h1-observado.csv).
// Garantiza: cabecera exacta, observed=true, procedencia obligatoria por fila y coherencia con manifest.json.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const CSV_PATH = 'public/datos/empirico/h1-observado.csv';
const MANIFEST_PATH = 'public/datos/empirico/manifest.json';

const EXPECTED_HEADERS = [
	'observed',
	'record_id',
	'collected_date',
	'source_type',
	'source_ref',
	'sector',
	'chain_steps',
	'step_failures',
	'verification_minutes',
	'estimated_manual_minutes',
	'outcome',
	'notes',
];

const VALID_SECTORS = new Set([
	'computational-science',
	'education-tutoring',
	'public-administration',
	'health-workflow-admin',
	'energy-grid-dispatch',
]);
const VALID_SOURCES = new Set(['open-repo-pr', 'author-agent-log']);
const VALID_OUTCOMES = new Set(['accepted-clean', 'accepted-with-rework', 'rejected']);

const rawCsv = readFileSync(CSV_PATH, 'utf8');
const lines = rawCsv.trim().split(/\r?\n/);
const headers = lines[0]?.split(',') ?? [];
if (headers.join(',') !== EXPECTED_HEADERS.join(',')) {
	throw new Error(`Cabecera CSV inválida. Esperada: ${EXPECTED_HEADERS.join(',')}`);
}

const rows = lines.slice(1).filter((l) => l.trim().length > 0);
const ids = new Set();

for (let i = 0; i < rows.length; i++) {
	const cols = rows[i].split(',');
	if (cols.length < EXPECTED_HEADERS.length) {
		throw new Error(`Fila ${i + 2}: número de columnas insuficiente`);
	}
	const [
		observed,
		recordId,
		collectedDate,
		sourceType,
		sourceRef,
		sector,
		chainSteps,
		stepFailures,
		verificationMinutes,
		,
		outcome,
	] = cols;

	if (observed !== 'true') throw new Error(`Fila ${i + 2}: observed debe ser true (nunca sintético)`);
	if (!/^OBS-\d{6}-\d{3}$/.test(recordId) || ids.has(recordId)) {
		throw new Error(`Fila ${i + 2}: record_id inválido o duplicado (${recordId})`);
	}
	ids.add(recordId);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(collectedDate)) throw new Error(`Fila ${i + 2}: fecha inválida`);
	if (!VALID_SOURCES.has(sourceType)) throw new Error(`Fila ${i + 2}: source_type inválido (${sourceType})`);
	if (!/^(https:\/\/github\.com\/[^\s,]+|sha256:[a-f0-9]{64})$/.test(sourceRef)) {
		throw new Error(`Fila ${i + 2}: source_ref sin procedencia verificable (${sourceRef})`);
	}
	if (!VALID_SECTORS.has(sector)) throw new Error(`Fila ${i + 2}: sector inválido (${sector})`);
	const steps = Number(chainSteps);
	const fails = Number(stepFailures);
	const mins = Number(verificationMinutes);
	if (!Number.isInteger(steps) || steps < 1) throw new Error(`Fila ${i + 2}: chain_steps inválido`);
	if (!Number.isInteger(fails) || fails < 0 || fails > steps) {
		throw new Error(`Fila ${i + 2}: step_failures debe estar entre 0 y chain_steps`);
	}
	if (!Number.isFinite(mins) || mins < 0) throw new Error(`Fila ${i + 2}: verification_minutes inválido`);
	if (!VALID_OUTCOMES.has(outcome)) throw new Error(`Fila ${i + 2}: outcome inválido (${outcome})`);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const actualSha = createHash('sha256').update(rawCsv).digest('hex');
if (manifest.synthetic !== false) throw new Error('manifest.json empírico debe declarar synthetic=false');
if (manifest.observed_row_count !== rows.length) {
	throw new Error(`manifest.observed_row_count (${manifest.observed_row_count}) != filas CSV (${rows.length})`);
}
if (manifest.csv_sha256 !== actualSha) {
	throw new Error(`manifest.csv_sha256 (${manifest.csv_sha256}) != hash actual (${actualSha})`);
}

console.log(
	JSON.stringify(
		{
			mode: 'verified',
			dataset: CSV_PATH,
			status: manifest.status,
			observed_rows: rows.length,
			csv_sha256: actualSha,
		},
		null,
		2,
	),
);
