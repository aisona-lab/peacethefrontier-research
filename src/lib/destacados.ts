import { IDIOMAS, type Idioma } from '../i18n/rutas';
import type { Textos } from '../i18n/ui';

export interface Destacado {
	clave: string;
	etiqueta: keyof Textos['destacados']['etiquetas'];
	temas: readonly string[];
}

/** Prioridades editoriales: las claves enlazan traducciones, nunca son slugs. */
export const DESTACADOS = [
	{ clave: 'agentes-capacidades', etiqueta: 'agentes', temas: ['ia', 'tecnologias', 'computo'] },
	{ clave: 'computo-energia-clima', etiqueta: 'computo', temas: ['computo', 'energia', 'planeta'] },
	{ clave: 'trabajo-economia', etiqueta: 'trabajo', temas: ['economia', 'informacion', 'sentido'] },
	{ clave: 'seguridad-gobernanza-poder', etiqueta: 'seguridad', temas: ['gobernanza', 'riesgo', 'poder', 'privacidad'] },
] as const satisfies readonly [Destacado, Destacado, Destacado, Destacado];

interface ReferenciaArticulo {
	id: string;
	clave: string;
}

interface ArticuloDestacado {
	id: string;
	data: { clave: string };
}

export function erroresDestacados(
	entradas: readonly Destacado[],
	temas: ReadonlySet<string>,
	articulos: readonly ReferenciaArticulo[],
): string[] {
	const errores: string[] = [];
	const vistas = new Set<string>();
	for (const entrada of entradas) {
		if (vistas.has(entrada.clave)) errores.push(`Destacado "${entrada.clave}" repetido`);
		vistas.add(entrada.clave);
		for (const tema of entrada.temas) {
			if (!temas.has(tema)) errores.push(`Destacado "${entrada.clave}": el tema "${tema}" no existe`);
		}
		for (const lang of IDIOMAS) {
			const versiones = articulos.filter((a) => a.clave === entrada.clave && a.id.startsWith(`${lang}/`));
			if (versiones.length === 0) errores.push(`El artículo "${entrada.clave}" no tiene versión en ${lang}`);
			if (versiones.length > 1) errores.push(`El artículo "${entrada.clave}" está repetido en ${lang}`);
		}
	}
	return errores;
}

export function resolverDestacados<A extends ArticuloDestacado>(
	lang: Idioma,
	articulos: readonly A[],
	temas: ReadonlySet<string>,
	entradas: readonly Destacado[] = DESTACADOS,
): (Destacado & { articulo: A })[] {
	const errores = erroresDestacados(entradas, temas, articulos.map((a) => ({ id: a.id, clave: a.data.clave })));
	if (errores.length) throw new Error(`Destacados no válidos:\n${errores.join('\n')}`);
	return entradas.map((entrada) => ({
		...entrada,
		// La validación garantiza exactamente una versión por idioma.
		articulo: articulos.find((a) => a.data.clave === entrada.clave && a.id.startsWith(`${lang}/`))!,
	}));
}
