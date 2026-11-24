// Regla de tamaños en potencias de diez (metros): organiza los temas de la neurona al universo.
import type { Idioma } from '../i18n/rutas';

type Traducido = Record<Idioma, string>;

export const EXP_MIN = -10;
export const EXP_MAX = 27;

export const BANDA_IDS = ['mente', 'sociedad', 'planeta', 'cosmos'] as const;
export type BandaId = (typeof BANDA_IDS)[number];

export interface Banda {
	id: BandaId;
	nombre: Traducido;
	desde: number;
	hasta: number;
	descripcion: Traducido;
}

export const BANDAS: readonly Banda[] = [
	{
		id: 'mente',
		nombre: { es: 'Mente y materia', en: 'Mind and matter' },
		desde: -10,
		hasta: -1,
		descripcion: {
			es: 'Del átomo al cerebro. Lo que pasa a esta escala decide qué máquinas, curas y mentes serán posibles.',
			en: 'From the atom to the brain. What happens at this scale decides which machines, cures and minds become possible.',
		},
	},
	{
		id: 'sociedad',
		nombre: { es: 'Sociedad', en: 'Society' },
		desde: -1,
		hasta: 6,
		descripcion: {
			es: 'De una persona a un país. Aquí se decide quién manda, quién vigila y quién se beneficia.',
			en: 'From one person to a whole country. This is where we decide who rules, who watches and who benefits.',
		},
	},
	{
		id: 'planeta',
		nombre: { es: 'Planeta', en: 'Planet' },
		desde: 6,
		hasta: 8,
		descripcion: {
			es: 'La Tierra entera. Energía, clima y riesgos que no respetan fronteras.',
			en: 'The whole Earth. Energy, climate and risks that ignore borders.',
		},
	},
	{
		id: 'cosmos',
		nombre: { es: 'Cosmos', en: 'Cosmos' },
		desde: 8,
		hasta: 27,
		descripcion: {
			es: 'Del Sol al universo observable. La ciencia que todavía nos falta por hacer.',
			en: 'From the Sun to the observable universe. The science we still have left to do.',
		},
	},
];

export interface Hito {
	exp: number;
	nombre: Traducido;
	/** Nombre en pantallas estrechas, si el largo no cabe. */
	corto?: Traducido;
	/** Fila de etiquetas: las alternamos para que no se pisen. */
	fila: 'alta' | 'baja';
	/** Visible también en pantallas estrechas. */
	movil: boolean;
}

export const HITOS: readonly Hito[] = [
	{ exp: -10, nombre: { es: 'átomo', en: 'atom' }, fila: 'alta', movil: true },
	{ exp: -8, nombre: { es: 'transistor', en: 'transistor' }, fila: 'baja', movil: false },
	{ exp: -5, nombre: { es: 'neurona', en: 'neuron' }, fila: 'alta', movil: false },
	{ exp: 0, nombre: { es: 'tú', en: 'you' }, fila: 'alta', movil: true },
	{ exp: 4, nombre: { es: 'ciudad', en: 'city' }, fila: 'baja', movil: false },
	{ exp: 7, nombre: { es: 'Tierra', en: 'Earth' }, fila: 'alta', movil: true },
	{ exp: 9, nombre: { es: 'Sol', en: 'Sun' }, fila: 'baja', movil: false },
	{ exp: 13, nombre: { es: 'sistema solar', en: 'solar system' }, fila: 'alta', movil: false },
	{ exp: 21, nombre: { es: 'Vía Láctea', en: 'Milky Way' }, fila: 'baja', movil: false },
	{
		exp: 27,
		nombre: { es: 'universo observable', en: 'observable universe' },
		corto: { es: 'universo', en: 'universe' },
		fila: 'alta',
		movil: true,
	},
];

/** Posición de 10^exp en la regla, en % (0 = átomo, 100 = universo). */
export const posicion = (exp: number) => ((exp - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;

/** Exponente con signo menos tipográfico (−10, no -10). */
export const exponente = (exp: number) => (exp < 0 ? `−${-exp}` : String(exp));

export const bandaPorId = (id: BandaId) => BANDAS.find((b) => b.id === id)!;
