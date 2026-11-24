import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { estadoEditorialMdx, urlsArticulosBorrador } from './sitemap-borradores';

describe('estadoEditorialMdx', () => {
	it('lee los cuatro estados solo en el frontmatter', () => {
		for (const estado of ['publicado', 'nota-investigacion', 'borrador', 'actualizacion-pendiente'])
			expect(estadoEditorialMdx(`---\ntitulo: X\nestado: ${estado}\n---`)).toBe(estado);
		expect(estadoEditorialMdx('---\nestado: "borrador"\n---')).toBe('borrador');
		expect(estadoEditorialMdx('---\ntitulo: X\n---\nestado: borrador')).toBeUndefined();
		expect(estadoEditorialMdx('---\nborrador: true\n---')).toBeUndefined();
	});
});

describe('urlsArticulosBorrador', () => {
	let tmp: string;

	afterEach(() => {
		if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
	});

	it('devuelve URLs absolutas ES y EN de los mdx en borrador', () => {
		tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-borradores-'));
		fs.mkdirSync(path.join(tmp, 'es'), { recursive: true });
		fs.mkdirSync(path.join(tmp, 'en'), { recursive: true });
		fs.writeFileSync(path.join(tmp, 'es', 'computo-de-la-ia.mdx'), '---\nestado: borrador\n---\n');
		fs.writeFileSync(path.join(tmp, 'en', 'compute-behind-ai.mdx'), '---\nestado: borrador\n---\n');
		fs.writeFileSync(path.join(tmp, 'en', 'ready.mdx'), '---\nestado: publicado\n---\n');

		const urls = urlsArticulosBorrador('https://peacethefrontier.com', tmp);
		expect(urls).toEqual(
			new Set([
				'https://peacethefrontier.com/articulos/computo-de-la-ia/',
				'https://peacethefrontier.com/en/articles/compute-behind-ai/',
			]),
		);
	});
});
