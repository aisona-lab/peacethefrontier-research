// Escala del tiempo por tramos (design §5): cada era recibe un ancho fijo aunque dure miles de años.
import type { Idioma } from '../../i18n/rutas';

export interface Tramo {
	desde: number;
	hasta: number;
	/** Fracción de la línea que ocupa. */
	ancho: number;
	nombre: Record<Idioma, string>;
}

export const TRAMOS: readonly Tramo[] = [
	{ desde: -3500, hasta: -500, ancho: 0.15, nombre: { es: 'Antigüedad', en: 'Antiquity' } },
	{ desde: -500, hasta: 1500, ancho: 0.15, nombre: { es: 'Del mundo clásico a la Edad Media', en: 'From the classical world to the Middle Ages' } },
	{ desde: 1500, hasta: 1900, ancho: 0.12, nombre: { es: 'Revoluciones científica e industrial', en: 'Scientific and industrial revolutions' } },
	{ desde: 1900, hasta: 2000, ancho: 0.13, nombre: { es: 'Siglo XX', en: 'Twentieth century' } },
	{ desde: 2000, hasta: 2026, ancho: 0.15, nombre: { es: 'Era digital', en: 'Digital era' } },
	{ desde: 2026, hasta: 2126, ancho: 0.3, nombre: { es: 'Futuros', en: 'Futures' } },
];

const limitar = (x: number) => Math.min(1, Math.max(0, x));

/** Año → posición 0–1 en la línea. */
export function posicion(anio: number): number {
	let inicio = 0;
	for (const t of TRAMOS) {
		if (anio <= t.hasta) return limitar(inicio + (t.ancho * (anio - t.desde)) / (t.hasta - t.desde));
		inicio += t.ancho;
	}
	return 1;
}

/** Posición 0–1 → año (inversa de posicion). */
export function anioEn(x: number): number {
	let inicio = 0;
	for (const t of TRAMOS) {
		if (x <= inicio + t.ancho) return t.desde + ((x - inicio) / t.ancho) * (t.hasta - t.desde);
		inicio += t.ancho;
	}
	return TRAMOS[TRAMOS.length - 1].hasta;
}

/** El tramo al que pertenece un año (el último que lo contiene empezando por el principio). */
export const tramoDe = (anio: number): Tramo => TRAMOS.find((t) => anio < t.hasta) ?? TRAMOS[TRAMOS.length - 1];
