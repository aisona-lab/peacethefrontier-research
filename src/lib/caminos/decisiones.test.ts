import { describe, expect, test } from 'vitest';
import { HOY } from '../futuros/hoy';
import { cuadranteCercano } from '../futuros/posicion';
import { DECISIONES, INICIO } from './decisiones';
import { destino, etiqueta, recorrer } from './motor';

const final = (elecciones: (string | undefined)[]) => recorrer(DECISIONES, elecciones, INICIO).at(-1)!;

describe('las decisiones', () => {
	test('entre 8 y 12, de 2026 a 2040 y en orden', () => {
		expect(DECISIONES.length).toBeGreaterThanOrEqual(8);
		expect(DECISIONES.length).toBeLessThanOrEqual(12);
		const anios = DECISIONES.map((d) => d.anio);
		expect(anios).toEqual([...anios].sort((a, b) => a - b));
		expect(anios[0]).toBeGreaterThanOrEqual(2026);
		expect(anios.at(-1)).toBeLessThanOrEqual(2040);
	});

	test('ids únicos, sin puntos (van en la URL), 2–3 opciones y al menos una fuente', () => {
		expect(new Set(DECISIONES.map((d) => d.id)).size).toBe(DECISIONES.length);
		for (const d of DECISIONES) {
			expect(d.opciones.length, d.id).toBeGreaterThanOrEqual(2);
			expect(d.opciones.length, d.id).toBeLessThanOrEqual(3);
			expect(d.fuentes.length, d.id).toBeGreaterThan(0);
			expect(new Set(d.opciones.map((o) => o.id)).size, d.id).toBe(d.opciones.length);
			for (const o of d.opciones) expect(o.id, d.id).toMatch(/^[a-z0-9-]+$/);
		}
	});

	test('el camino empieza en el punto de hoy', () => {
		expect(INICIO).toEqual({ paz: HOY.paz.central, frontera: HOY.frontera.central });
	});

	test('desde hoy se puede llegar a los cuatro futuros, aunque la mayoría de caminos acaba en Carrera (lo dice el texto)', () => {
		const cuenta = new Map<string, number>();
		const explorar = (i: number, elecciones: string[]) => {
			if (i === DECISIONES.length) {
				const id = destino(final(elecciones), 'es').id;
				return void cuenta.set(id, (cuenta.get(id) ?? 0) + 1);
			}
			for (const o of DECISIONES[i].opciones) explorar(i + 1, [...elecciones, o.id]);
		};
		explorar(0, []);
		expect([...cuenta.keys()].sort()).toEqual(['carrera', 'fractura', 'frontera-en-paz', 'pausa']);
		const total = [...cuenta.values()].reduce((a, b) => a + b, 0);
		expect(cuenta.get('carrera')! / total).toBeGreaterThan(0.5);
	});

	test('lo que dice el texto: sin decidir nada seguimos en Carrera; siempre lo ético lleva a Pausa', () => {
		expect(cuadranteCercano(final([]))).toBe('carrera');
		const etica = DECISIONES.map((d) => d.opciones.find((o) => etiqueta(o.criterios) === 'etico')?.id);
		expect(etica.every(Boolean)).toBe(true);
		expect(destino(final(etica), 'es').id).toBe('pausa');
	});
});
