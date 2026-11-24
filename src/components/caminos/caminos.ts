// Isla de los caminos: lee las elecciones, mueve el punto de la mini matriz y escribe ?c= en la URL.
// La página llega con el estado inicial (hoy); sin JS se leen las decisiones y nada más.
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { DECISIONES, INICIO } from '../../lib/caminos/decisiones';
import { destino, escribirElecciones, etiqueta, leerElecciones, recorrer } from '../../lib/caminos/motor';
import { textoPosicion } from '../../lib/caminos/texto';
import type { CuadranteId } from '../../lib/futuros/posicion';

class PtfCaminos extends HTMLElement {
	private idioma: Idioma = 'es';
	private formulario?: HTMLFormElement;

	connectedCallback() {
		this.idioma = this.dataset.lang === 'en' ? 'en' : 'es';
		this.formulario = this.querySelector<HTMLFormElement>('[data-formulario]') ?? undefined;
		if (!this.formulario) return console.warn('ptf-caminos: falta el formulario');
		this.querySelector<HTMLElement>('[data-sin-js]')?.setAttribute('hidden', '');
		this.marcar(leerElecciones(DECISIONES, new URLSearchParams(location.search).get('c')));
		this.formulario.addEventListener('change', () => this.pintar());
		this.formulario.addEventListener('submit', (e) => e.preventDefault());
		// El reset vacía los radios después del evento: se pinta en la siguiente vuelta.
		this.formulario.addEventListener('reset', () => setTimeout(() => this.pintar()));
		this.pintar();
	}

	private marcar(elecciones: (string | undefined)[]) {
		DECISIONES.forEach((d, i) => {
			const radio = this.formulario?.querySelector<HTMLInputElement>(`input[name="${d.id}"][value="${elecciones[i]}"]`);
			if (radio) radio.checked = true;
		});
	}

	private elecciones(): (string | undefined)[] {
		return DECISIONES.map(
			(d) => this.formulario?.querySelector<HTMLInputElement>(`input[name="${d.id}"]:checked`)?.value,
		);
	}

	private pintar() {
		const t = textos(this.idioma);
		const elecciones = this.elecciones();
		const final = recorrer(DECISIONES, elecciones, INICIO).at(-1) ?? INICIO;
		const { id, url } = destino(final, this.idioma);
		const texto = (selector: string, valor: string) => {
			const el = this.querySelector<HTMLElement>(selector);
			if (el && el.textContent !== valor) el.textContent = valor;
		};
		texto('[data-elegidas]', t.caminos.elegidas(elecciones.filter(Boolean).length, DECISIONES.length));
		texto('[data-destino-nombre]', t.futuros.cuadrantes[id].nombre);
		texto('[data-posicion]', textoPosicion(this.idioma, final));
		this.querySelector<HTMLAnchorElement>('[data-destino]')?.setAttribute('href', url);
		this.pintarResumen(elecciones, id, url);
		const punto = this.querySelector<HTMLElement>('[data-punto]');
		punto?.style.setProperty('--x', String(final.frontera));
		punto?.style.setProperty('--y', String(1 - final.paz));
		const c = escribirElecciones(elecciones);
		try {
			history.replaceState(history.state, '', c ? `?c=${c}` : location.pathname);
		} catch (error) {
			console.warn('ptf-caminos: no se pudo actualizar la URL', error);
		}
	}

	/** Resumen al final de la lista: cuántas opciones de cada etiqueta y a qué futuro llevan. */
	private pintarResumen(elecciones: (string | undefined)[], id: CuadranteId, url: string) {
		const t = textos(this.idioma);
		const texto = this.querySelector<HTMLElement>('[data-resumen-texto]');
		const destino = this.querySelector<HTMLElement>('[data-resumen-destino]');
		const cuenta = { etico: 0, ambiguo: 0, 'no-etico': 0 };
		DECISIONES.forEach((d, i) => {
			const opcion = d.opciones.find((o) => o.id === elecciones[i]);
			if (opcion) cuenta[etiqueta(opcion.criterios)]++;
		});
		const alguna = cuenta.etico + cuenta.ambiguo + cuenta['no-etico'] > 0;
		if (texto) texto.textContent = alguna ? t.caminos.resumen(cuenta.etico, cuenta.ambiguo, cuenta['no-etico']) : t.caminos.resumenVacio;
		if (!destino) return;
		destino.hidden = !alguna;
		const enlace = destino.querySelector('a');
		if (enlace) {
			enlace.href = url;
			enlace.textContent = t.futuros.cuadrantes[id].nombre;
		}
	}
}

customElements.define('ptf-caminos', PtfCaminos);
