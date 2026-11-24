// Dónde estamos hoy en la matriz. La frontera se deriva del cómputo; la paz se estima con una rúbrica pública y discutible.
import type { Idioma } from '../../i18n/rutas';
import { PARAMETROS } from './parametros';

export interface Rango {
	central: number;
	min: number;
	max: number;
}

export interface SenalPaz {
	id: string;
	criterio: Record<Idioma, string>;
	hecho: Record<Idioma, string>;
	/** Puntuación editorial: 0 = no existe nada; 1 = lo que supone el futuro de paz máxima. */
	min: number;
	max: number;
	/** Ids de src/content/fuentes.yaml. */
	fuentes: readonly string[];
}

/** Fecha editorial heredada de las señales; no acredita una nueva verificación externa. */
export const FECHA_HOY = '2026-10-02';

/** Crecimiento anual del cómputo de entrenamiento de los modelos de frontera (Epoch AI): 4–5×. */
export const CRECIMIENTO_COMPUTO = { central: 4.5, min: 4, max: 5 };

const limitar = (x: number) => Math.min(1, Math.max(0, x));

/** Coordenada sin recorte: el mapeo de cómputo a capacidad es un supuesto. */
export function fronteraSinRecorte(crecimientoAnual: number): number {
	const { gMin, gMax } = PARAMETROS;
	return (Math.log10(crecimientoAnual) - gMin.central) / (gMax.central - gMin.central);
}

/** Acotación exclusivamente para dibujar el marcador en la matriz. */
export const fronteraDe = (crecimientoAnual: number): number => limitar(fronteraSinRecorte(crecimientoAnual));

export const SENALES_PAZ: readonly SenalPaz[] = [
	{
		id: 'tratados',
		criterio: { es: 'Reglas vinculantes entre países', en: 'Binding rules between countries' },
		hecho: {
			es: 'El Convenio Marco del Consejo de Europa sobre IA, primer tratado vinculante, se abrió a la firma en 2024; la entrada en vigor y las ratificaciones requieren comprobar el registro de tratados. Esta puntuación es un juicio editorial, no una medición de cumplimiento.',
			en: 'The Council of Europe Framework Convention on AI, the first binding treaty, opened for signature in 2024; entry into force and ratifications require checking the treaty register. This score is an editorial judgment, not a compliance measurement.',
		},
		min: 0.1,
		max: 0.25,
		fuentes: ['coe-convenio-ia'],
	},
	{
		id: 'instituciones',
		criterio: { es: 'Instituciones internacionales que vigilan la IA', en: 'International institutions that monitor AI' },
		hecho: {
			es: 'La ONU creó por consenso en 2025 un panel científico de 40 expertos y un diálogo anual sobre la gobernanza de la IA, que celebró su primera sesión anual en Ginebra en julio de 2026. Informan, pero no verifican ni obligan.',
			en: 'In 2025 the UN created by consensus a 40-member scientific panel and an annual dialogue on AI governance, which held its first annual session in Geneva in July 2026. They inform, but do not verify or enforce.',
		},
		min: 0.2,
		max: 0.35,
		fuentes: ['onu-panel-ia', 'onu-dialogo-ia'],
	},
	{
		id: 'potencias',
		criterio: { es: 'Cooperación entre las grandes potencias de la IA', en: 'Cooperation between the major AI powers' },
		hecho: {
			es: 'Estados Unidos limita la venta a China de los chips más avanzados para IA; en enero de 2026 permitió algunos modelos con cupos. Ambos firmaron en 2026 la Declaración de Delhi, que se remite a marcos voluntarios y no vinculantes.',
			en: 'The United States restricts sales of the most advanced AI chips to China; in January 2026 it allowed some models under quotas. Both signed the 2026 Delhi Declaration, which refers to voluntary, non-binding frameworks.',
		},
		min: 0.1,
		max: 0.3,
		fuentes: ['cfr-chips-2026', 'brookings-delhi'],
	},
	{
		id: 'leyes',
		criterio: { es: 'Leyes para quienes desarrollan la IA más avanzada', en: 'Laws for those who develop the most advanced AI' },
		hecho: {
			es: 'La UE exige obligaciones a los modelos de propósito general desde 2025, pero en 2026 aplazó las de los sistemas de alto riesgo a diciembre de 2027 (a agosto de 2028 si van integrados en productos). En Estados Unidos, California obliga desde 2026 a los desarrolladores de frontera a publicar sus marcos de seguridad, mientras una orden ejecutiva federal de 2025 busca anular las leyes estatales sobre IA.',
			en: 'The EU has imposed obligations on general-purpose models since 2025, but in 2026 it postponed those for high-risk systems to December 2027 (August 2028 for those built into products). In the United States, California has required frontier developers to publish their safety frameworks since 2026, while a 2025 federal executive order seeks to override state AI laws.',
		},
		min: 0.3,
		max: 0.5,
		fuentes: ['ue-ley-ia', 'california-sb53', 'eeuu-orden-14365'],
	},
	{
		id: 'armas',
		criterio: { es: 'Reglas sobre armas autónomas', en: 'Rules on autonomous weapons' },
		hecho: {
			es: 'Tras tres años de conversaciones en la ONU, 76 países apoyan negociar normas vinculantes, pero no hay tratado. La decisión pasa a la conferencia de noviembre de 2026.',
			en: 'After three years of UN talks, 76 countries support negotiating binding rules, but there is no treaty. The decision goes to the November 2026 conference.',
		},
		min: 0.1,
		max: 0.3,
		fuentes: ['hrw-armas-autonomas-2026'],
	},
];

const media = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pazMin = media(SENALES_PAZ.map((s) => s.min));
const pazMax = media(SENALES_PAZ.map((s) => s.max));

export const HOY: { paz: Rango; frontera: Rango } = {
	paz: { central: (pazMin + pazMax) / 2, min: pazMin, max: pazMax },
	frontera: {
		central: fronteraDe(CRECIMIENTO_COMPUTO.central),
		min: fronteraDe(CRECIMIENTO_COMPUTO.min),
		max: fronteraDe(CRECIMIENTO_COMPUTO.max),
	},
};
