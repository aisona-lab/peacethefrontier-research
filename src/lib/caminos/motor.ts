// Caminos de decisiones (fase G5): de hoy a uno de los cuatro futuros. Puro: sirve al build y al navegador.
import type { Idioma } from '../../i18n/rutas';
import { alPaso, cuadranteCercano, escribirPosicion, mismaPosicion, presetDe, urlFuturo, type CuadranteId } from '../futuros/posicion';
import type { Posicion } from '../futuros/tipos';

export const CRITERIOS = ['danio', 'consentimiento', 'reparto', 'reversibilidad'] as const;
export type Criterio = (typeof CRITERIOS)[number];
/** −1 empeora, 0 neutro o discutido, +1 mejora. */
export type Valoracion = -1 | 0 | 1;
export type Etiqueta = 'etico' | 'no-etico' | 'ambiguo';

export interface Opcion {
	id: string;
	texto: Record<Idioma, string>;
	criterios: Readonly<Record<Criterio, Valoracion>>;
	/** Estimación editorial, no salida del modelo. */
	efecto: { paz: number; frontera: number };
}

export interface Decision {
	id: string;
	anio: number;
	titulo: Record<Idioma, string>;
	contexto: Record<Idioma, string>;
	/** Ids de src/content/fuentes.yaml. */
	fuentes: readonly string[];
	opciones: readonly Opcion[];
}

/** La regla es pública: suma de los cuatro criterios; ≥ 2 ética, ≤ −2 no ética, el resto ambigua. */
export function etiqueta(criterios: Readonly<Record<Criterio, Valoracion>>): Etiqueta {
	const suma = CRITERIOS.reduce((total, c) => total + criterios[c], 0);
	return suma >= 2 ? 'etico' : suma <= -2 ? 'no-etico' : 'ambiguo';
}

const limitar = (x: number) => Math.min(1, Math.max(0, x));

/** Posiciones tras cada decisión, empezando por `inicio`. Sin elección, la decisión no mueve el punto. */
export function recorrer(decisiones: readonly Decision[], elecciones: readonly (string | undefined)[], inicio: Posicion): Posicion[] {
	const pasos = [inicio];
	decisiones.forEach((d, i) => {
		const anterior = pasos[pasos.length - 1];
		const efecto = d.opciones.find((o) => o.id === elecciones[i])?.efecto;
		pasos.push(
			efecto
				? { paz: limitar(anterior.paz + efecto.paz), frontera: limitar(anterior.frontera + efecto.frontera) }
				: anterior,
		);
	});
	return pasos;
}

/** ?c=id.id..id: una posición por decisión; vacío = sin elegir. */
export const escribirElecciones = (elecciones: readonly (string | undefined)[]): string =>
	elecciones.map((e) => e ?? '').join('.').replace(/\.+$/, '');

export function leerElecciones(decisiones: readonly Decision[], valor: string | null): (string | undefined)[] {
	const partes = (valor ?? '').split('.');
	return decisiones.map((d, i) => (d.opciones.some((o) => o.id === partes[i]) ? partes[i] : undefined));
}

/** El futuro al que lleva el camino, con la posición exacta en la URL (redondeada al paso de la matriz). */
export function destino(final: Posicion, lang: Idioma): { id: CuadranteId; url: string } {
	const posicion = { paz: alPaso(final.paz), frontera: alPaso(final.frontera) };
	const id = cuadranteCercano(posicion);
	const base = urlFuturo(lang, id);
	return { id, url: mismaPosicion(posicion, presetDe(id)) ? base : `${base}?${escribirPosicion(posicion)}` };
}
