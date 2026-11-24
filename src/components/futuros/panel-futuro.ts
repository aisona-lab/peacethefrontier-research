// Isla de un futuro: controles paz/frontera, recálculo del modelo, URL compartible y año visible.
// La página llega calculada al compilar; esto solo actualiza atributos y textos.
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { textoEvento } from '../../lib/futuros/eventos';
import { celdaConBanda, formatear, INDICES_DECADAS, porcentaje } from '../../lib/futuros/formato';
import { proyectar } from '../../lib/futuros/montecarlo';
import {
	cuadranteCercano,
	escribirPosicion,
	leerPosicion,
	mismaPosicion,
	urlFuturo,
	type CuadranteId,
} from '../../lib/futuros/posicion';
import { ESCALAS, GRAFICOS, rutaBanda, rutaLinea, xAnio } from '../../lib/futuros/trazado';
import { ANIO_INICIAL, ANIOS, INDICADORES, type Indicador, type Posicion, type Resultado } from '../../lib/futuros/tipos';

const EJES = ['paz', 'frontera'] as const;

function fila(anio: number, celdas: string[]): HTMLTableRowElement {
	const tr = document.createElement('tr');
	const th = document.createElement('th');
	th.scope = 'row';
	th.textContent = String(anio);
	const tds = celdas.map((texto) => {
		const td = document.createElement('td');
		td.textContent = texto;
		return td;
	});
	tr.append(th, ...tds);
	return tr;
}

function itemEvento(anio: number, texto: string): HTMLLIElement {
	const li = document.createElement('li');
	const marca = document.createElement('span');
	marca.className = 'evento-anio';
	marca.textContent = String(anio);
	li.append(marca, ` ${texto}`);
	return li;
}

/** Década del hash (#2050 → 2046) si cae dentro del siglo; si no, 2026. */
function anioDelHash(hash: string): number {
	const anio = Number(hash.slice(1));
	if (!Number.isInteger(anio) || anio < ANIO_INICIAL || anio >= ANIO_INICIAL + ANIOS) return ANIO_INICIAL;
	return ANIO_INICIAL + Math.floor((anio - ANIO_INICIAL) / 10) * 10;
}

/** Fracción de la ventana donde se lee la década actual (centro de la franja del observador). */
const LINEA_DE_LECTURA = 0.425;
const ESPERA_URL_MS = 250;

class PtfFuturo extends HTMLElement {
	private idioma: Idioma = 'es';
	private cuadrante: CuadranteId = 'pausa';
	private preset: Posicion = { paz: 0.5, frontera: 0.5 };
	private posicion: Posicion = { paz: 0.5, frontera: 0.5 };
	private resultado: Resultado | null = null;
	private anio = ANIO_INICIAL;
	private fotograma = 0;
	private textoAviso = '';
	private esperaUrl = 0;

	connectedCallback() {
		this.idioma = this.dataset.lang === 'en' ? 'en' : 'es';
		this.cuadrante = this.dataset.cuadrante as CuadranteId;
		this.preset = { paz: Number(this.dataset.paz), frontera: Number(this.dataset.frontera) };
		this.posicion = leerPosicion(new URLSearchParams(location.search), this.preset);
		this.anio = anioDelHash(location.hash);
		this.dataset.interactivo = '';
		this.prepararControles();
		this.prepararBarra();
		this.observarParadas();
		// En la posición base y en 2026, el HTML ya trae este resultado: calcularlo al cargar solo bloqueaba
		// el hilo principal (~200 ms con la CPU de un móvil). Se calcula cuando haga falta.
		if (mismaPosicion(this.posicion, this.preset) && this.anio === ANIO_INICIAL) this.pintarControles();
		else this.recalcular();
	}

	private get t() {
		return textos(this.idioma).futuros;
	}

	private prepararControles() {
		for (const eje of EJES) {
			this.querySelector<HTMLInputElement>(`input[name="${eje}"]`)?.addEventListener('input', (e) => {
				this.posicion = { ...this.posicion, [eje]: Number((e.target as HTMLInputElement).value) };
				this.programarRecalculo();
			});
		}
		this.querySelector('[data-restablecer]')?.addEventListener('click', () => {
			this.posicion = this.preset;
			this.programarRecalculo();
		});
	}

	private prepararBarra() {
		const barra = this.querySelector<HTMLButtonElement>('[data-barra]');
		const panel = this.querySelector<HTMLElement>('[data-panel]');
		if (!barra || !panel) return;
		barra.hidden = false;
		barra.addEventListener('click', () => {
			const abierto = panel.dataset.abierto !== 'true';
			panel.dataset.abierto = String(abierto);
			barra.setAttribute('aria-expanded', String(abierto));
		});
	}

	private observarParadas() {
		// Las entradas solo traen lo que cambió: tras un salto pueden faltar. Se decide por geometría.
		const paradas = [...this.querySelectorAll<HTMLElement>('.parada')];
		const observador = new IntersectionObserver(
			() => {
				const linea = innerHeight * LINEA_DE_LECTURA;
				const actual = paradas.find((p) => {
					const caja = p.getBoundingClientRect();
					return caja.top <= linea && caja.bottom > linea;
				});
				if (!actual) return;
				const anio = Number(actual.dataset.anio);
				if (anio === this.anio) return;
				this.anio = anio;
				this.pintarAnio();
			},
			{ rootMargin: '-40% 0px -55% 0px' },
		);
		for (const parada of paradas) observador.observe(parada);
	}

	/** Un recálculo por fotograma aunque el control dispare decenas de eventos. */
	private programarRecalculo() {
		cancelAnimationFrame(this.fotograma);
		this.fotograma = requestAnimationFrame(() => this.recalcular());
	}

	/** Proyecta la posición actual; deja una medida 'ptf-futuro:proyectar' en la línea de tiempo del navegador. */
	private calcular(): boolean {
		const inicio = performance.now();
		try {
			this.resultado = proyectar(this.posicion);
		} catch (error) {
			console.warn('No se pudo recalcular el futuro', error);
			this.estado(this.t.panel.errorRecalculo);
			return false;
		}
		performance.measure('ptf-futuro:proyectar', { start: inicio });
		return true;
	}

	private recalcular() {
		if (!this.calcular()) return;
		this.estado('');
		this.pintarControles();
		this.pintarGraficos();
		this.pintarCifras();
		this.pintarEventos();
		this.pintarAnio();
		this.actualizarUrl();
	}

	private estado(texto: string) {
		const el = this.querySelector('[data-estado]');
		if (el) el.textContent = texto;
	}

	private pintarControles() {
		for (const eje of EJES) {
			const valor = this.posicion[eje];
			const entrada = this.querySelector<HTMLInputElement>(`input[name="${eje}"]`);
			if (entrada) {
				entrada.value = String(valor);
				entrada.setAttribute(
					'aria-valuetext',
					eje === 'paz' ? this.t.panel.valorPaz(valor) : this.t.panel.valorFrontera(valor),
				);
			}
			const salida = this.querySelector(`[data-salida="${eje}"]`);
			if (salida) salida.textContent = porcentaje(this.idioma, valor);
		}
		const punto = this.querySelector<HTMLElement>('[data-punto]');
		punto?.style.setProperty('--x', String(this.posicion.frontera));
		punto?.style.setProperty('--y', String(1 - this.posicion.paz));
	}

	private pintarGraficos() {
		const r = this.resultado;
		if (!r) return;
		for (const ind of INDICADORES) {
			this.querySelector(`[data-banda="${ind}"]`)?.setAttribute('d', rutaBanda(r.p10[ind], r.p90[ind], ESCALAS[ind]));
			this.querySelector(`[data-linea="${ind}"]`)?.setAttribute('d', rutaLinea(r.p50[ind], ESCALAS[ind]));
		}
		for (const g of GRAFICOS) {
			this.querySelector(`[data-grafico="${g.id}"] [data-tabla]`)?.replaceChildren(
				...INDICES_DECADAS.map((t) => fila(r.anios[t], g.series.map((s) => celdaConBanda(s, r, t, this.idioma)))),
			);
		}
	}

	private pintarCifras() {
		const r = this.resultado;
		if (!r) return;
		for (const el of this.querySelectorAll<HTMLElement>('[data-cifra]')) {
			const ind = el.dataset.cifra as Indicador;
			el.textContent = formatear(ind, r.p50[ind][Number(el.dataset.anio) - ANIO_INICIAL], this.idioma);
		}
	}

	private pintarEventos() {
		const r = this.resultado;
		if (!r) return;
		for (const lista of this.querySelectorAll<HTMLElement>('[data-eventos]')) {
			const desde = Number(lista.dataset.desde);
			const hasta = Number(lista.dataset.hasta);
			const eventos = r.eventos.filter((e) => e.anio >= desde && e.anio <= hasta);
			lista.replaceChildren(...eventos.map((e) => itemEvento(e.anio, textoEvento(e.id, this.idioma))));
			const vacio = lista.parentElement?.querySelector<HTMLElement>('[data-sin-eventos]');
			if (vacio) vacio.hidden = eventos.length > 0;
		}
	}

	/** Todo lo que depende del año visible: textos del año, cifras del panel, cursores, enlaces y aviso. */
	private pintarAnio() {
		// Al cargar en la posición base no se calculó nada: se calcula la primera vez que cambia el año.
		if (!this.resultado && !this.calcular()) return;
		const r = this.resultado;
		if (!r) return;
		const t = this.anio - ANIO_INICIAL;
		for (const el of this.querySelectorAll('[data-anio-texto]')) el.textContent = String(this.anio);
		for (const el of this.querySelectorAll<HTMLElement>('[data-valor]')) {
			const ind = el.dataset.valor as Indicador;
			el.textContent = formatear(ind, r.p50[ind][t], this.idioma);
		}
		const x = String(xAnio(t, r.anios.length));
		for (const cursor of this.querySelectorAll('[data-cursor]')) {
			cursor.setAttribute('x1', x);
			cursor.setAttribute('x2', x);
		}
		for (const puerta of this.querySelectorAll<HTMLAnchorElement>('[data-puerta]')) {
			puerta.href = `${urlFuturo(this.idioma, puerta.dataset.puerta as CuadranteId)}#${this.anio}`;
		}
		this.pintarAviso();
		this.pintarIdioma();
	}

	/** Avisa siempre que la posición no sea la del escenario base; el enlace solo si cambia de cuadrante.
	 * Solo reconstruye el aviso si cambia su texto: así los lectores de pantalla no lo repiten en cada década. */
	private pintarAviso() {
		const aviso = this.querySelector<HTMLElement>('[data-aviso]');
		if (!aviso) return;
		if (mismaPosicion(this.posicion, this.preset)) {
			aviso.hidden = true;
			aviso.replaceChildren();
			this.textoAviso = '';
			return;
		}
		const cercano = cuadranteCercano(this.posicion);
		const otro = cercano !== this.cuadrante;
		const texto = otro
			? `${this.t.panel.avisoPosicion(this.t.cuadrantes[this.cuadrante].nombre)} ${this.t.panel.aviso(this.t.cuadrantes[cercano].nombre)}`
			: this.t.panel.avisoPosicion(this.t.cuadrantes[this.cuadrante].nombre);
		const href = `${urlFuturo(this.idioma, cercano)}?${escribirPosicion(this.posicion)}#${this.anio}`;
		if (texto !== this.textoAviso) {
			const partes: (string | HTMLAnchorElement)[] = [texto];
			if (otro) {
				const enlace = document.createElement('a');
				enlace.textContent = this.t.panel.leerRelato(this.t.cuadrantes[cercano].nombre);
				partes.push(' ', enlace);
			}
			aviso.replaceChildren(...partes);
			this.textoAviso = texto;
			aviso.hidden = false;
		}
		aviso.querySelector('a')?.setAttribute('href', href);
	}

	/** Consulta (?paz=…) de la posición actual; vacía si es la del escenario base. */
	private consulta(): string {
		return mismaPosicion(this.posicion, this.preset) ? '' : `?${escribirPosicion(this.posicion)}`;
	}

	/** Escribe la URL tras una pausa: Safari lanza un error con más de 100 replaceState en 10 s. */
	private actualizarUrl() {
		clearTimeout(this.esperaUrl);
		this.esperaUrl = window.setTimeout(() => {
			try {
				history.replaceState(history.state, '', `${location.pathname}${this.consulta()}${location.hash}`);
			} catch (error) {
				console.warn('No se pudo actualizar la URL', error);
			}
		}, ESPERA_URL_MS);
	}

	/** El enlace al otro idioma conserva la posición y la década visibles. */
	private pintarIdioma() {
		for (const enlace of document.querySelectorAll<HTMLAnchorElement>('a[hreflang]:not([aria-current])')) {
			enlace.dataset.base ??= enlace.getAttribute('href') ?? '';
			const decada = this.anio === ANIO_INICIAL ? '' : `#${this.anio}`;
			enlace.href = `${enlace.dataset.base}${this.consulta()}${decada}`;
		}
	}
}

customElements.define('ptf-futuro', PtfFuturo);
