// Isla <ptf-h1-explorable>: sliders de fiabilidad por paso, cadena K y verificación,
// mapa de calor SVG del espacio de parámetros con frontera de inversión y contraste en vivo contra dataset.csv.
import {
	H1_LIMITS,
	H1_SECTOR_LABELS,
	computeAllSectorsComparison,
	computeCrossoverTrajectory,
	computeSensitivityHeatmap,
	defaultParamsForSector,
	escribirParametrosH1,
	leerParametrosH1,
	parseH1CsvSummary,
	type H1InteractiveParams,
	type H1RegimeId,
	type H1SectorId,
} from '../../lib/programa/h1-explorable';

const SVG_NS = 'http://www.w3.org/2000/svg';
const HEAT_W = 540;
const HEAT_H = 310;
const PAD_L = 44;
const PAD_R = 14;
const PAD_T = 16;
const PAD_B = 34;

function svgEl<K extends keyof SVGElementTagNameMap>(
	tag: K,
	attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
	const node = document.createElementNS(SVG_NS, tag);
	for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
	return node;
}

class PtfH1Explorable extends HTMLElement {
	private idioma: 'es' | 'en' = 'es';
	private params: H1InteractiveParams = defaultParamsForSector();
	private csvText: string | null = null;
	private raf = 0;
	private urlTimer = 0;

	connectedCallback() {
		this.idioma = this.dataset.lang === 'en' ? 'en' : 'es';
		this.params = leerParametrosH1(new URLSearchParams(location.search));
		this.dataset.interactivo = '';
		this.syncInputs();
		this.bindEvents();
		this.renderAll();
		void this.loadCsv();
	}

	private get t() {
		return this.idioma === 'es'
			? {
					sinCruce: 'Sin cruce (copiloto domina hasta 2036)',
					sinCruceCorto: 'Sin cruce',
					cruceEn: (y: number) => `Cruce en ${y}`,
					copiado: 'Enlace copiado con tus supuestos.',
					copiaError: 'No se pudo copiar automáticamente; copia la URL de la barra.',
					csvCargando: 'Cargando dataset.csv (3.300 filas)…',
					csvOk: (rows: number, med: number | null, a31: number) =>
						`CSV verificado (${rows.toLocaleString('es-ES')} filas): mediana publicada ${med ?? 'sin cruce'} · adopción 2031: ${Math.round(a31 * 100)} %.`,
					csvError: 'No se pudo leer dataset.csv; mostrando cálculo directo del modelo.',
					ejes: (early: number, late: number, never: number) =>
						`Mapa de calor p₀ frente a K: ${Math.round(early * 100)} % cruza en ≤5 años, ${Math.round(late * 100)} % en 6–10 años y ${Math.round(never * 100)} % permanece en copiloto.`,
				}
			: {
					sinCruce: 'No crossover (copilot dominates through 2036)',
					sinCruceCorto: 'No crossover',
					cruceEn: (y: number) => `Crossover in ${y}`,
					copiado: 'Shareable link copied with your assumptions.',
					copiaError: 'Clipboard unavailable; copy the URL from the address bar.',
					csvCargando: 'Loading dataset.csv (3,300 rows)…',
					csvOk: (rows: number, med: number | null, a31: number) =>
						`CSV verified (${rows.toLocaleString('en-US')} rows): published median ${med ?? 'no crossover'} · 2031 adoption: ${Math.round(a31 * 100)}%.`,
					csvError: 'Could not read dataset.csv; showing direct model calculation.',
					ejes: (early: number, late: number, never: number) =>
						`Heatmap of p₀ vs K: ${Math.round(early * 100)}% crosses within 5y, ${Math.round(late * 100)}% in 6–10y, and ${Math.round(never * 100)}% stays copilot.`,
				};
	}

	private async loadCsv() {
		const status = this.querySelector<HTMLElement>('[data-csv-status]');
		if (status) status.textContent = this.t.csvCargando;
		try {
			const res = await fetch('/datos/experimentos/h1-delegacion-autonoma/dataset.csv');
			if (!res.ok) throw new Error(String(res.status));
			this.csvText = await res.text();
			this.renderCsvComparison();
		} catch {
			if (status) status.textContent = this.t.csvError;
		}
	}

	private syncInputs() {
		const set = (name: string, val: string) => {
			const el = this.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
			if (el) el.value = val;
		};
		set('sector', this.params.sectorId);
		set('regime', this.params.regimeId);
		set('p0', this.params.baseStepReliability.toFixed(3));
		set('k', String(this.params.steps));
		set('audit', this.params.agentAuditCost.toFixed(1));
		set('det', this.params.baseDetectionRate.toFixed(2));
	}

	private bindEvents() {
		this.querySelector<HTMLSelectElement>('select[name="sector"]')?.addEventListener('change', (e) => {
			const sectorId = (e.target as HTMLSelectElement).value as H1SectorId;
			this.params = defaultParamsForSector(sectorId, this.params.regimeId);
			this.syncInputs();
			this.scheduleRender();
		});
		this.querySelector<HTMLSelectElement>('select[name="regime"]')?.addEventListener('change', (e) => {
			this.params = { ...this.params, regimeId: (e.target as HTMLSelectElement).value as H1RegimeId };
			this.scheduleRender();
		});

		const bindRange = (
			name: 'p0' | 'k' | 'audit' | 'det',
			apply: (n: number) => Partial<H1InteractiveParams>,
		) => {
			this.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.addEventListener('input', (e) => {
				const value = Number((e.target as HTMLInputElement).value);
				this.params = { ...this.params, ...apply(value) };
				this.scheduleRender();
			});
		};

		bindRange('p0', (v) => ({ baseStepReliability: v }));
		bindRange('k', (v) => ({ steps: Math.round(v) }));
		bindRange('audit', (v) => ({ agentAuditCost: v }));
		bindRange('det', (v) => ({ baseDetectionRate: v }));

		this.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
			this.params = defaultParamsForSector(this.params.sectorId, 'baseline-coevolution');
			this.syncInputs();
			this.scheduleRender();
		});

		this.querySelector<HTMLButtonElement>('[data-copy-link]')?.addEventListener('click', async () => {
			const msg = this.querySelector<HTMLElement>('[data-copy-status]');
			const url = `${location.origin}${location.pathname}${escribirParametrosH1(this.params)}#explorable-h1`;
			try {
				await navigator.clipboard.writeText(url);
				if (msg) msg.textContent = this.t.copiado;
			} catch {
				if (msg) msg.textContent = this.t.copiaError;
			}
		});
	}

	private scheduleRender() {
		cancelAnimationFrame(this.raf);
		this.raf = requestAnimationFrame(() => {
			this.renderAll();
			clearTimeout(this.urlTimer);
			this.urlTimer = window.setTimeout(() => {
				const qs = escribirParametrosH1(this.params);
				history.replaceState(null, '', `${location.pathname}${qs}${location.hash}`);
			}, 180);
		});
	}

	private renderCsvComparison() {
		const status = this.querySelector<HTMLElement>('[data-csv-status]');
		if (!status || !this.csvText) return;
		const summary = parseH1CsvSummary(this.csvText, this.params.sectorId, this.params.regimeId);
		status.textContent = this.t.csvOk(
			summary.totalRows,
			summary.medianCrossoverYear,
			summary.adoptionShare2031,
		);
	}

	private renderAll() {
		const loc = this.idioma === 'es' ? 'es-ES' : 'en-US';
		const fmtPct = (v: number, digits = 1) =>
			new Intl.NumberFormat(loc, { style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
		const fmtNum = (v: number, digits = 1) =>
			new Intl.NumberFormat(loc, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);

		const setOut = (key: string, text: string) => {
			const el = this.querySelector<HTMLElement>(`[data-out="${key}"]`);
			if (el) el.textContent = text;
		};

		setOut('p0', fmtPct(this.params.baseStepReliability, 1));
		setOut('k', String(this.params.steps));
		setOut('audit', fmtNum(this.params.agentAuditCost, 1));
		setOut('det', fmtPct(this.params.baseDetectionRate, 0));

		const traj = computeCrossoverTrajectory(this.params);
		const yearNode = this.querySelector<HTMLElement>('[data-crossover-year]');
		if (yearNode) {
			yearNode.textContent = traj.crossoverYear ? String(traj.crossoverYear) : this.t.sinCruceCorto;
			yearNode.dataset.state = traj.crossoverYear === null ? 'never' : traj.crossoverYear <= 2031 ? 'early' : 'late';
		}
		setOut('verdict', traj.crossoverYear ? this.t.cruceEn(traj.crossoverYear) : this.t.sinCruce);
		setOut('chain2031', fmtPct(traj.point2031.chainReliability, 1));
		setOut('tail2031', fmtPct(traj.point2031.tailRisk, 2));
		setOut('saving2031', `${traj.point2031.netSaving >= 0 ? '+' : ''}${fmtNum(traj.point2031.netSaving, 1)}`);

		// 5-sector live comparison table
		const tbody = this.querySelector<HTMLTableSectionElement>('[data-sectors-body]');
		if (tbody) {
			const comparison = computeAllSectorsComparison(this.params);
			tbody.replaceChildren(
				...comparison.map((row) => {
					const tr = document.createElement('tr');
					if (row.isSelected) tr.dataset.selected = 'true';
					const th = document.createElement('th');
					th.scope = 'row';
					th.textContent = H1_SECTOR_LABELS[row.sectorId][this.idioma];
					const tdYear = document.createElement('td');
					tdYear.textContent = row.crossoverYear ? String(row.crossoverYear) : this.t.sinCruceCorto;
					const tdRisk = document.createElement('td');
					tdRisk.textContent = fmtPct(row.tailRisk2031, 2);
					const tdSav = document.createElement('td');
					tdSav.textContent = `${row.netSaving2031 >= 0 ? '+' : ''}${fmtNum(row.netSaving2031, 1)}`;
					tr.append(th, tdYear, tdRisk, tdSav);
					return tr;
				}),
			);
		}

		// Sensitivity heatmap SVG
		const heat = computeSensitivityHeatmap(this.params);
		const svg = this.querySelector<SVGSVGElement>('[data-heatmap-svg]');
		if (svg) {
			const plotW = HEAT_W - PAD_L - PAD_R;
			const plotH = HEAT_H - PAD_T - PAD_B;
			const cols = heat.pValues.length;
			const rows = heat.kValues.length;
			const cellW = plotW / cols;
			const cellH = plotH / rows;

			const children: SVGElement[] = [];

			// Cells (Y inverted so larger K is at top)
			for (const c of heat.cells) {
				const x = PAD_L + c.col * cellW;
				const y = PAD_T + (rows - 1 - c.row) * cellH;
				const rect = svgEl('rect', {
					x: x.toFixed(1),
					y: y.toFixed(1),
					width: (cellW + 0.4).toFixed(1),
					height: (cellH + 0.4).toFixed(1),
					class: `hm-cell hm-${c.regimeClass}`,
				});
				const title = svgEl('title', {});
				title.textContent = `p₀=${fmtPct(c.p0, 1)}, K=${c.steps} → ${c.crossoverYear ?? this.t.sinCruceCorto}`;
				rect.append(title);
				children.push(rect);
			}

			// Inversion boundary polyline (Copilot ↔ Autonomous within 2026-2036)
			const buildBoundary = (indices: readonly (number | null)[]) => {
				const pts: string[] = [];
				for (let r = 0; r < rows; r++) {
					const flipCol = indices[r];
					if (flipCol === null || flipCol === 0) continue;
					const x = PAD_L + flipCol * cellW;
					const yBottom = PAD_T + (rows - r) * cellH;
					const yTop = PAD_T + (rows - 1 - r) * cellH;
					pts.push(`${x.toFixed(1)},${yBottom.toFixed(1)}`, `${x.toFixed(1)},${yTop.toFixed(1)}`);
				}
				return pts;
			};

			const boundary5yPts = buildBoundary(heat.flip5yIndexByRow);
			if (boundary5yPts.length >= 2) {
				children.push(
					svgEl('polyline', {
						points: boundary5yPts.join(' '),
						class: 'hm-boundary-5y',
					}),
				);
			}

			const boundaryPts = buildBoundary(heat.flipIndexByRow);
			if (boundaryPts.length >= 2) {
				children.push(
					svgEl('polyline', {
						points: boundaryPts.join(' '),
						class: 'hm-boundary',
					}),
				);
			}

			// Current slider position marker
			const fracX = (this.params.baseStepReliability - H1_LIMITS.p0.min) / (H1_LIMITS.p0.max - H1_LIMITS.p0.min);
			const curX = PAD_L + Math.min(1, Math.max(0, fracX)) * plotW;
			const kIdx = heat.kValues.reduce(
				(best, k, i) => (Math.abs(k - this.params.steps) < Math.abs(heat.kValues[best]! - this.params.steps) ? i : best),
				0,
			);
			const curY = PAD_T + (rows - 1 - kIdx + 0.5) * cellH;
			children.push(
				svgEl('line', { x1: curX.toFixed(1), x2: curX.toFixed(1), y1: PAD_T, y2: PAD_T + plotH, class: 'hm-guide' }),
				svgEl('line', { x1: PAD_L, x2: PAD_L + plotW, y1: curY.toFixed(1), y2: curY.toFixed(1), class: 'hm-guide' }),
				svgEl('circle', { cx: curX.toFixed(1), cy: curY.toFixed(1), r: 5.5, class: 'hm-marker' }),
			);

			// Axes labels
			for (const idx of [0, 6, 12, cols - 1]) {
				const pVal = heat.pValues[idx]!;
				const tx = PAD_L + (idx + 0.5) * cellW;
				const txt = svgEl('text', { x: tx.toFixed(1), y: HEAT_H - 14, class: 'hm-axis', 'text-anchor': 'middle' });
				txt.textContent = fmtPct(pVal, 1);
				children.push(txt);
			}
			for (const r of [0, 4, 8, rows - 1]) {
				const kVal = heat.kValues[r]!;
				const ty = PAD_T + (rows - 1 - r + 0.65) * cellH;
				const txt = svgEl('text', { x: PAD_L - 8, y: ty.toFixed(1), class: 'hm-axis', 'text-anchor': 'end' });
				txt.textContent = `K=${kVal}`;
				children.push(txt);
			}

			svg.replaceChildren(...children);
			svg.setAttribute('aria-label', this.t.ejes(heat.shareEarly, heat.shareLate, heat.shareNever));
		}

		setOut('share-early', fmtPct(heat.shareEarly, 0));
		setOut('share-late', fmtPct(heat.shareLate, 0));
		setOut('share-never', fmtPct(heat.shareNever, 0));

		this.renderCsvComparison();
	}
}

if (!customElements.get('ptf-h1-explorable')) {
	customElements.define('ptf-h1-explorable', PtfH1Explorable);
}
