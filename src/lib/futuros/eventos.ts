// Eventos del relato (spec futuros.md §5.5): el modelo los dispara al cruzar un umbral.
import type { Idioma } from '../../i18n/rutas';
import { ANIO_INICIAL, type Evento, type Series } from './tipos';

interface DefinicionEvento {
	id: string;
	cumple: (s: Series, t: number) => boolean;
	texto: Record<Idioma, string>;
}

export const EVENTOS: readonly DefinicionEvento[] = [
	{ id: 'supera-1-5', cumple: (s, t) => s.temperatura[t] >= 1.5, texto: { es: 'El planeta supera 1,5 °C de calentamiento.', en: 'The planet passes 1.5 °C of warming.' } },
	{ id: 'ia-mitad-tareas', cumple: (s, t) => s.automatizacion[t] >= 0.5, texto: { es: 'La IA ya puede hacer la mitad de las tareas humanas.', en: 'AI can now do half of all human tasks.' } },
	{ id: 'robots-mil-millones', cumple: (s, t) => s.robots[t] >= 1, texto: { es: 'Mil millones de robots en funcionamiento.', en: 'One billion robots in operation.' } },
	{ id: 'ia-mas-que-japon', cumple: (s, t) => s.energiaIA[t] >= 1000, texto: { es: 'La electricidad modelada de centros de datos alcanza 1.000 TWh al año.', en: 'Modelled data-centre electricity reaches 1,000 TWh per year.' } },
	{ id: 'ciencia-x10', cumple: (s, t) => s.ciencia[t] >= 10, texto: { es: 'La ciencia avanza diez veces más rápido que en 2026.', en: 'Science moves ten times faster than in 2026.' } },
	{ id: 'limpia-50', cumple: (s, t) => s.energiaLimpia[t] >= 0.5, texto: { es: 'La mitad de la energía ya es limpia.', en: 'Half of all energy is now clean.' } },
	{ id: 'limpia-90', cumple: (s, t) => s.energiaLimpia[t] >= 0.9, texto: { es: 'Nueve de cada diez unidades de energía son limpias.', en: 'Nine in ten units of energy are clean.' } },
	{ id: 'cero-neto', cumple: (s, t) => s.emisiones[t] <= 1, texto: { es: 'Las emisiones de CO₂ llegan prácticamente a cero.', en: 'CO₂ emissions reach practically zero.' } },
	{ id: 'supera-2', cumple: (s, t) => s.temperatura[t] >= 2, texto: { es: 'El planeta supera 2 °C de calentamiento.', en: 'The planet passes 2 °C of warming.' } },
	{ id: 'supera-3', cumple: (s, t) => s.temperatura[t] >= 3, texto: { es: 'El planeta supera 3 °C de calentamiento.', en: 'The planet passes 3 °C of warming.' } },
	{ id: 'pico-poblacion', cumple: (s, t) => s.poblacion[t] === Math.max(...s.poblacion) && s.poblacion[t + 1] < s.poblacion[t], texto: { es: 'La población mundial alcanza su máximo y empieza a bajar.', en: 'World population peaks and begins to fall.' } },
	{ id: 'poder-concentrado', cumple: (s, t) => s.poder[t] >= 80, texto: { es: 'El poder se concentra en muy pocas manos.', en: 'Power is concentrated in very few hands.' } },
	{ id: 'riesgo-10', cumple: (s, t) => s.riesgo[t] >= 0.1, texto: { es: 'El riesgo acumulado de catástrofe supera el 10 %.', en: 'The cumulative risk of catastrophe passes 10%.' } },
];

const CRISIS: DefinicionEvento = {
	id: 'crisis',
	cumple: (s, t) => s.crisis[t] >= 0.5 && (t === 0 || s.crisis[t - 1] < 0.5),
	texto: { es: 'Estalla una crisis global que frena la economía y la IA.', en: 'A global crisis breaks out and slows the economy and AI.' },
};

/** El pico es el último año del máximo global antes de bajar (fin de la meseta).
 * Cada evento se dispara una vez, en el primer año que cumple; las crisis, en cada inicio. Orden cronológico. */
export function detectarEventos(s: Series): Evento[] {
	const anios = s.temperatura.map((_, t) => t);
	const unicos = EVENTOS.flatMap((e) => {
		const t = anios.find((i) => e.cumple(s, i));
		return t === undefined ? [] : [{ id: e.id, anio: ANIO_INICIAL + t }];
	});
	const crisis = anios.filter((t) => CRISIS.cumple(s, t)).map((t) => ({ id: CRISIS.id, anio: ANIO_INICIAL + t }));
	return [...unicos, ...crisis].sort((a, b) => a.anio - b.anio);
}

export const textoEvento = (id: string, lang: Idioma): string =>
	[...EVENTOS, CRISIS].find((e) => e.id === id)?.texto[lang] ?? id;
