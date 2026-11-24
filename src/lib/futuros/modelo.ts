// Modelo de futuros (spec futuros.md §5.2): simula 2026–2126 año a año. Puro: sin DOM ni Astro.
import { poblacionOnu } from './datos-onu';
import type { Valores } from './parametros';
import { ANIO_INICIAL, ANIOS, seriesVacias, type Posicion, type Series } from './tipos';

/** La pandemia de 2020 cuenta como última crisis global: la primera nueva crisis posible es 2035. */
const ULTIMA_CRISIS = 2020 - ANIO_INICIAL;
const SEPARACION_CRISIS = 15;
const TWH_A_EJ = 0.0036;
const ANIOS_HASTA_2100 = 2100 - ANIO_INICIAL;

const limitar = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

export function simular({ paz: p, frontera: f }: Posicion, k: Valores): Series {
	const s = seriesVacias();
	const kappa = k.kMin + (k.kMax - k.kMin) * p;
	const gamma = k.gammaMin + (k.gammaMax - k.gammaMin) * f;
	const r = k.rMin + (k.rMax - k.rMin) * f;
	const duracionCrisis = Math.round(k.dCrisis);
	let L = 0;
	let R = k.r0;
	let Q = k.q0;
	let emisionesAcumuladas = 0;
	let riesgoAcumulado = 0;
	let crisisRestante = 0;
	let ultimaCrisis = ULTIMA_CRISIS;

	for (let t = 0; t < ANIOS; t++) {
		const A = k.a0 + ((k.aMax - k.a0) * L ** k.n) / (L ** k.n + k.l50 ** k.n);
		const S = 1 + k.sigma * L * (0.6 + 0.4 * p);
		// La electricidad mundial crece con la demanda de energía (supuesto: cuota eléctrica constante).
		const electricidad = k.eTot0 * (1 + gamma) ** t;
		// Techo físico: la IA se satura (tanh) hacia una cuota máxima de esa electricidad; con consumos pequeños, tanh(x) ≈ x.
		const techoIA = k.cuotaIA * electricidad;
		const eIA = techoIA * Math.tanh((k.eia0 * 10 ** (k.eps * L) * (1 - k.eta) ** t) / techoIA);
		const energia = k.te0 * (1 + gamma) ** t + TWH_A_EJ * eIA;
		const emisiones = k.em0 * (energia / k.te0) * ((1 - Q) / (1 - k.q0)) + k.u0 * (1 - k.upsilon) ** t;
		// En U: sin paz el poder se concentra en quien gana; con paz alta, en las instituciones que gobiernan la IA.
		// El reparto que trae la paz llega poco a poco: en 2026 todos los futuros parten de Π_0.
		const reparto = k.dPi * p * Math.min(1, t / k.tPi);
		const poder = limitar(k.pi0 + k.cPi * L * (1 - p) ** 2 - reparto + k.cInst * L * p ** 2, 0, 100);

		let crisis = 0;
		if (crisisRestante > 0) {
			crisis = 1;
			crisisRestante--;
		} else if ((1 - p) * (0.5 + poder / 100) > k.theta && t - ultimaCrisis >= SEPARACION_CRISIS) {
			crisis = 1;
			crisisRestante = duracionCrisis - 1;
			ultimaCrisis = t;
		}

		const g = (k.gMin + (k.gMax - k.gMin) * f) * (1 - k.phi * crisis);
		const dL = g * (1 - L / k.lMax);
		const riesgoDelAnio = k.hNat + k.hIa * (dL / k.gMax) * (1 - p) ** 2 + k.hConf * (poder / 100) * (1 - p);

		s.capacidad.push(L);
		s.automatizacion.push(A);
		s.empleo.push(k.e0 * (1 - (A - k.a0) * (1 - kappa)));
		s.desigualdad.push(limitar(k.gini0 + k.aG * (A - k.a0) * (1 - p) - k.bG * (A - k.a0) * p, 20, 90));
		s.robots.push(R);
		s.ciencia.push(S);
		s.energiaIA.push(eIA);
		s.energiaLimpia.push(Q);
		s.temperatura.push(k.t0 + (k.tcre * emisionesAcumuladas) / 1000);
		s.poblacion.push(
			poblacionOnu(ANIO_INICIAL + t) * (1 + (k.zOnu * 0.1 * t) / ANIOS_HASTA_2100) * (1 + k.mu * Math.log10(S)),
		);
		s.poder.push(poder);
		// Acumulado de los años ya transcurridos: en 2026 todavía es 0.
		s.riesgo.push(1 - Math.exp(-riesgoAcumulado));
		s.crisis.push(crisis);
		s.emisiones.push(emisiones);
		s.electricidad.push(electricidad);

		riesgoAcumulado += riesgoDelAnio;

		L += dL;
		R += r * R * (1 - R / Math.max(R, k.rSat * A));
		Q += k.qRate * (0.5 + p) * (1 + k.lambda * Math.log10(S)) * Q * (1 - Q);
		emisionesAcumuladas += emisiones;
	}
	return s;
}
