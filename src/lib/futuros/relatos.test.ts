import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { CUADRANTE_IDS } from './posicion';
import { AMBITOS, INDICADORES } from './tipos';

const DIR = 'src/content/futuros';
const DECADAS = Array.from({ length: 11 }, (_, i) => 2026 + i * 10);
const CON_RELATO = [2036, 2056, 2086, 2126];

const archivos = (['es', 'en'] as const).flatMap((lang) =>
	CUADRANTE_IDS.map((id) => join(DIR, lang, `${id}.mdx`)).filter((ruta) => existsSync(ruta)),
);

test('existen los ocho relatos (4 futuros × 2 idiomas)', () => {
	expect(archivos).toHaveLength(8);
});

for (const archivo of archivos) {
	describe(archivo, () => {
		const texto = readFileSync(archivo, 'utf8');
		const paradas = texto
			.split('<Parada anio={')
			.slice(1)
			.map((cuerpo) => ({ anio: Number(cuerpo.slice(0, 4)), cuerpo }));

		test('tiene las 11 décadas en orden', () => {
			expect(paradas.map((p) => p.anio)).toEqual(DECADAS);
		});

		test('relato en 2036, 2056, 2086 y 2126 con los cinco ámbitos; el resto, autocerradas', () => {
			for (const { anio, cuerpo } of paradas) {
				const autocerrada = /^\d{4}\} \/>/.test(cuerpo);
				expect(autocerrada, `parada ${anio}`).toBe(!CON_RELATO.includes(anio));
				if (autocerrada) continue;
				const ambitos = [...cuerpo.matchAll(/<Ambito id="([a-z]+)">([\s\S]*?)<\/Ambito>/g)];
				expect(ambitos.map((a) => a[1]), `ámbitos de ${anio}`).toEqual([...AMBITOS]);
				for (const [, ambito, contenido] of ambitos) expect(contenido, `${anio} ${ambito}`).toMatch(/<Cifra /);
			}
		});

		test('cada cifra usa un indicador válido y el año de su parada', () => {
			for (const { anio, cuerpo } of paradas)
				for (const [, v, anioCifra] of cuerpo.matchAll(/<Cifra v="([a-zA-Z]+)" anio=\{(\d{4})\} \/>/g)) {
					expect(INDICADORES).toContain(v);
					expect(Number(anioCifra)).toBe(anio);
				}
		});

		test('ningún número del relato se escribe a mano (todos van en <Cifra>)', () => {
			const sinCifras = texto
				.replace(/^---[\s\S]*?---/, '')
				.replace(/<Cifra[^>]*\/>/g, '')
				.replace(/<Parada anio=\{\d{4}\}/g, '');
			expect(sinCifras).not.toMatch(/\d+\s?(%|°C|TWh|millones|million|billion)/);
		});

		test('ni años de eventos ni cantidades en palabras: el texto debe valer para cualquier posición (revisión, hallazgo 2)', () => {
			const prosa = texto
				.replace(/^---[\s\S]*?---/, '')
				.replace(/<Cifra[^>]*\/>/g, '')
				.replace(/<Parada anio=\{\d{4}\}/g, '');
			// 2026 es el año base de todas las comparaciones; cualquier otro año depende del modelo.
			expect(prosa.replace(/2026/g, '')).not.toMatch(/\b(19|20|21)\d{2}\b/);
			expect(prosa).not.toMatch(/\b(mitad|half|diez|ten|doble|double|triple)\b/i);
		});
	});
}
