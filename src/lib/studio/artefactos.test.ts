import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { EXPERIMENTO_IDS, esquemaArtefacto, esquemaExperimentoPortafolio } from './artefactos';

const actual = () => JSON.parse(readFileSync('public/datos/studio/manifest.json', 'utf8'));

test('el catálogo solo muestra artefactos sintéticos con métricas y descargas válidas', () => {
	expect(esquemaArtefacto.parse(actual()).experiment.row_count).toBe(2880);
	expect(esquemaArtefacto.safeParse({ ...actual(), synthetic: false }).success).toBe(false);
	const manifest = actual();
	manifest.files[0].path = 'https://example.org/fake.csv';
	expect(esquemaArtefacto.safeParse(manifest).success).toBe(false);
});

test('los tres experimentos del portafolio tienen manifiestos válidos y hashes SHA-256 exactos', () => {
	for (const id of EXPERIMENTO_IDS) {
		const raw = JSON.parse(readFileSync(`public/datos/experimentos/${id}/manifest.json`, 'utf8'));
		const parsed = esquemaExperimentoPortafolio.parse(raw);
		expect(parsed.synthetic).toBe(true);
		for (const file of parsed.files) {
			const bytes = readFileSync(file.repository_path);
			expect(bytes.byteLength).toBe(file.bytes);
			expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
		}
	}
});
