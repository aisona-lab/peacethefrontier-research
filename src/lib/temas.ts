import { getCollection, type CollectionEntry } from 'astro:content';
import { rutaTema, type Idioma } from '../i18n/rutas';
import { validarTemas } from './validar-temas';

export type Tema = CollectionEntry<'temas'>;

/** Temas de lo más pequeño a lo más grande en la regla. */
export async function temasOrdenados() {
	const temas = (await getCollection('temas')).toSorted((a, b) => a.data.orden - b.data.orden);
	validarTemas(temas.map((t) => ({ id: t.id, orden: t.data.orden, slugEn: t.data.en.slug })));
	return temas;
}

/** Textos del tema en el idioma pedido (el español vive en la raíz de la entrada). */
export const textosTema = (tema: Tema, lang: Idioma) =>
	lang === 'en' ? tema.data.en : { slug: tema.id, ...tema.data };

export const urlTema = (tema: Tema, lang: Idioma) => rutaTema(lang, textosTema(tema, lang).slug);

/** Rutas estáticas de las páginas de tema, con sus vecinos en la escala. */
export async function rutasTemas(lang: Idioma) {
	const temas = await temasOrdenados();
	return temas.map((tema, i) => ({
		params: { id: textosTema(tema, lang).slug },
		props: { tema, anterior: temas[i - 1], siguiente: temas[i + 1] },
	}));
}
