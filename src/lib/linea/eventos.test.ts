import { describe, expect, test } from 'vitest';
import { CUADRANTE_IDS } from '../futuros/posicion';
import { EVENTOS, eventosDelFuturo, textoAnio } from './eventos';

describe('eventos de la línea del tiempo', () => {
	test('ids únicos y aptos para la URL, en orden cronológico, de 3500 a. C. a hoy', () => {
		expect(new Set(EVENTOS.map((e) => e.id)).size).toBe(EVENTOS.length);
		for (const e of EVENTOS) expect(e.id).toMatch(/^[a-z0-9-]+$/);
		const anios = EVENTOS.map((e) => e.anio);
		expect(anios).toEqual([...anios].sort((a, b) => a - b));
		expect(anios[0]).toBeGreaterThanOrEqual(-3500);
		expect(anios.at(-1)).toBeLessThanOrEqual(2026);
	});

	test('cada evento tiene temas y fuentes', () => {
		for (const e of EVENTOS) {
			expect(e.temas.length, e.id).toBeGreaterThan(0);
			expect(e.fuentes.length, e.id).toBeGreaterThan(0);
		}
	});

	test('conocimiento perdido y recuperado van en pares que se apuntan entre sí (R4.5)', () => {
		const porId = new Map(EVENTOS.map((e) => [e.id, e]));
		const pares = EVENTOS.filter((e) => e.tipo !== 'hito');
		expect(pares.length).toBeGreaterThanOrEqual(8);
		for (const e of pares) {
			const otro = porId.get(e.par ?? '');
			expect(otro?.par, e.id).toBe(e.id);
			expect(otro?.tipo, e.id).toBe(e.tipo === 'perdido' ? 'recuperado' : 'perdido');
			if (e.tipo === 'perdido') expect(otro!.anio, e.id).toBeGreaterThan(e.anio);
		}
		for (const e of EVENTOS.filter((x) => x.tipo === 'hito')) expect(e.par, e.id).toBeUndefined();
	});

	test('los años se escriben con su era', () => {
		expect(textoAnio({ anio: -3200, aprox: true }, 'es')).toBe('c. 3200 a. C.');
		expect(textoAnio({ anio: -3200, aprox: true }, 'en')).toBe('c. 3200 BCE');
		expect(textoAnio({ anio: 79 }, 'es')).toBe('79');
		expect(textoAnio({ anio: 1543 }, 'en')).toBe('1543');
		expect(textoAnio({ anio: -250, fecha: { es: 'siglo III a. C.', en: '3rd century BCE' } }, 'en')).toBe('3rd century BCE');
	});
});

describe('los futuros como ramas', () => {
	test('cada futuro trae sus eventos del modelo, de 2027 a 2126, con una sola crisis', () => {
		for (const id of CUADRANTE_IDS) {
			const eventos = eventosDelFuturo(id);
			expect(eventos.length, id).toBeGreaterThan(0);
			for (const e of eventos) expect(e.anio).toBeGreaterThan(2026);
			expect(eventos.filter((e) => e.id === 'crisis').length, id).toBeLessThanOrEqual(1);
			const anios = eventos.map((e) => e.anio);
			expect(anios).toEqual([...anios].sort((a, b) => a - b));
		}
	});
});
