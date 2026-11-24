// Datos de un futuro en CSV (año, indicador, p10, p50, p90) para quien quiera rehacer los cálculos.
import { INDICADORES, type Indicador, type Resultado } from './tipos';

/** Unidades en el CSV: códigos estables, sin idioma. */
const UNIDAD: Record<Indicador, string> = {
	capacidad: 'log10_sobre_2026',
	automatizacion: 'fraccion',
	empleo: 'fraccion',
	desigualdad: 'gini_0_100',
	robots: 'milmillones',
	ciencia: 'multiplo_de_2026',
	energiaIA: 'twh_anio',
	energiaLimpia: 'fraccion',
	temperatura: 'celsius',
	poblacion: 'milmillones',
	poder: 'indice_0_100',
	riesgo: 'probabilidad',
};

const n = (v: number) => String(Number(v.toPrecision(6)));

export function aCsv({ anios, p10, p50, p90 }: Resultado): string {
	const filas = anios.flatMap((anio, i) =>
		INDICADORES.map((ind) => [anio, ind, UNIDAD[ind], n(p10[ind][i]), n(p50[ind][i]), n(p90[ind][i])].join(',')),
	);
	return ['anio,indicador,unidad,p10,p50,p90', ...filas].join('\n') + '\n';
}
