import type { Idioma } from '../i18n/rutas';

export const ESTADOS_EDITORIALES = [
	'publicado',
	'nota-investigacion',
	'borrador',
	'actualizacion-pendiente',
] as const;

export type EstadoEditorial = (typeof ESTADOS_EDITORIALES)[number];

/** Admite precisión mensual (AAAA-MM) o diaria (AAAA-MM-DD), sin inventar un día. */
export function esDatosHasta(valor: string): boolean {
	const partes = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(valor);
	if (!partes) return false;
	const [, anio, mes, dia] = partes;
	const fecha = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia ?? 1)));
	return (
		fecha.getUTCFullYear() === Number(anio) &&
		fecha.getUTCMonth() === Number(mes) - 1 &&
		(!dia || fecha.getUTCDate() === Number(dia))
	);
}

export function formatearDatosHasta(valor: string, lang: Idioma): string {
	const [anio, mes, dia] = valor.split('-').map(Number);
	return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
		year: 'numeric',
		month: 'long',
		...(dia ? { day: 'numeric' } : {}),
		timeZone: 'UTC',
	}).format(new Date(Date.UTC(anio, mes - 1, dia ?? 1)));
}
