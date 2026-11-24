// Isla de la línea del tiempo: filtra por tema sin recargar (R4.3) y guarda el filtro en ?tema= (R4.7).
// Sin JS la lista se lee entera y el filtro no aparece.
class PtfLinea extends HTMLElement {
	connectedCallback() {
		const select = this.querySelector<HTMLSelectElement>('[data-filtro] select');
		if (!select) return console.warn('ptf-linea: falta el filtro');
		const pedido = new URLSearchParams(location.search).get('tema') ?? '';
		if ([...select.options].some((o) => o.value === pedido)) select.value = pedido;
		select.addEventListener('change', () => this.filtrar(select.value, true));
		this.filtrar(select.value, false);
	}

	private filtrar(tema: string, escribirUrl: boolean) {
		for (const el of this.querySelectorAll<HTMLElement | SVGElement>('[data-temas]')) {
			const visible = !tema || (el.dataset.temas ?? '').split(' ').includes(tema);
			el.toggleAttribute('hidden', !visible);
		}
		for (const tramo of this.querySelectorAll<HTMLElement>('.tramo')) {
			const eventos = tramo.querySelectorAll('.evento');
			tramo.hidden = eventos.length > 0 && [...eventos].every((e) => e.hasAttribute('hidden'));
		}
		if (!escribirUrl) return;
		try {
			history.replaceState(history.state, '', tema ? `?tema=${encodeURIComponent(tema)}` : location.pathname);
		} catch (error) {
			console.warn('ptf-linea: no se pudo actualizar la URL', error);
		}
	}
}

customElements.define('ptf-linea', PtfLinea);
