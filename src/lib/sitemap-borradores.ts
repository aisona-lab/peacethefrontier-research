// URLs de artículos en estado borrador. El sitemap las omite; la página sigue con noindex.
import fs from 'node:fs';
import path from 'node:path';
import { ESTADOS_EDITORIALES, type EstadoEditorial } from './editorial';
import { rutaPublicacion } from './studio/publicaciones';

const RAICES: { lang: 'es' | 'en'; prefijo: string }[] = [
	{ lang: 'es', prefijo: '/articulos/' },
	{ lang: 'en', prefijo: '/en/articles/' },
];

/** Lee el estado editorial solo del frontmatter (bloque entre ---). */
export function estadoEditorialMdx(texto: string): EstadoEditorial | undefined {
	const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const campo = m?.[1].match(/^estado:\s*(?:['"]([a-z-]+)['"]|([a-z-]+))\s*$/m);
	const estado = campo?.[1] ?? campo?.[2];
	return ESTADOS_EDITORIALES.find((e) => e === estado);
}

/**
 * Absolute article URLs that must not appear in the sitemap.
 * `site` is Astro's `site` (e.g. https://peacethefrontier.com).
 * `raizContenido` defaults to `src/content/articulos` from cwd.
 */
export function urlsArticulosBorrador(site: string, raizContenido = path.join('src', 'content', 'articulos')): Set<string> {
	const base = site.endsWith('/') ? site : `${site}/`;
	const urls = new Set<string>();
	for (const { lang, prefijo } of RAICES) {
		const dir = path.join(raizContenido, lang);
		if (!fs.existsSync(dir)) continue;
		for (const archivo of fs.readdirSync(dir)) {
			if (!archivo.endsWith('.mdx')) continue;
			const texto = fs.readFileSync(path.join(dir, archivo), 'utf8');
			if (estadoEditorialMdx(texto) !== 'borrador') continue;
			const slug = archivo.replace(/\.mdx$/, '');
			const tipo = /^tipoPublicacion:\s*['"]?working-paper['"]?\s*$/m.test(texto.split(/\r?\n---/)[0]) ? 'working-paper' : 'articulo';
			urls.add(new URL(tipo === 'working-paper' ? rutaPublicacion(lang, slug, tipo) : `${prefijo}${slug}/`, base).href);
		}
	}
	return urls;
}
