import { existsSync, readFileSync } from 'node:fs';
import YAML from 'yaml';
import { describe, expect, test } from 'vitest';
import { HIPOTESIS, TESIS_CENTRAL, hipotesisPorId } from './hipotesis';
import { AGENDA_ACTIVA, BITACORA } from './bitacora';

describe('programa científico e hipótesis falsables (R18–R20)', () => {
	test('la tesis central y las tres hipótesis enlazan a temas reales, código en experiments/ y criterios de refutación', () => {
		expect(TESIS_CENTRAL.es.titulo.length).toBeGreaterThan(20);
		expect(TESIS_CENTRAL.en.titulo.length).toBeGreaterThan(20);
		const temasIds = new Set(
			(YAML.parse(readFileSync('src/content/temas.yaml', 'utf8')) as { id: string }[]).map((t) => t.id),
		);
		expect(HIPOTESIS).toHaveLength(3);
		for (const h of HIPOTESIS) {
			expect(hipotesisPorId(h.id)).toBe(h);
			expect(existsSync(`${h.rutaCodigo}/model.ts`), h.rutaCodigo).toBe(true);
			expect(existsSync(`public/datos/experimentos/${h.experimentoId}/manifest.json`), h.experimentoId).toBe(true);
			expect(h.es.criterioRefutacion.length).toBeGreaterThan(40);
			expect(h.en.criterioRefutacion.length).toBeGreaterThan(40);
			for (const t of h.temas) expect(temasIds.has(t), `${h.id}:${t}`).toBe(true);
		}
	});

	test('la bitácora y la agenda activa cubren las tres hipótesis en ambos idiomas', () => {
		expect(BITACORA.length).toBeGreaterThanOrEqual(5);
		expect(AGENDA_ACTIVA).toHaveLength(3);
		expect(new Set(AGENDA_ACTIVA.map((a) => a.hipotesis))).toEqual(new Set(['H1', 'H2', 'H3']));
	});
});
