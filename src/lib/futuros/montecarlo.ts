// Monte Carlo con semilla (spec futuros.md §5.4): mismos resultados en el build y en el navegador.
import { detectarEventos } from './eventos';
import { simular } from './modelo';
import { PARAMETROS, type Valores } from './parametros';
import { ANIO_INICIAL, ANIOS, VARIABLES, seriesVacias, type Posicion, type Resultado } from './tipos';

export const SEMILLA = 2026;
export const CORRIDAS = 200;

/** Generador pseudoaleatorio mulberry32: devuelve números en [0, 1). */
export function mulberry32(semilla: number): () => number {
	let a = semilla >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Percentil q (0–1) de una lista ordenada de menor a mayor, con interpolación lineal. */
export function percentil(ordenados: ArrayLike<number>, q: number): number {
	const i = (ordenados.length - 1) * q;
	const bajo = Math.floor(i);
	const alto = Math.ceil(i);
	return ordenados[bajo] + (ordenados[alto] - ordenados[bajo]) * (i - bajo);
}

/** Un juego de parámetros al azar dentro de sus rangos (uniforme). */
export const muestrear = (azar: () => number): Valores =>
	Object.fromEntries(
		Object.entries(PARAMETROS).map(([nombre, p]) => {
			const v = p.min + azar() * (p.max - p.min);
			return [nombre, 'entero' in p && p.entero ? Math.round(v) : v];
		}),
	) as Valores;

export function proyectar(pos: Posicion, semilla = SEMILLA, corridas = CORRIDAS): Resultado {
	const azar = mulberry32(semilla);
	const simulaciones = Array.from({ length: corridas }, () => simular(pos, muestrear(azar)));
	const p10 = seriesVacias();
	const p50 = seriesVacias();
	const p90 = seriesVacias();
	// Cada corrida cambia poco de un año al siguiente: se parte del orden del año anterior y se termina con
	// inserción, casi lineal sobre una lista casi ordenada (~3× más rápido que ordenar cada año desde cero).
	const ordenados = new Float64Array(corridas);
	const orden = new Uint16Array(corridas);
	for (const v of VARIABLES) {
		const columnas = simulaciones.map((s) => s[v]);
		for (let i = 0; i < corridas; i++) orden[i] = i;
		for (let t = 0; t < ANIOS; t++) {
			for (let i = 1; i < corridas; i++) {
				const corrida = orden[i];
				const valor = columnas[corrida][t];
				let j = i - 1;
				for (; j >= 0 && columnas[orden[j]][t] > valor; j--) orden[j + 1] = orden[j];
				orden[j + 1] = corrida;
			}
			for (let i = 0; i < corridas; i++) ordenados[i] = columnas[orden[i]][t];
			p10[v].push(percentil(ordenados, 0.1));
			p50[v].push(percentil(ordenados, 0.5));
			p90[v].push(percentil(ordenados, 0.9));
		}
	}
	return {
		anios: Array.from({ length: ANIOS }, (_, t) => ANIO_INICIAL + t),
		p10,
		p50,
		p90,
		eventos: detectarEventos(p50),
	};
}

const guardadas = new Map<string, Resultado>();
/** proyectar() con la semilla fija y memoria: en el build cada posición se calcula una vez. No mutar el resultado. */
export function proyectarGuardado(pos: Posicion): Resultado {
	const clave = `${pos.paz},${pos.frontera}`;
	const guardada = guardadas.get(clave);
	if (guardada) return guardada;
	const resultado = proyectar(pos);
	guardadas.set(clave, resultado);
	return resultado;
}
