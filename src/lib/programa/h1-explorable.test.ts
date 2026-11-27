import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
	computeAllSectorsComparison,
	computeCrossoverTrajectory,
	computeSensitivityHeatmap,
	defaultParamsForSector,
	escribirParametrosH1,
	leerParametrosH1,
	parseH1CsvSummary,
} from './h1-explorable';

describe('Explorable interactivo H1 (R22)', () => {
	test('aumentar la longitud de cadena K o bajar la fiabilidad por paso retrasa o impide el cruce', () => {
		const sci = defaultParamsForSector('computational-science', 'baseline-coevolution');
		expect(computeCrossoverTrajectory(sci).crossoverYear).toBe(2028);

		const sciInvertido = computeCrossoverTrajectory({
			...sci,
			baseStepReliability: 0.7,
			steps: 24,
			baseDetectionRate: 0.5,
		});
		expect(sciInvertido.crossoverYear).toBeNull();

		const salud = defaultParamsForSector();
		expect(computeCrossoverTrajectory(salud).crossoverYear).toBe(2033);
		expect(
			computeCrossoverTrajectory({ ...salud, baseStepReliability: 0.75, steps: 20 }).crossoverYear,
		).toBeNull();
	});

	test('el mapa de calor identifica una frontera clara donde se invierte la conclusión en la vista inicial', () => {
		const base = defaultParamsForSector();
		const heat = computeSensitivityHeatmap(base);
		expect(heat.cells).toHaveLength(heat.pValues.length * heat.kValues.length);
		expect(heat.shareNever).toBeGreaterThan(0.2);
		expect(heat.shareEarly + heat.shareLate).toBeGreaterThan(0.2);
		expect(heat.flipIndexByRow.filter((idx) => idx !== null && idx > 0).length).toBeGreaterThanOrEqual(5);
	});

	test('parsea el dataset.csv publicado de 3.300 filas y reproduce exactamente las medianas del manifiesto', () => {
		const csv = readFileSync('public/datos/experimentos/h1-delegacion-autonoma/dataset.csv', 'utf8');
		const sci = parseH1CsvSummary(csv, 'computational-science', 'baseline-coevolution');
		expect(sci.totalRows).toBe(3300);
		expect(sci.seeds).toBe(20);
		expect(sci.medianCrossoverYear).toBe(2028);
		expect(sci.adoptionShare2031).toBe(1);

		const salud = parseH1CsvSummary(csv, 'health-workflow-admin', 'baseline-coevolution');
		expect(salud.medianCrossoverYear).toBe(2033);

		const gridCons = parseH1CsvSummary(csv, 'energy-grid-dispatch', 'conservative');
		expect(gridCons.medianCrossoverYear).toBeNull();
		expect(gridCons.adoptionShare2036).toBe(0);
	});

	test('la serialización en URL sobrevive round-trip y limita valores fuera de rango', () => {
		const custom = {
			sectorId: 'energy-grid-dispatch' as const,
			regimeId: 'verifier-infrastructure' as const,
			baseStepReliability: 0.945,
			steps: 12,
			agentAuditCost: 9.5,
			baseDetectionRate: 0.91,
		};
		const qs = escribirParametrosH1(custom);
		expect(leerParametrosH1(new URLSearchParams(qs))).toEqual(custom);

		const corrupt = leerParametrosH1(new URLSearchParams('?sector=falso&p0=99&k=-5&audit=999&det=0'));
		expect(corrupt.sectorId).toBe('health-workflow-admin');
		expect(corrupt.baseStepReliability).toBe(0.985);
		expect(corrupt.steps).toBe(2);
		expect(corrupt.agentAuditCost).toBe(40);
		expect(corrupt.baseDetectionRate).toBe(0.5);
	});

	test('la comparación de cinco sectores devuelve exactamente los 5 sectores de H1', () => {
		const list = computeAllSectorsComparison(defaultParamsForSector('education-tutoring'));
		expect(list).toHaveLength(5);
		expect(list.filter((x) => x.isSelected)).toHaveLength(1);
	});
});
