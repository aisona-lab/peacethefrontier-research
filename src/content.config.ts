import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { BANDA_IDS } from './lib/escala';
import { esDatosHasta, ESTADOS_EDITORIALES } from './lib/editorial';
import { NIVELES, type NivelId } from './lib/evidencia';
import { INDICADORES } from './lib/futuros/tipos';
import { esquemaFuente } from './lib/fuentes';
import { workingPaperCompleto } from './lib/studio/publicaciones';
import { HIPOTESIS_IDS } from './lib/programa/hipotesis';

const textosTema = {
	titulo: z.string().min(1),
	pregunta: z.string().min(1),
	intro: z.string().min(1),
	preguntas: z.array(z.string().min(1)).min(2),
};

// En la interfaz se llaman "temas"; en el spec, "pilares" (P1–P17).
const temas = defineCollection({
	loader: file('src/content/temas.yaml'),
	schema: z.object({
		codigo: z.string().regex(/^P\d{1,2}$/),
		banda: z.enum(BANDA_IDS),
		/** Posición global en la regla, de lo más pequeño a lo más grande. */
		orden: z.number().int().min(1),
		/** Indicadores del modelo de futuros que tocan este tema; vacío si ninguno (la página lo dice). */
		indicadores: z.array(z.enum(INDICADORES)).default([]),
		fuentes: z.array(reference('fuentes')).min(1),
		revisado: z.coerce.date().optional(),
		verificacion: z.enum(['pendiente', 'verificada']).default('pendiente'),
		...textosTema,
		en: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), ...textosTema }),
	}),
});

// Páginas de texto largo en MDX: src/content/paginas/<idioma>/<seccion>.mdx
const paginas = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: 'src/content/paginas' }),
	schema: z.object({
		titulo: z.string(),
		descripcion: z.string(),
	}),
});

// Fichas de fuentes (R3). El modelo de futuros referencia sus ids en parametros.ts y calibracion.ts.
const fuentes = defineCollection({
	loader: file('src/content/fuentes.yaml'),
	schema: esquemaFuente,
});

// Relato de cada futuro: src/content/futuros/<idioma>/<cuadrante>.mdx (spec futuros.md §7).
const futuros = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: 'src/content/futuros' }),
	schema: z.object({
		premisa: z.string(),
		supuestos: z.array(z.string()).min(2),
		ganancias: z.array(z.string()).min(2),
		perdidas: z.array(z.string()).min(2),
	}),
});

// Artículos (spec R2): src/content/articulos/<idioma>/<slug>.mdx, unidos entre idiomas por `clave`.
// Reglas cruzadas (fuente fiable R2.4, temas, pares) en src/lib/articulos.ts; las aplica el build.
const articulos = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: 'src/content/articulos' }),
	schema: z.object({
		titulo: z.string(),
		resumen: z.string(),
		clave: z.string().regex(/^[a-z0-9-]+$/),
		tipoPublicacion: z.enum(['articulo', 'working-paper']).default('articulo'),
		serie: z.string().trim().min(1).optional(),
		numero: z.number().int().positive().optional(),
		version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
		hipotesis: z.enum(HIPOTESIS_IDS).optional(),
		experimento: z.string().regex(/^[a-z0-9-]+$/).optional(),
		repositorioCodigo: z.string().trim().min(1).optional(),
		comandoReproduccion: z.string().trim().min(1).optional(),
		temas: z.array(z.string()).min(1),
		evidencia: z.enum(NIVELES.map((n) => n.id) as [NivelId, ...NivelId[]]),
		autor: z.string(),
		publicado: z.coerce.date(),
		revisado: z.coerce.date(),
		datosHasta: z.string().refine(esDatosHasta, 'debe usar AAAA-MM o AAAA-MM-DD').optional(),
		/** Only set after the external literature search actually completes. */
		investigadoHasta: z.string().refine(esDatosHasta, 'debe usar AAAA-MM o AAAA-MM-DD').optional(),
		estado: z.enum(ESTADOS_EDITORIALES),
		/** En orden de cita: la nota n enlaza a la fuente n. */
		fuentes: z.array(reference('fuentes')).min(1),
		/** R10: armas, biología o vigilancia; exige la lista de comprobación del spec antes de publicar. */
		sensible: z.boolean().default(false),
		asistidoPorIA: z.boolean().default(false),
		/** R23.2: v1.0.0 en working papers con hipótesis exige datos reales calibrados y >= 2 revisores externos. */
		calibradoConDatosReales: z.boolean().default(false),
		revisoresExternos: z
			.array(
				z.object({
					nombre: z.string().trim().min(1),
					perfil: z.string().trim().min(1),
					fecha: z.coerce.date(),
					critica: z.string().trim().min(10),
					cambioRealizado: z.string().trim().min(10),
				}),
			)
			.default([]),
	}).refine(workingPaperCompleto, 'working papers require series, number and version'),
});

export const collections = { temas, paginas, fuentes, futuros, articulos };
