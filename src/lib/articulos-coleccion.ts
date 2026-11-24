// Acceso a los artículos para las páginas: valida la colección entera una vez (R2.4, temas, pares de idioma).
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Idioma } from '../i18n/rutas';
import { erroresArticulo, erroresPares, erroresRevision, erroresNotas } from './articulos';
import { EXPERIMENTO_IDS } from './studio/artefactos';
import { rutaPublicacion } from './studio/publicaciones';

export type Articulo = CollectionEntry<'articulos'>;

export const slugArticulo = (a: Articulo) => a.id.split('/')[1];

let validados: Promise<Articulo[]> | undefined;

async function todos(): Promise<Articulo[]> {
	const [articulos, fuentes, temas] = await Promise.all([
		getCollection('articulos'),
		getCollection('fuentes'),
		getCollection('temas'),
	]);
	const tipos = new Map(fuentes.map((f) => [f.id, f.data.tipo]));
	const ids = new Set(temas.map((t) => t.id));
	const errores = [
		...articulos.flatMap((a) => erroresNotas(a.id, a.data.fuentes.map((f) => f.id), a.body ?? '')),
		...articulos.flatMap((a) =>
			erroresArticulo(
				{ id: a.id, evidencia: a.data.evidencia, temas: a.data.temas, tiposFuentes: a.data.fuentes.map((f) => tipos.get(f.id) ?? '') },
				ids,
			),
		),
		...erroresPares(articulos.map((a) => ({ id: a.id, clave: a.data.clave }))),
		...erroresRevision(
			articulos.map((a) => ({ ...a.data, id: a.id, fuentes: a.data.fuentes.map((f) => f.id) })),
			new Set(tipos.keys()),
			new Set(EXPERIMENTO_IDS),
		),
	];
	if (errores.length) throw new Error(`Artículos no válidos:\n${errores.join('\n')}`);
	return articulos;
}

/** Artículos de un idioma, del más reciente al más antiguo. */
export async function publicacionesDe(lang: Idioma): Promise<Articulo[]> {
	validados ??= todos();
	return (await validados)
		.filter((a) => a.id.startsWith(`${lang}/`))
		.sort((a, b) => b.data.publicado.getTime() - a.data.publicado.getTime());
}

export const articulosDe = async (lang: Idioma) => (await publicacionesDe(lang)).filter((a) => a.data.tipoPublicacion === 'articulo');
export const papersDe = async (lang: Idioma) => (await publicacionesDe(lang)).filter((a) => a.data.tipoPublicacion === 'working-paper');
export const urlArticulo = (a: Articulo) => rutaPublicacion(a.id.startsWith('en/') ? 'en' : 'es', slugArticulo(a), a.data.tipoPublicacion);
