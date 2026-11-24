import type { Idioma } from './rutas';
import { publicacionesDe, urlArticulo } from '../lib/articulos-coleccion';
import { TESIS_CENTRAL } from '../lib/programa/hipotesis';
import { PERFIL } from '../lib/studio/config';
import { urlPublica } from '../lib/studio/espacios';

const escaparXml = (s: string) =>
	s
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

export async function generarRssXml(lang: Idioma): Promise<Response> {
	const items = await publicacionesDe(lang);
	const tesis = TESIS_CENTRAL[lang];
	const canalUrl = urlPublica(lang === 'en' ? '/en/' : '/', PERFIL);
	const feedUrl = urlPublica(lang === 'en' ? '/en/rss.xml' : '/rss.xml', PERFIL);

	const entradas = items
		.map((a) => {
			const link = urlPublica(urlArticulo(a), PERFIL);
			const prefijo =
				a.data.tipoPublicacion === 'working-paper'
					? `[${a.data.serie} ${a.data.numero}${a.data.hipotesis ? ` · ${a.data.hipotesis}` : ''}] `
					: '';
			return `\t\t<item>
\t\t\t<title>${escaparXml(prefijo + a.data.titulo)}</title>
\t\t\t<link>${escaparXml(link)}</link>
\t\t\t<guid isPermaLink="true">${escaparXml(link)}</guid>
\t\t\t<pubDate>${a.data.publicado.toUTCString()}</pubDate>
\t\t\t<description>${escaparXml(a.data.resumen)}</description>
\t\t</item>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
\t<channel>
\t\t<title>${escaparXml(`Peace The Frontier — ${tesis.titulo}`)}</title>
\t\t<link>${escaparXml(canalUrl)}</link>
\t\t<description>${escaparXml(tesis.tesis)}</description>
\t\t<language>${lang}</language>
\t\t<atom:link href="${escaparXml(feedUrl)}" rel="self" type="application/rss+xml" />
${entradas}
\t</channel>
</rss>
`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
	});
}
