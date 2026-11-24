// Afirmaciones del texto que dependen de datos o del modelo (revisión final de la fase G).
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { DECISIONES } from './caminos/decisiones';

const leer = (ruta: string) => readFileSync(ruta, 'utf8');
const ARTICULO_RIESGO = ['src/content/articulos/es/riesgo-de-catastrofe.mdx', 'src/content/articulos/en/risk-of-catastrophe.mdx'];

describe('el texto dice lo que dicen los datos', () => {
	test('el artículo de riesgo muestra las medianas de catástrofe por cualquier causa en las que se anclan los umbrales (XPT: 9,05 % y 20 %)', () => {
		for (const ruta of ARTICULO_RIESGO) {
			const texto = leer(ruta);
			expect(texto, ruta).toMatch(/9[.,]05\s?%/);
			expect(texto, ruta).toMatch(/\b20\s?%/);
			expect(texto, ruta).toMatch(/5 años|5-year|five-year|5 years/);
		}
	});

	test('"lo que más mueve el riesgo es h_conf" solo vale en el centro de la matriz y el texto lo dice', () => {
		for (const ruta of [...ARTICULO_RIESGO, 'src/content/paginas/es/futuros.mdx', 'src/content/paginas/en/futuros.mdx']) {
			const parrafo = leer(ruta).split('\n\n').find((p) => p.includes('parametro-hConf'));
			expect(parrafo, ruta).toBeDefined();
			expect(parrafo, ruta).toMatch(/centro|cent(re|er)/);
		}
	});

	test('la descripción de los caminos da el año de la última decisión', () => {
		const ultimo = String(DECISIONES.at(-1)!.anio);
		for (const ruta of ['src/content/paginas/es/caminos.mdx', 'src/content/paginas/en/caminos.mdx'])
			expect(leer(ruta).match(/^descripcion: .*$/m)?.[0], ruta).toContain(ultimo);
		const ui = leer('src/i18n/ui.ts');
		const descripciones = [...ui.matchAll(/caminos: \{\n\t\ttitulo: '[^']+',\n\t\tdescripcion: '([^']+)'/g)].map((m) => m[1]);
		expect(descripciones).toHaveLength(2);
		for (const d of descripciones) expect(d).toContain(ultimo);
	});
});
