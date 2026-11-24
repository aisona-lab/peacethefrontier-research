// Gráficos SVG de los futuros: escalas fijas por indicador y trazados compartidos entre build y navegador.
import type { Ambito, Indicador } from './tipos';

export const ANCHO_GRAFICO = 200;
export const ALTO_GRAFICO = 44;

export interface Escala {
	min: number;
	max: number;
	log?: boolean;
}

/** Fijas: la misma escala en los cuatro futuros para que la comparación sea honesta. */
export const ESCALAS: Record<Indicador, Escala> = {
	capacidad: { min: 0, max: 15 },
	automatizacion: { min: 0, max: 1 },
	empleo: { min: 0, max: 1 },
	desigualdad: { min: 20, max: 90 },
	robots: { min: 0, max: 20 },
	ciencia: { min: 0, max: 25 },
	energiaIA: { min: 100, max: 100_000, log: true },
	energiaLimpia: { min: 0, max: 1 },
	temperatura: { min: 1, max: 8 },
	poblacion: { min: 6, max: 13 },
	poder: { min: 0, max: 100 },
	riesgo: { min: 0, max: 1 },
};

export type IdGrafico =
	| 'capacidad'
	| 'robots'
	| 'energiaIA'
	| 'trabajo'
	| 'desigualdad'
	| 'poblacion'
	| 'ciencia'
	| 'temperatura'
	| 'energiaLimpia'
	| 'poder'
	| 'riesgo';

export interface DefinicionGrafico {
	id: IdGrafico;
	ambito: Ambito;
	series: readonly Indicador[];
}

/** 12 series en 11 gráficos: automatización y empleo comparten "trabajo". */
export const GRAFICOS: readonly DefinicionGrafico[] = [
	{ id: 'capacidad', ambito: 'tecnologia', series: ['capacidad'] },
	{ id: 'robots', ambito: 'tecnologia', series: ['robots'] },
	{ id: 'energiaIA', ambito: 'tecnologia', series: ['energiaIA'] },
	{ id: 'trabajo', ambito: 'humanidad', series: ['automatizacion', 'empleo'] },
	{ id: 'desigualdad', ambito: 'humanidad', series: ['desigualdad'] },
	{ id: 'poblacion', ambito: 'humanidad', series: ['poblacion'] },
	{ id: 'ciencia', ambito: 'ciencia', series: ['ciencia'] },
	{ id: 'temperatura', ambito: 'planeta', series: ['temperatura'] },
	{ id: 'energiaLimpia', ambito: 'planeta', series: ['energiaLimpia'] },
	{ id: 'poder', ambito: 'politica', series: ['poder'] },
	{ id: 'riesgo', ambito: 'politica', series: ['riesgo'] },
];

const redondear = (n: number) => Math.round(n * 10) / 10;

export const xAnio = (t: number, n: number, ancho = ANCHO_GRAFICO) => redondear((t / (n - 1)) * ancho);

/** y en píxeles (0 arriba); los valores fuera de la escala se pegan al borde. */
export function yValor(valor: number, escala: Escala, alto = ALTO_GRAFICO): number {
	const transformar = (v: number) => (escala.log ? Math.log10(Math.max(v, escala.min)) : v);
	const fraccion = (transformar(valor) - transformar(escala.min)) / (transformar(escala.max) - transformar(escala.min));
	return redondear(alto * (1 - Math.min(1, Math.max(0, fraccion))));
}

const puntos = (valores: readonly number[], escala: Escala, ancho: number, alto: number) =>
	valores.map((v, t) => `${xAnio(t, valores.length, ancho)},${yValor(v, escala, alto)}`);

export function rutaLinea(valores: readonly number[], escala: Escala, ancho = ANCHO_GRAFICO, alto = ALTO_GRAFICO): string {
	return puntos(valores, escala, ancho, alto)
		.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`)
		.join('');
}

/** Polígono de la banda: borde superior de izquierda a derecha, inferior de vuelta. */
export function rutaBanda(
	bajos: readonly number[],
	altos: readonly number[],
	escala: Escala,
	ancho = ANCHO_GRAFICO,
	alto = ALTO_GRAFICO,
): string {
	const arriba = puntos(altos, escala, ancho, alto).map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`);
	const abajo = puntos(bajos, escala, ancho, alto).reverse().map((p) => `L${p}`);
	return `${arriba.join('')}${abajo.join('')}Z`;
}
