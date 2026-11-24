// Objetivos de calibración (spec futuros.md §5.6). Los usan las pruebas y la página /futuros/, que publica si el
// modelo los cumple. Se evalúan sobre las medianas de Monte Carlo: exactamente lo que ve el lector.
import type { Idioma } from '../../i18n/rutas';
import { proyectarGuardado } from './montecarlo';
import { valoresCentrales } from './parametros';
import { presetDe } from './posicion';
import { ANIO_INICIAL, type Posicion, type Series } from './tipos';

export interface Objetivo {
	id: string;
	descripcion: Record<Idioma, string>;
	fuente: string;
	/** oficial: organismo público · industria: estadística sectorial · expertos: encuesta o torneo de pronósticos. */
	tipo: 'oficial' | 'industria' | 'expertos';
	unidad: 'celsius' | 'fraccion' | 'twh' | 'anio' | 'millones' | 'milmillones';
	min: number;
	max: number;
	valor: () => number | null;
}

const CENTRO: Posicion = { paz: 0.5, frontera: 0.5 };
const i = (anio: number) => anio - ANIO_INICIAL;
/** Medianas de Monte Carlo para una posición (las mismas que dibujan las páginas). */
const mediana = (pos: Posicion): Series => proyectarGuardado(pos).p50;
const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const temperatura2081a2100 = (pos: Posicion) => media(mediana(pos).temperatura.slice(i(2081), i(2100) + 1));
const riesgo2100 = (pos: Posicion) => mediana(pos).riesgo[i(2100)];

/** Robots desde 1,828 M (IFR, fin de 2016) siete años al ritmo histórico r_min, en millones (comprueba la ecuación, no una mediana). */
function robotsRetro(): number {
	const k = valoresCentrales();
	let R = 0.001828;
	for (let t = 0; t < 7; t++) R += k.rMin * R * (1 - R / Math.max(R, k.rSat * k.a0));
	return R * 1000;
}

/** Primer año con valor ≥ umbral; null si la serie no lo alcanza. */
export function anioUmbral(valores: readonly number[], umbral: number): number | null {
 const indice = valores.findIndex(valor => valor >= umbral);
 return indice < 0 ? null : ANIO_INICIAL + indice;
}

export const OBJETIVOS: readonly Objetivo[] = [
	{ id: 'temp-frontera-en-paz', descripcion: { es: 'Temperatura 2081–2100 de Frontera en paz, dentro de SSP1-2.6', en: 'Peaceful frontier temperature 2081–2100, within SSP1-2.6' }, fuente: 'ipcc-ar6-wg1', tipo: 'oficial', unidad: 'celsius', min: 1.3, max: 2.4, valor: () => temperatura2081a2100(presetDe('frontera-en-paz')) },
	{ id: 'temp-pausa', descripcion: { es: 'Temperatura 2081–2100 de Pausa, entre SSP1-2.6 y SSP2-4.5', en: 'Pause temperature 2081–2100, between SSP1-2.6 and SSP2-4.5' }, fuente: 'ipcc-ar6-wg1', tipo: 'oficial', unidad: 'celsius', min: 1.3, max: 3.5, valor: () => temperatura2081a2100(presetDe('pausa')) },
	{ id: 'temp-centro', descripcion: { es: 'Temperatura 2081–2100 en el centro de la matriz, dentro de SSP2-4.5', en: 'Matrix-center temperature 2081–2100, within SSP2-4.5' }, fuente: 'ipcc-ar6-wg1', tipo: 'oficial', unidad: 'celsius', min: 2.1, max: 3.5, valor: () => temperatura2081a2100(CENTRO) },
	{ id: 'temp-carrera', descripcion: { es: 'Temperatura 2081–2100 de Carrera, entre SSP2-4.5 y SSP5-8.5', en: 'Race temperature 2081–2100, between SSP2-4.5 and SSP5-8.5' }, fuente: 'ipcc-ar6-wg1', tipo: 'oficial', unidad: 'celsius', min: 2.1, max: 5.7, valor: () => temperatura2081a2100(presetDe('carrera')) },
	{ id: 'temp-fractura', descripcion: { es: 'Temperatura 2081–2100 de Fractura, entre SSP2-4.5 y SSP5-8.5', en: 'Fracture temperature 2081–2100, between SSP2-4.5 and SSP5-8.5' }, fuente: 'ipcc-ar6-wg1', tipo: 'oficial', unidad: 'celsius', min: 2.1, max: 5.7, valor: () => temperatura2081a2100(presetDe('fractura')) },
	{ id: 'temp-orden', descripcion: { es: 'Carrera y Fractura terminan más calientes que Frontera en paz (diferencia en °C)', en: 'Race and Fracture end warmer than Peaceful frontier (difference in °C)' }, fuente: 'ipcc-ar6-wg1', tipo: 'oficial', unidad: 'celsius', min: 0, max: Number.POSITIVE_INFINITY, valor: () => Math.min(temperatura2081a2100(presetDe('carrera')), temperatura2081a2100(presetDe('fractura'))) - temperatura2081a2100(presetDe('frontera-en-paz')) },
	{ id: 'riesgo-centro', descripcion: { es: 'Riesgo de catástrofe a 2100 en el centro, entre superpronosticadores (9 %) y expertos (20 %)', en: 'Catastrophe risk by 2100 at the center, between superforecasters (9%) and experts (20%)' }, fuente: 'xpt-2023', tipo: 'expertos', unidad: 'fraccion', min: 0.09, max: 0.2, valor: () => riesgo2100(CENTRO) },
	{ id: 'riesgo-pausa', descripcion: { es: 'Riesgo de catástrofe a 2100 en Pausa, por debajo del 9 %', en: 'Catastrophe risk by 2100 in Pause, below 9%' }, fuente: 'xpt-2023', tipo: 'expertos', unidad: 'fraccion', min: 0, max: 0.09, valor: () => riesgo2100(presetDe('pausa')) },
	{ id: 'riesgo-carrera', descripcion: { es: 'Riesgo de catástrofe a 2100 en Carrera, por encima del 20 %', en: 'Catastrophe risk by 2100 in Race, above 20%' }, fuente: 'xpt-2023', tipo: 'expertos', unidad: 'fraccion', min: 0.2, max: 1, valor: () => riesgo2100(presetDe('carrera')) },
	{ id: 'energia-ia-2030', descripcion: { es: 'Electricidad de los centros de datos en 2030 en el centro, ±30 % del caso base de la AIE (945 TWh)', en: 'Data-center electricity in 2030 at the center, ±30% of the IEA base case (945 TWh)' }, fuente: 'aie-energia-ia', tipo: 'oficial', unidad: 'twh', min: 945 * 0.7, max: 945 * 1.3, valor: () => mediana(CENTRO).energiaIA[i(2030)] },
	{ id: 'automatizacion-mitad', descripcion: { es: 'Año en que se automatiza la mitad de las tareas (centro), entre 2047 y 2116', en: 'Year half of all tasks are automated (center), between 2047 and 2116' }, fuente: 'grace-2024', tipo: 'expertos', unidad: 'anio', min: 2047, max: 2116, valor: () => anioUmbral(mediana(CENTRO).automatizacion, 0.5) },
	{ id: 'poblacion-2100', descripcion: { es: 'Población en 2100 (centro): objetivo de calibración 9–11,4 mil millones, con referencia ONU', en: 'Population in 2100 (center): calibration target 9–11.4 billion, with UN reference' }, fuente: 'onu-wpp-2024', tipo: 'oficial', unidad: 'milmillones', min: 9, max: 11.4, valor: () => mediana(CENTRO).poblacion[i(2100)] },
	{ id: 'robots-retro', descripcion: { es: 'Robots 2016→2023 al ritmo histórico, ±15 % de los 4,28 M de la IFR', en: 'Robots 2016→2023 at the historical pace, ±15% of IFR’s 4.28 M' }, fuente: 'ifr-2024', tipo: 'industria', unidad: 'millones', min: 4.28 * 0.85, max: 4.28 * 1.15, valor: robotsRetro },
];

export function evaluar(objetivo: Objetivo): { valor: number | null; cumple: boolean } {
	const valor = objetivo.valor();
	return { valor, cumple: valor !== null && valor >= objetivo.min && valor <= objetivo.max };
}
