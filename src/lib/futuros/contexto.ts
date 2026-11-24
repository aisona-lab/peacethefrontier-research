import type { Idioma } from '../../i18n/rutas';
import type { Resultado } from './tipos';

export interface DatosFuturo {
	resultado: Resultado;
	lang: Idioma;
}

/** Los componentes del relato leen el modelo que calculó la página (verificado: Astro.locals llega al MDX). */
export function datosFuturo(locals: { futuro?: DatosFuturo }): DatosFuturo {
	if (!locals.futuro) {
		throw new Error('Componente de futuro fuera de una página de futuro: falta Astro.locals.futuro');
	}
	return locals.futuro;
}
