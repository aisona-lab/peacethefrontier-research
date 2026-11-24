import type { Idioma } from '../../i18n/rutas';
import type { NivelId } from '../evidencia';

export const HIPOTESIS_IDS = ['H1', 'H2', 'H3'] as const;
export type HipotesisId = (typeof HIPOTESIS_IDS)[number];

export interface TextoHipotesis {
	readonly enunciado: string;
	readonly subtitulo: string;
	readonly subtemasNaturales: readonly string[];
	readonly mecanismoTeorico: string;
	readonly criterioRefutacion: string;
	readonly hallazgoPrincipal: string;
}

export interface Hipotesis {
	readonly id: HipotesisId;
	readonly horizonte: string;
	readonly evidencia: NivelId;
	readonly temas: readonly string[];
	readonly paperClave: string;
	readonly paperSlug: Record<Idioma, string>;
	readonly experimentoId: string;
	readonly rutaCodigo: string;
	readonly comandoReproduccion: string;
	readonly es: TextoHipotesis;
	readonly en: TextoHipotesis;
}

export const TESIS_CENTRAL = {
	es: {
		kicker: 'Portafolio de Investigación · Carlos Nicolás Soto',
		titulo: 'Agentes autónomos como infraestructura de la próxima década',
		tesis:
			'En la próxima década (2026–2036), la transformación estructural de la inteligencia artificial no vendrá de mejores interfaces conversacionales, sino de bucles agénticos integrados como infraestructura operativa, institucional y científica. Dónde reemplazan a las herramientas actuales y dónde fracasan depende de tres cuellos de botella medibles: el coste de verificación frente a la fiabilidad compuesta, la arquitectura de coordinación multi-agente y la existencia de oráculos físicos verificables.',
		compromiso:
			'Cada hipótesis de este portafolio se formula para poder ser refutada y se acompaña de un modelo formal, código público en GitHub, datos reproducibles verificados con SHA-256 y nivel explícito de evidencia.',
	},
	en: {
		kicker: 'Research Portfolio · Carlos Nicolás Soto',
		titulo: 'Autonomous agents as the infrastructure of the next decade',
		tesis:
			'Over the next decade (2026–2036), structural AI transformation will not come from better conversational interfaces, but from agentic loops embedded as operational, institutional and scientific infrastructure. Where they replace assistive tools—and where they fail—depends on three measurable bottlenecks: verification cost relative to compound reliability, multi-agent coordination architecture and verifiable physical oracles.',
		compromiso:
			'Every hypothesis in this portfolio is stated in falsifiable form and paired with a formal model, public code on GitHub, SHA-256-verified reproducible datasets and an explicit level of evidence.',
	},
} as const;

export const HIPOTESIS: readonly Hipotesis[] = [
	{
		id: 'H1',
		horizonte: '2026–2036',
		evidencia: 'emergente',
		temas: ['ia', 'espacio', 'salud', 'energia', 'informacion', 'gobernanza'],
		paperClave: 'wp-delegacion-autonoma',
		paperSlug: {
			es: 'de-copilotos-a-agentes-autonomos',
			en: 'from-copilots-to-autonomous-agents',
		},
		experimentoId: 'h1-delegacion-autonoma',
		rutaCodigo: 'experiments/h1-delegacion-autonoma',
		comandoReproduccion: 'npm run experiments:check',
		es: {
			enunciado: 'Los agentes autónomos reemplazarán las herramientas de apoyo en 5–10 años',
			subtitulo: 'Economía de delegación, fiabilidad compuesta y coste de verificación',
			subtemasNaturales: ['Ciencia', 'Salud', 'Energía', 'Educación', 'Gobierno'],
			mecanismoTeorico:
				'Un copiloto exige supervisión humana paso a paso; un agente autónomo ejecuta cadenas de K pasos pero acumula probabilidad de fallo compuesto (1 − p^K). El reemplazo ocurre solo cuando el ahorro de supervisión supera la pérdida esperada por fallos no detectados.',
			criterioRefutacion:
				'Quedaría refutada si entre 2031 y 2036 más del 60 % de los flujos estructurados en ciencia computacional, educación y administración siguen exigiendo intervención humana paso a paso pese a disponer de verificadores automáticos con detección > 95 %.',
			hallazgoPrincipal:
				'En el experimento de 5 sectores (3.300 filas), ciencia, educación y administración cruzan a infraestructura autónoma en 2028–2029 bajo coevolución base, mientras gestión sanitaria (2033) y red eléctrica (2034) exigen infraestructura dedicada de verificación para cruzar hacia 2030–2031.',
		},
		en: {
			enunciado: 'Autonomous agents will replace assistive tools within 5–10 years',
			subtitulo: 'Delegation economics, compound reliability and verification cost',
			subtemasNaturales: ['Science', 'Health', 'Energy', 'Education', 'Government'],
			mecanismoTeorico:
				'A copilot requires step-by-step human supervision; an autonomous agent executes K-step chains but accumulates compound failure probability (1 − p^K). Replacement occurs only when saved supervision exceeds expected loss from undetected tail errors.',
			criterioRefutacion:
				'Falsified if between 2031 and 2036 over 60% of structured workflows in computational science, education and public administration still require step-by-step human intervention despite automated verifiers exceeding 95% error detection.',
			hallazgoPrincipal:
				'Across our 5-sector simulation (3,300 rows), science, education and public administration cross into autonomous infrastructure in 2028–2029 under baseline co-evolution, whereas health admin (2033) and grid dispatch (2034) require dedicated verification infrastructure to cross by 2030–2031.',
		},
	},
	{
		id: 'H2',
		horizonte: '2026–2036',
		evidencia: 'emergente',
		temas: ['gobernanza', 'ia', 'riesgo', 'poder', 'computo'],
		paperClave: 'wp-coordinacion-multiagente',
		paperSlug: {
			es: 'superinteligencia-como-coordinacion',
			en: 'superintelligence-as-coordination',
		},
		experimentoId: 'h2-coordinacion-multiagente',
		rutaCodigo: 'experiments/h2-coordinacion-multiagente',
		comandoReproduccion: 'npm run experiments:check',
		es: {
			enunciado: 'La superinteligencia no es un problema técnico sino de coordinación',
			subtitulo: 'Dinámicas multi-agente, carrera de capacidades y ley de Goodhart en benchmarks',
			subtemasNaturales: ['Multi-agente', 'Gobernanza', 'Seguridad', 'Benchmarks'],
			mecanismoTeorico:
				'Cuando múltiples agentes o laboratorios compiten por rentas de primer llegado y son evaluados mediante benchmarks estáticos imperfectos, el equilibrio estratégico erosiona los márgenes de seguridad y amplifica la optimización de proxies (Goodhart) a medida que escala la capacidad.',
			criterioRefutacion:
				'Quedaría refutada si el mero escalado técnico de modelos individuales reduce de forma monótona los incidentes sistémicos multi-agente y la divergencia entre benchmarks y despliegue real en ausencia de protocolos vinculantes de auditoría e interoperabilidad.',
			hallazgoPrincipal:
				'En el juego repetido de 8 actores (500 escenarios), escalar capacidad 25× sin coordinación eleva los incidentes sistémicos del 5,5 % al 49,2 % (8,9×) y hunde el bienestar neto; la interoperabilidad verificable reduce incidentes al 0,6 % y multiplica el excedente social.',
		},
		en: {
			enunciado: 'Superintelligence is not a technical problem, but a coordination problem',
			subtitulo: 'Multi-agent dynamics, capability racing and Goodhart distortion in benchmarks',
			subtemasNaturales: ['Multi-agent', 'Governance', 'Safety', 'Benchmarks'],
			mecanismoTeorico:
				'When multiple agents or labs compete for first-mover rents and are gated by imperfect static benchmarks, strategic equilibrium erodes safety margins and amplifies proxy gaming (Goodhart divergence) as raw capability scales.',
			criterioRefutacion:
				'Falsified if scaling raw technical capability in isolated models monotonically reduces multi-agent systemic incidents and benchmark-to-deployment divergence without binding interoperability or audit protocols.',
			hallazgoPrincipal:
				'In our 8-actor repeated game (500 scenarios), scaling raw capability 25× without coordination raises systemic incidents from 5.5% to 49.2% (8.9×) and collapses net welfare; verifiable interoperability cuts incidents to 0.6% while multiplying social surplus.',
		},
	},
	{
		id: 'H3',
		horizonte: '2026–2036',
		evidencia: 'emergente',
		temas: ['tecnologias', 'espacio', 'salud', 'planeta', 'energia'],
		paperClave: 'wp-ia-cientifica-vs-consumer',
		paperSlug: {
			es: 'ia-cientifica-frente-a-ia-consumo',
			en: 'scientific-ai-versus-consumer-ai',
		},
		experimentoId: 'h3-ia-cientifica-vs-consumer',
		rutaCodigo: 'experiments/h3-ia-cientifica-vs-consumer',
		comandoReproduccion: 'npm run experiments:check',
		es: {
			enunciado: 'La IA científica cambiará más que la IA consumer',
			subtitulo: 'Ventaja del oráculo verificable y cuellos de botella de validación física',
			subtemasNaturales: ['Descubrimiento de materiales', 'Fármacos', 'Clima', 'Física'],
			mecanismoTeorico:
				'La IA de consumo compite por un presupuesto fijo de atención humana y preferencias subjetivas; la IA científica explora espacios combinatorios acoplada a oráculos verificables (leyes de conservación, simuladores físicos, ensayos), acumulando descubrimientos no rivales limitados solo por el cuello de botella experimental (Ley de Amdahl).',
			criterioRefutacion:
				'Quedaría refutada si hacia 2035 la productividad multifactorial y el excedente económico verificable atribuibles a descubrimientos en materiales, energía, clima y biomedicina asistidos por IA resultan inferiores a los generados por asistentes y medios de consumo.',
			hallazgoPrincipal:
				'En 1.500 trayectorias (2026–2035), los dominios con oráculo físico generan entre 7,5× y 16,8× más excedente acumulado por PFLOP-día que las líneas base consumer, desplazando más del 80 % del tiempo de ciclo hacia la validación física experimental.',
		},
		en: {
			enunciado: 'Scientific AI will drive deeper structural change than consumer AI',
			subtitulo: 'The verifiable-oracle advantage and physical validation bottlenecks',
			subtemasNaturales: ['Materials discovery', 'Therapeutics', 'Climate', 'Physics'],
			mecanismoTeorico:
				'Consumer AI competes for a fixed human-attention budget under subjective preferences; scientific AI searches combinatorial spaces coupled to verifiable oracles (conservation laws, physical simulators, assays), compounding non-rival discoveries bounded mainly by physical validation throughput (Amdahl’s Law).',
			criterioRefutacion:
				'Falsified if by 2035 verifiable multifactor productivity and structural surplus attributable to AI-assisted breakthroughs in materials, energy, climate and biomedicine fall below those generated by consumer assistants and digital media.',
			hallazgoPrincipal:
				'Across 1,500 trajectories (2026–2035), domains with verifiable physical oracles generate 7.5×–16.8× higher cumulative surplus per PFLOP-day than consumer baselines, shifting over 80% of cycle time onto physical validation throughput.',
		},
	},
] as const;

export function hipotesisPorId(id: HipotesisId): Hipotesis {
	const encontrada = HIPOTESIS.find((h) => h.id === id);
	if (!encontrada) throw new Error(`Hipótesis desconocida: ${id}`);
	return encontrada;
}
