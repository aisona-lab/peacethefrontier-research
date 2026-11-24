// Reglas de los artículos que el build hace cumplir (spec R2.1, R2.4). Puro: se prueba sin Astro.
import { IDIOMAS } from '../i18n/rutas';
import type { NivelId } from './evidencia';
import { createProcessor } from '@mdx-js/mdx';
import { visit } from 'unist-util-visit';

const TIPOS_FIABLES = new Set(['oficial', 'revisado-por-pares']);
const parserNotas = createProcessor();

/** The atlas uses literal Nota references; validate both directions before rendering. */
export function erroresNotas(id: string, fuentes: readonly string[], cuerpo: string): string[] {
	const referencias: string[] = [];
	visit(parserNotas.parse(cuerpo), (node) => {
		if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name === 'Nota') {
			const atributo = node.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === 'f');
			if (atributo?.type === 'mdxJsxAttribute' && typeof atributo.value === 'string') referencias.push(atributo.value);
		}
	});
	const citas = [...new Set(referencias)];
	const errores = [
		...fuentes.filter((f) => !citas.includes(f)).map((f) => `${id}: fuente sin cita "${f}"`),
		...citas.filter((f) => !fuentes.includes(f)).map((f) => `${id}: fuente no declarada "${f}"`),
	];
	if (!errores.length && fuentes.join('|') !== citas.join('|')) errores.push(`${id}: orden de citas distinto de fuentes`);
	return errores;
}

export interface ArticuloAValidar {
	id: string;
	evidencia: NivelId;
	temas: readonly string[];
	tiposFuentes: readonly string[];
}

export function erroresArticulo(a: ArticuloAValidar, temasValidos: ReadonlySet<string>): string[] {
	const errores = a.temas.filter((t) => !temasValidos.has(t)).map((t) => `${a.id}: el tema "${t}" no existe`);
	if (a.evidencia !== 'escenario-ficcion' && !a.tiposFuentes.some((t) => TIPOS_FIABLES.has(t)))
		errores.push(`${a.id}: necesita al menos una fuente oficial o revisada por pares (R2.4)`);
	return errores;
}

/** Cada artículo existe en los dos idiomas, unidos por `clave`. */
export function erroresPares(entradas: readonly { id: string; clave: string }[]): string[] {
	const claves = new Set(entradas.map((e) => e.clave));
	return [...claves].flatMap((clave) =>
		IDIOMAS.flatMap((lang) => {
			const cantidad = entradas.filter((e) => e.clave === clave && e.id.startsWith(`${lang}/`)).length;
			return cantidad === 0 ? [`El artículo "${clave}" no tiene versión en ${lang}`] : cantidad > 1 ? [`El artículo "${clave}" tiene versiones duplicadas en ${lang}`] : [];
		}),
	);
}

interface Revision {
	id: string; clave: string; fuentes: readonly string[]; evidencia: string; estado: string;
	publicado: Date; revisado: Date; datosHasta?: string; investigadoHasta?: string;
	tipoPublicacion?: string; serie?: string; numero?: number; version?: string;
	hipotesis?: string; experimento?: string; repositorioCodigo?: string; comandoReproduccion?: string;
}

/** Editorial metadata must describe the same evidence in both languages. */
export function erroresRevision(entradas: readonly Revision[], fuentesValidas: ReadonlySet<string>, experimentosValidos?: ReadonlySet<string>): string[] {
	const errores: string[] = [];
	const porClave = new Map<string, Revision>();
	for (const a of entradas) {
		for (const f of a.fuentes) if (!fuentesValidas.has(f)) errores.push(`${a.id}: fuente inexistente "${f}"`);
		if (new Set(a.fuentes).size !== a.fuentes.length) errores.push(`${a.id}: fuentes duplicadas`);
		if (a.revisado < a.publicado) errores.push(`${a.id}: revisión anterior a publicación`);
		if (a.investigadoHasta && a.investigadoHasta > a.revisado.toISOString().slice(0, a.investigadoHasta.length)) errores.push(`${a.id}: investigación posterior a revisión`);
		if (a.experimento && !a.repositorioCodigo) errores.push(`${a.id}: el experimento "${a.experimento}" requiere repositorioCodigo`);
		if (a.experimento && experimentosValidos && !experimentosValidos.has(a.experimento)) errores.push(`${a.id}: experimento inexistente "${a.experimento}"`);
		const otro = porClave.get(a.clave);
		if (otro) {
			for (const campo of ['publicado', 'revisado'] as const)
				if (a[campo].getTime() !== otro[campo].getTime()) errores.push(`${a.clave}: ${campo} difiere entre idiomas`);
			for (const campo of ['evidencia', 'estado', 'datosHasta', 'investigadoHasta', 'tipoPublicacion', 'serie', 'numero', 'version', 'hipotesis', 'experimento', 'repositorioCodigo', 'comandoReproduccion'] as const)
				if (a[campo] !== otro[campo]) errores.push(`${a.clave}: ${campo} difiere entre idiomas`);
			if ([...a.fuentes].sort().join('|') !== [...otro.fuentes].sort().join('|')) errores.push(`${a.clave}: fuentes difieren entre idiomas`);
		} else porClave.set(a.clave, a);
	}
	return errores;
}
