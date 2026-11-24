// Cómo se escribe cada indicador en el texto, el panel y las tablas.
import type { Idioma } from '../../i18n/rutas';
import type { Indicador, Resultado } from './tipos';

const LOCALE: Record<Idioma, string> = { es: 'es-ES', en: 'en-US' };

const numero = (lang: Idioma, valor: number, decimales = 0) =>
	new Intl.NumberFormat(LOCALE[lang], {
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	}).format(valor);

export const porcentaje = (lang: Idioma, fraccion: number, decimales = 0) =>
	new Intl.NumberFormat(LOCALE[lang], {
		style: 'percent',
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	}).format(fraccion);

/** Valor en miles de millones → "2,1 mil millones" / "510 millones" (y en inglés, billion / million). */
function milesDeMillones(lang: Idioma, valor: number): string {
	if (valor >= 1) return `${numero(lang, valor, 1)} ${lang === 'es' ? 'mil millones' : 'billion'}`;
	const millones = valor * 1000;
	return `${numero(lang, millones, millones < 10 ? 1 : 0)} ${lang === 'es' ? 'millones' : 'million'}`;
}

/** Escalas en palabras: en español "B" o "bill." se confunden entre billón y mil millones. */
const PALABRAS: Record<Idioma, readonly [base: number, singular: string, plural: string][]> = {
	es: [[1e12, 'billón', 'billones'], [1e9, 'mil millones', 'mil millones'], [1e6, 'millón', 'millones'], [1e3, 'mil', 'mil']],
	en: [[1e12, 'trillion', 'trillion'], [1e9, 'billion', 'billion'], [1e6, 'million', 'million'], [1e3, 'thousand', 'thousand']],
};

/** 25 119 → "25 mil"; 1 000 000 → "1 millón"; 1,99 × 10¹² → "2 billones". */
function enPalabras(lang: Idioma, valor: number): string {
	const sinEscala = (n: number) =>
		new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n);
	const escala = PALABRAS[lang].find(([base]) => valor >= base);
	if (!escala) return sinEscala(valor);
	const [base, singular, plural] = escala;
	const n = valor / base;
	const redondeado = n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
	return `${sinEscala(n)} ${redondeado === 1 ? singular : plural}`;
}

export function formatear(indicador: Indicador, valor: number, lang: Idioma): string {
	switch (indicador) {
		case 'capacidad':
			return `×${enPalabras(lang, 10 ** valor)}`;
		case 'automatizacion':
		case 'empleo':
		case 'energiaLimpia':
			return porcentaje(lang, valor);
		case 'riesgo':
			return porcentaje(lang, valor, valor < 0.1 ? 1 : 0);
		case 'desigualdad':
		case 'poder':
			return `${numero(lang, valor)}/100`;
		case 'robots':
		case 'poblacion':
			return milesDeMillones(lang, valor);
		case 'ciencia':
			return `×${numero(lang, valor, 1)}`;
		case 'energiaIA':
			return `${numero(lang, valor)} TWh`;
		case 'temperatura':
			return `${numero(lang, valor, 1)} °C`;
	}
}

/** Índices de 2026, 2036 … 2126 (filas de las tablas "Ver datos"). */
export const INDICES_DECADAS: readonly number[] = Array.from({ length: 11 }, (_, i) => i * 10);

/** "1,4 °C (1,3–1,6)": mediana y banda del 80 %. */
export const celdaConBanda = (indicador: Indicador, r: Resultado, t: number, lang: Idioma): string =>
	`${formatear(indicador, r.p50[indicador][t], lang)} (${formatear(indicador, r.p10[indicador][t], lang)}–${formatear(indicador, r.p90[indicador][t], lang)})`;
