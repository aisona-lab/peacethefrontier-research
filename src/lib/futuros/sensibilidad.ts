// Sensibilidad una a una: cada parámetro a su mínimo y a su máximo, el resto en su valor central.
// ponytail: no captura interacciones entre parámetros; para eso haría falta un análisis global (Sobol).
import { simular } from './modelo';
import { PARAMETROS, valoresCentrales, type NombreParametro } from './parametros';
import { ANIO_INICIAL, ANIOS, type Indicador, type Posicion } from './tipos';

export interface Efecto {
	parametro: NombreParametro;
	/** Valor del indicador con el parámetro en su mínimo. */
	bajo: number;
	/** Valor del indicador con el parámetro en su máximo. */
	alto: number;
}

export function sensibilidad(posicion: Posicion, indicador: Indicador, anio: number): Efecto[] {
	const i = anio - ANIO_INICIAL;
	if (!Number.isInteger(i) || i < 0 || i >= ANIOS)
		throw new RangeError(`El año ${anio} está fuera del modelo (${ANIO_INICIAL}–${ANIO_INICIAL + ANIOS - 1})`);
	const k = valoresCentrales();
	const con = (nombre: NombreParametro, valor: number) => simular(posicion, { ...k, [nombre]: valor })[indicador][i];
	return (Object.keys(PARAMETROS) as NombreParametro[])
		.map((parametro) => ({
			parametro,
			bajo: con(parametro, PARAMETROS[parametro].min),
			alto: con(parametro, PARAMETROS[parametro].max),
		}))
		.sort((a, b) => Math.abs(b.alto - b.bajo) - Math.abs(a.alto - a.bajo));
}
