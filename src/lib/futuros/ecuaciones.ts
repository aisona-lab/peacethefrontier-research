// Ecuaciones del modelo (spec futuros.md §5.2) en LaTeX. Se convierten a MathML al compilar con temml.
import type { Idioma } from '../../i18n/rutas';

export interface Ecuacion {
	id: string;
	titulo: Record<Idioma, string>;
	latex: string;
	descripcion: Record<Idioma, string>;
}

export const ECUACIONES: readonly Ecuacion[] = [
	{
		id: 'capacidad',
		titulo: { es: 'Capacidad de la IA', en: 'AI capability' },
		latex: String.raw`L(t+1) = L(t) + g(t)\left(1 - \frac{L(t)}{L_{max}}\right),\quad g(t) = \left[g_{min} + (g_{max} - g_{min})\,f\right]\left(1 - \varphi\,\mathrm{crisis}(t)\right)`,
		descripcion: {
			es: 'L es el logaritmo del cómputo respecto a 2026. Crece según la frontera f, se frena cerca de su techo y durante las crisis.',
			en: 'L is the logarithm of compute relative to 2026. It grows with the frontier f, slows near its ceiling and during crises.',
		},
	},
	{
		id: 'automatizacion',
		titulo: { es: 'Tareas automatizables', en: 'Automatable tasks' },
		latex: String.raw`A(t) = A_0 + (A_{max} - A_0)\,\frac{L(t)^n}{L(t)^n + L_{50}^{\,n}}`,
		descripcion: {
			es: 'Una curva en S: pocas tareas al principio, la mitad cuando la capacidad llega a L₅₀.',
			en: 'An S-curve: few tasks at first, half of them once capability reaches L₅₀.',
		},
	},
	{
		id: 'empleo',
		titulo: { es: 'Empleo', en: 'Employment' },
		latex: String.raw`E(t) = E_0\left(1 - \left(A(t) - A_0\right)(1 - \kappa)\right),\quad \kappa = \kappa_{min} + (\kappa_{max} - \kappa_{min})\,p`,
		descripcion: {
			es: 'La paz p aumenta la parte del desplazamiento que compensan nuevas tareas y políticas (κ).',
			en: 'Peace p increases the share of displacement offset by new tasks and policies (κ).',
		},
	},
	{
		id: 'desigualdad',
		titulo: { es: 'Desigualdad', en: 'Inequality' },
		latex: String.raw`G(t) = G_0 + a\left(A(t) - A_0\right)(1 - p) - b\left(A(t) - A_0\right)p`,
		descripcion: {
			es: 'La automatización sin reglas la sube; la redistribución la baja.',
			en: 'Automation without rules raises it; redistribution lowers it.',
		},
	},
	{
		id: 'robots',
		titulo: { es: 'Robots', en: 'Robots' },
		latex: String.raw`R(t+1) = R(t) + r\,R(t)\left(1 - \frac{R(t)}{\max\left(R(t),\,R_{sat}\,A(t)\right)}\right),\quad r = r_{min} + (r_{max} - r_{min})\,f`,
		descripcion: {
			es: 'Una curva en S cuyo techo sube con la automatización.',
			en: 'An S-curve whose ceiling rises with automation.',
		},
	},
	{
		id: 'ciencia',
		titulo: { es: 'Ritmo de la ciencia', en: 'Pace of science' },
		latex: String.raw`S(t) = 1 + \sigma\,L(t)\left(\tfrac{3}{5} + \tfrac{2}{5}\,p\right)`,
		descripcion: {
			es: 'Cada orden de magnitud de IA acelera la ciencia; la cooperación (ciencia abierta) lo amplifica.',
			en: 'Each order of magnitude of AI speeds up science; cooperation (open science) amplifies it.',
		},
	},
	{
		id: 'energiaIA',
		titulo: { es: 'Electricidad de los centros de datos', en: 'Data-centre electricity' },
		latex: String.raw`E_{IA}(t) = s_{IA}\,E_{tot}(t)\,\tanh\!\left(\frac{E_{IA,0}\;10^{\varepsilon L(t)}\,(1 - \eta)^{t}}{s_{IA}\,E_{tot}(t)}\right)`,
		descripcion: {
			es: 'La base incluye todos los centros de datos, no solo IA. Su evolución con la capacidad es un supuesto del modelo. Crece con la capacidad y se modera con la eficiencia, pero nunca supera una cuota s_IA de la electricidad mundial: la tangente hiperbólica la satura en ese techo y apenas la cambia mientras es pequeña.',
			en: 'The baseline includes all data centres, not just AI. Its evolution with capability is a model assumption. It grows with capability and is tempered by efficiency, but never exceeds a share s_IA of world electricity: the hyperbolic tangent saturates it at that ceiling and barely changes it while it is small.',
		},
	},
	{
		id: 'energiaLimpia',
		titulo: { es: 'Energía limpia', en: 'Clean energy' },
		latex: String.raw`Q(t+1) = Q(t) + q_0\left(\tfrac{1}{2} + p\right)\left(1 + \lambda \log_{10} S(t)\right)Q(t)\left(1 - Q(t)\right)`,
		descripcion: {
			es: 'Una curva en S que aceleran la cooperación y la ciencia.',
			en: 'An S-curve accelerated by cooperation and science.',
		},
	},
	{
		id: 'energia',
		titulo: { es: 'Demanda de energía y electricidad', en: 'Energy and electricity demand' },
		latex: String.raw`TE(t) = TE_0\,(1 + \gamma(f))^{t} + c_{EJ}\,E_{IA}(t),\quad \gamma(f) = \gamma_{min} + (\gamma_{max} - \gamma_{min})\,f,\quad E_{tot}(t) = E_{tot,0}\,(1 + \gamma(f))^{t}`,
		descripcion: {
			es: 'Una economía con IA más rápida usa más energía. La electricidad mundial crece al mismo ritmo (supuesto: cuota eléctrica constante, que subestima la electrificación). c_EJ = 0,0036 convierte TWh en EJ. Queda pendiente conciliar esta suma de electricidad con la base de energía primaria por sustitución: puede contar dos veces demanda ya incluida.',
			en: 'An economy with faster AI uses more energy. World electricity grows at the same rate (assumption: constant electricity share, which underestimates electrification). c_EJ = 0.0036 converts TWh to EJ. Reconciling this electricity addition with the substitution-method primary-energy baseline remains unresolved: demand already included may be counted twice.',
		},
	},
	{
		id: 'temperatura',
		titulo: { es: 'Calentamiento', en: 'Warming' },
		latex: String.raw`T(t) = T_0 + \mathrm{TCRE}\cdot\frac{\sum_{\tau<t} Em(\tau)}{1000},\quad Em(t) = Em_0\,\frac{TE(t)}{TE_0}\,\frac{1 - Q(t)}{1 - Q_0} + U_0(1 - \upsilon)^{t}`,
		descripcion: {
			es: 'La relación TCRE del IPCC: el calentamiento es proporcional al CO₂ acumulado. La demanda de energía TE crece más rápido con más frontera.',
			en: 'The IPCC TCRE relationship: warming is proportional to cumulative CO₂. Energy demand TE grows faster with more frontier.',
		},
	},
	{
		id: 'poblacion',
		titulo: { es: 'Población', en: 'Population' },
		latex: String.raw`P(t) = P_{ONU}(t)\left(1 + \frac{z_{ONU}\,t}{740}\right)\left(1 + \mu \log_{10} S(t)\right)`,
		descripcion: {
			es: 'La variante media de la ONU, con una desviación supuesta de ±10 % en 2100 y un ajuste supuesto por avances en salud; no reproduce el intervalo probabilístico de la ONU.',
			en: 'The UN medium variant, with an assumed ±10% deviation in 2100 and an assumed health adjustment; this does not reproduce the UN probabilistic interval.',
		},
	},
	{
		id: 'poder',
		titulo: { es: 'Concentración del poder', en: 'Power concentration' },
		latex: String.raw`\Pi(t) = \Pi_0 + c\,L(t)\,(1 - p)^2 - d\,p\,\min\!\left(1, \frac{t}{T_\Pi}\right) + c_{inst}\,L(t)\,p^2`,
		descripcion: {
			es: 'Un índice ilustrativo en U: más IA sin paz concentra el poder en quien gana; más IA con mucha paz lo concentra en las instituciones que la gobiernan. El reparto que trae la paz llega en T_Π años, así que en 2026 todos los futuros parten de Π₀.',
			en: 'An illustrative U-shaped index: more AI without peace concentrates power in whoever wins; more AI with a lot of peace concentrates it in the institutions that govern it. The spread that peace brings arrives over T_Π years, so in 2026 every future starts from Π₀.',
		},
	},
	{
		id: 'riesgo',
		titulo: { es: 'Riesgo acumulado de catástrofe', en: 'Cumulative risk of catastrophe' },
		latex: String.raw`h(t) = h_{nat} + h_{IA}\,\frac{\Delta L(t)}{g_{max}}\,(1 - p)^2 + h_{conf}\,\frac{\Pi(t)}{100}\,(1 - p),\quad \mathrm{riesgo}(t) = 1 - e^{-\sum_{\tau < t} h(\tau)}`,
		descripcion: {
			es: 'Probabilidad acumulada, en los años ya transcurridos desde 2026, de una catástrofe que mate a ≥ 10 % de la humanidad en 5 años (la definición del torneo XPT): un riesgo de base más el del avance rápido sin paz y el de la concentración del poder. En 2026 vale 0.',
			en: 'Cumulative probability, over the years elapsed since 2026, of a catastrophe killing ≥ 10% of humanity within 5 years (the XPT tournament’s definition): a baseline risk plus that of fast progress without peace and that of power concentration. It is 0 in 2026.',
		},
	},
	{
		id: 'crisis',
		titulo: { es: 'Crisis', en: 'Crises' },
		latex: String.raw`\chi(t) = (1 - p)\left(\tfrac{1}{2} + \frac{\Pi(t)}{100}\right),\quad \mathrm{crisis}(t) = 1 \iff \chi(t) > \theta`,
		descripcion: {
			es: 'Cuando la tensión χ supera θ estalla una crisis de D años; no puede repetirse antes de 15 años (la última fue la pandemia de 2020).',
			en: 'When tension χ exceeds θ a crisis of D years breaks out; it cannot repeat within 15 years (the last one was the 2020 pandemic).',
		},
	},
];
