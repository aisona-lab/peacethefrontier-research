declare namespace App {
	interface Locals {
		/** Lo fija PaginaFuturo antes de renderizar el relato; lo leen Parada, Ambito y Cifra. */
		futuro?: import('./lib/futuros/contexto').DatosFuturo;
		/** Lo fija PaginaArticulo antes de renderizar el MDX; lo lee Nota. */
		articulo?: { fuentes: readonly string[]; lang: import('./i18n/rutas').Idioma };
	}
}
