// Los cuatro futuros de la matriz Paz × Frontera y la posición del lector en la URL (spec futuros.md §2).
import { rutaFuturo, type Idioma } from '../../i18n/rutas';
import type { Posicion } from './tipos';

export const CUADRANTES = {
	pausa: { paz: 0.85, frontera: 0.15, slug: { es: 'pausa', en: 'pause' } },
	'frontera-en-paz': { paz: 0.85, frontera: 0.85, slug: { es: 'frontera-en-paz', en: 'peaceful-frontier' } },
	carrera: { paz: 0.15, frontera: 0.85, slug: { es: 'carrera', en: 'race' } },
	fractura: { paz: 0.15, frontera: 0.15, slug: { es: 'fractura', en: 'fracture' } },
} as const;

export type CuadranteId = keyof typeof CUADRANTES;
export const CUADRANTE_IDS = Object.keys(CUADRANTES) as CuadranteId[];

export const presetDe = (id: CuadranteId): Posicion => ({
	paz: CUADRANTES[id].paz,
	frontera: CUADRANTES[id].frontera,
});

export const urlFuturo = (lang: Idioma, id: CuadranteId) => rutaFuturo(lang, CUADRANTES[id].slug[lang]);

/** Paz ≥ 0,5 es alta; frontera ≥ 0,5 es rápida. */
export function cuadranteCercano({ paz, frontera }: Posicion): CuadranteId {
	if (paz >= 0.5) return frontera >= 0.5 ? 'frontera-en-paz' : 'pausa';
	return frontera >= 0.5 ? 'carrera' : 'fractura';
}

/** Paso de los controles: lo que se lee de la URL se redondea a él para que control, texto y modelo coincidan. */
export const PASO = 0.05;
/** Dividir entre 20 (y no multiplicar por 0,05) da valores exactos: 14 / 20 = 0.7, 14 × 0.05 = 0.7000000000000001. */
const PASOS_POR_UNIDAD = 20;

/** Recorta a 0–1 y redondea al paso de los controles. */
export const alPaso = (x: number): number => Math.round(Math.min(1, Math.max(0, x)) * PASOS_POR_UNIDAD) / PASOS_POR_UNIDAD;

/** Lee ?paz=&frontera= sin confiar en la URL: recorta a 0–1, redondea al paso y usa el valor por defecto si no es un número. */
export function leerPosicion(params: URLSearchParams, porDefecto: Posicion): Posicion {
	const leer = (clave: keyof Posicion): number => {
		const crudo = params.get(clave)?.trim();
		if (!crudo) return porDefecto[clave];
		const n = Number(crudo);
		return Number.isFinite(n) ? alPaso(n) : porDefecto[clave];
	};
	return { paz: leer('paz'), frontera: leer('frontera') };
}

export const escribirPosicion = ({ paz, frontera }: Posicion): string =>
	`paz=${paz.toFixed(2)}&frontera=${frontera.toFixed(2)}`;

export const mismaPosicion = (a: Posicion, b: Posicion): boolean =>
	Math.abs(a.paz - b.paz) < 1e-9 && Math.abs(a.frontera - b.frontera) < 1e-9;
