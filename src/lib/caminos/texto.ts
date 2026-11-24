// Textos de los caminos que comparten la página (al compilar) y la isla (en el navegador).
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import type { Posicion } from '../futuros/tipos';
import { CRITERIOS, etiqueta, type Opcion } from './motor';

const LOCALE: Record<Idioma, string> = { es: 'es-ES', en: 'en-US' };
const numero = (lang: Idioma, v: number) =>
	new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const cambio = (lang: Idioma, v: number) =>
	new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 2, signDisplay: 'exceptZero' }).format(v);

export const textoPosicion = (lang: Idioma, { paz, frontera }: Posicion) =>
	textos(lang).caminos.posicion(numero(lang, paz), numero(lang, frontera));

/** "Ética. Mejora: daño a terceros, consentimiento. Efecto: paz +0,06, frontera 0" */
export function textoOpcion(lang: Idioma, opcion: Opcion): { etiqueta: string; porque: string; efecto: string } {
	const t = textos(lang).caminos;
	const lista = (valor: -1 | 1) => CRITERIOS.filter((c) => opcion.criterios[c] === valor).map((c) => t.criterios[c]);
	const porque = [
		lista(1).length ? `${t.mejora}: ${lista(1).join(', ')}.` : '',
		lista(-1).length ? `${t.empeora}: ${lista(-1).join(', ')}.` : '',
	].filter(Boolean);
	return {
		etiqueta: t.etiquetas[etiqueta(opcion.criterios)],
		porque: porque.join(' '),
		efecto: t.efecto(cambio(lang, opcion.efecto.paz), cambio(lang, opcion.efecto.frontera)),
	};
}
