// Tipos compartidos del modelo de futuros (spec futuros.md §8). Sin dependencias: sirve al build y al navegador.

export const ANIO_INICIAL = 2026;
/** 2026…2126, ambos incluidos. */
export const ANIOS = 101;

export interface Posicion {
	/** 0 = sin reglas ni cooperación; 1 = máxima. */
	paz: number;
	/** 0 = la IA casi no avanza; 1 = máxima velocidad. */
	frontera: number;
}

export const INDICADORES = [
	'capacidad',
	'automatizacion',
	'empleo',
	'desigualdad',
	'robots',
	'ciencia',
	'energiaIA',
	'energiaLimpia',
	'temperatura',
	'poblacion',
	'poder',
	'riesgo',
] as const;
export type Indicador = (typeof INDICADORES)[number];

/** Indicadores visibles más variables internas: crisis (0/1), emisiones (GtCO₂/año) y electricidad mundial (TWh/año). */
export const VARIABLES = [...INDICADORES, 'crisis', 'emisiones', 'electricidad'] as const;
export type Variable = (typeof VARIABLES)[number];
export type Series = Record<Variable, number[]>;

export const seriesVacias = (): Series =>
	Object.fromEntries(VARIABLES.map((v) => [v, [] as number[]])) as Series;

export const AMBITOS = ['humanidad', 'tecnologia', 'ciencia', 'planeta', 'politica'] as const;
export type Ambito = (typeof AMBITOS)[number];

export const AMBITO_DE: Record<Indicador, Ambito> = {
	capacidad: 'tecnologia',
	energiaIA: 'tecnologia',
	robots: 'tecnologia',
	automatizacion: 'humanidad',
	empleo: 'humanidad',
	desigualdad: 'humanidad',
	poblacion: 'humanidad',
	ciencia: 'ciencia',
	temperatura: 'planeta',
	energiaLimpia: 'planeta',
	poder: 'politica',
	riesgo: 'politica',
};

export interface Evento {
	id: string;
	anio: number;
}

export interface Resultado {
	anios: number[];
	p10: Series;
	p50: Series;
	p90: Series;
	/** Detectados sobre la mediana (p50). */
	eventos: Evento[];
}
