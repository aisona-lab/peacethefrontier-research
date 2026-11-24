// Rutas por idioma. El español va sin prefijo; el inglés bajo /en/ con slugs propios.

export const IDIOMAS = ['es', 'en'] as const;
export type Idioma = (typeof IDIOMAS)[number];

const SECCIONES = {
	inicio: { es: '/', en: '/en/' },
	temas: { es: '/temas/', en: '/en/topics/' },
	metodologia: { es: '/metodologia/', en: '/en/methodology/' },
	sobre: { es: '/sobre/', en: '/en/about/' },
	apoyar: { es: '/apoyar/', en: '/en/support/' },
	futuros: { es: '/futuros/', en: '/en/futures/' },
	caminos: { es: '/caminos/', en: '/en/paths/' },
	articulos: { es: '/articulos/', en: '/en/articles/' },
	linea: { es: '/linea-del-tiempo/', en: '/en/timeline/' },
} as const satisfies Record<string, Record<Idioma, string>>;

export type Seccion = keyof typeof SECCIONES;
export const SECCIONES_TEXTO = ['metodologia', 'sobre', 'apoyar'] as const satisfies readonly Seccion[];

export const ruta = (lang: Idioma, seccion: Seccion) => SECCIONES[seccion][lang];

export const rutaTema = (lang: Idioma, slug: string) => `${SECCIONES.temas[lang]}${slug}/`;

export const rutaArticulo = (lang: Idioma, slug: string) => `${SECCIONES.articulos[lang]}${slug}/`;

export const rutaFuturo = (lang: Idioma, slug: string) => `${SECCIONES.futuros[lang]}${slug}/`;

export const otroIdioma = (lang: Idioma): Idioma => (lang === 'es' ? 'en' : 'es');

/** Último segmento de una ruta: '/en/methodology/' → 'methodology'. */
export const segmentoFinal = (r: string) => r.split('/').filter(Boolean).at(-1) ?? '';
