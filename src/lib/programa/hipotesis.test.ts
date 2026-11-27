import { existsSync, readFileSync } from 'node:fs';
import YAML from 'yaml';
import { describe, expect, test } from 'vitest';
import { HIPOTESIS, TESIS_CENTRAL, hipotesisPorId } from './hipotesis';
import { AGENDA_ACTIVA, BITACORA } from './bitacora';

describe('programa científico, honestidad epistémica y congelación (R18–R24)', () => {
	test('la tesis central incluye aviso de simulación y H1–H3 están clasificadas como escenario con código y refutabilidad', () => {
		expect(TESIS_CENTRAL.es.titulo.length).toBeGreaterThan(20);
		expect(TESIS_CENTRAL.en.titulo.length).toBeGreaterThan(20);
		expect(TESIS_CENTRAL.es.avisoSimulacion).toContain('synthetic=true');
		expect(TESIS_CENTRAL.en.avisoSimulacion).toContain('synthetic=true');
		const temasIds = new Set(
			(YAML.parse(readFileSync('src/content/temas.yaml', 'utf8')) as { id: string }[]).map((t) => t.id),
		);
		expect(HIPOTESIS).toHaveLength(3);
		for (const h of HIPOTESIS) {
			expect(hipotesisPorId(h.id)).toBe(h);
			expect(h.evidencia, `${h.id} debe ser escenario hasta calibración empírica`).toBe('escenario-ficcion');
			expect(existsSync(`${h.rutaCodigo}/model.ts`), h.rutaCodigo).toBe(true);
			expect(existsSync(`public/datos/experimentos/${h.experimentoId}/manifest.json`), h.experimentoId).toBe(true);
			if (h.rutaNotebookColab) expect(existsSync(h.rutaNotebookColab), h.rutaNotebookColab).toBe(true);
			expect(h.es.criterioRefutacion.length).toBeGreaterThan(40);
			expect(h.en.criterioRefutacion.length).toBeGreaterThan(40);
			for (const t of h.temas) expect(temasIds.has(t), `${h.id}:${t}`).toBe(true);
		}
		expect(hipotesisPorId('H1').estadoPrograma).toBe('en-calibracion-empirica');
		expect(hipotesisPorId('H2').estadoPrograma).toBe('congelada-como-escenario');
		expect(hipotesisPorId('H3').estadoPrograma).toBe('congelada-como-escenario');
	});

	test('la agenda activa respeta la congelación de alcance y se centra exclusivamente en H1', () => {
		expect(BITACORA.length).toBeGreaterThanOrEqual(5);
		expect(AGENDA_ACTIVA).toHaveLength(3);
		expect(new Set(AGENDA_ACTIVA.map((a) => a.hipotesis))).toEqual(new Set(['H1']));
	});
});
