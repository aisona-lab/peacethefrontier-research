import type { Idioma } from '../../i18n/rutas';

export const STUDIO = {
	es: {
		titulos: {
			studio: 'Agentes autónomos como infraestructura de la próxima década',
			research: 'Investigación original y working papers',
			sim: 'Simulaciones reproducibles y modelos agénticos',
			open: 'Ciencia abierta, código y datasets verificados',
		},
		descripcion:
			'Portafolio de investigación de Carlos Nicolás Soto: hipótesis falsables en estado de escenario (v0.x), explorable interactivo de H1, protocolo empírico abierto y código verificable en GitHub.',
		intro: {
			research:
				'Programa de tres hipótesis falsables arrancando como escenarios simulados (v0.2.0). Foco activo único en H1 (explorable interactivo + calibración empírica real); H2 y H3 permanecen congeladas hasta cerrar la revisión externa de H1.',
			sim: 'Modelos computacionales deterministas con parámetros explícitos para explorar umbrales de delegación, coordinación multi-agente y embudos científicos. Todos los registros declaran semillas, unidades y condición sintética (no observada).',
			open: 'Catálogo completo de código fuente (Apache-2.0), datasets sintéticos (CC BY 4.0), notebook de Google Colab, protocolo empírico pre-registrado y sumas SHA-256 para reproducir cada paso localmente.',
		},
		areas: 'Ecosistema conectado del portafolio',
		entrar: 'Explorar',
		papeles: 'Investigaciones originales y working papers (PTF-WP)',
		borrador: 'Borrador versionado v0.x · simulación sin calibración empírica ni revisión externa',
		sinPapers: 'Los primeros documentos están en preparación editorial.',
		metodo: 'Metodología: separar simulaciones propias de datos observados',
		metodoTexto:
			'Cada hipótesis se publica primero como Escenario (v0.x) con código y sliders abiertos para poner a prueba sus supuestos. Ningún paper sube a v1.0 sin calibración con datos reales observados y al menos dos críticas técnicas externas publicadas.',
		director: 'Autoría, independencia y conflicto de interés',
		directorTexto:
			'dirige este portafolio de investigación y construye productos con agentes autónomos en aisona-lab (conflicto de interés declarado explícitamente). Todo el código, el historial de predicciones, los límites de los modelos y las futuras críticas externas son públicos.',
		contacto: 'Revisión técnica y colaboración científica',
		contactoTexto:
			'Cuanto más crítica sea la revisión, mejor: abre un issue para señalar fallos en los supuestos de H1, proponer datos reales o discutir el protocolo empírico.',
		contactoAccion: 'Abrir revisión crítica en GitHub',
		metodologia: 'Leer protocolo metodológico completo',
		sobre: 'Sobre el autor y conflicto de interés',
		catalogo: 'Artefactos disponibles',
		hfPendiente: 'Publicación espejo en Hugging Face: pendiente de perfil confirmado.',
		hf: 'Perfil en Hugging Face',
		codigo: 'Repositorio principal limpio en GitHub',
		licencias: 'Licencias y alcance por artefacto',
		licenciasTexto:
			'El código de los simuladores en experiments/ y resilience.ts se publica bajo Apache-2.0; los datasets sintéticos y futuros datasets observacionales, sus esquemas y manifiestos se distribuyen bajo CC BY 4.0. Las fuentes externas conservan sus licencias originales.',
		defensa: 'Alcance experimental y política R10',
		defensaTexto:
			'Todos los experimentos modelan mecanismos abstractos de delegación, coordinación, embudos de descubrimiento y resiliencia defensiva. Ningún módulo reproduce sistemas reales ni contiene procedimientos ofensivos o protocolos biológicos.',
		sintetico: 'Datos sintéticos',
		modelo: 'Modelo abstracto',
		reproducir: 'Reproducibilidad, código y sumas SHA-256',
		sinDatos: 'El experimento está en preparación.',
		tarjetas: {
			atlas: 'El atlas contextual por escalas: 17 temas, evidencia graduada y cuatro futuros condicionales (congelado durante la fase empírica de H1).',
			research: 'Tres hipótesis falsables (H1 activa con explorable; H2 y H3 congeladas como escenarios v0.2.0) y panel de datos reales.',
			sim: 'Modelos deterministas y mapa de sensibilidad interactivo sobre delegación, coordinación, ciencia y resiliencia.',
			open: 'Descarga directa de CSV, notebook de Colab, protocolo empírico, esquemas JSON y manifiestos SHA-256.',
		},
	},
	en: {
		titulos: {
			studio: 'Autonomous agents as the infrastructure of the next decade',
			research: 'Original research and working papers',
			sim: 'Reproducible simulations and agentic models',
			open: 'Open science, public code and verified datasets',
		},
		descripcion:
			'Research portfolio of Carlos Nicolás Soto: falsifiable hypotheses classified as v0.x scenarios, interactive H1 explorable, pre-registered empirical protocol and reproducible GitHub code.',
		intro: {
			research:
				'Three falsifiable hypotheses starting as simulated scenarios (v0.2.0). Sole active focus on H1 (interactive explorable + real empirical calibration); H2 and H3 remain frozen until H1 completes external review.',
			sim: 'Deterministic computational models with explicit parameters to probe delegation thresholds, multi-agent coordination and scientific funnels. Every record declares seeds, units and synthetic (unobserved) status.',
			open: 'Complete catalogue of source code (Apache-2.0), synthetic datasets (CC BY 4.0), Google Colab notebook, pre-registered empirical protocol and SHA-256 checksums for local reproduction.',
		},
		areas: 'Connected portfolio ecosystem',
		entrar: 'Explore',
		papeles: 'Original investigations and working papers (PTF-WP)',
		borrador: 'Versioned v0.x draft · simulation pending empirical calibration and external review',
		sinPapers: 'The first documents are in editorial preparation.',
		metodo: 'Methodology: separating synthetic simulations from observed data',
		metodoTexto:
			'Every hypothesis starts as a Scenario (v0.x) with public code and interactive sliders so any reader can break the assumptions. No paper promotes to v1.0 without real observed data calibration and at least two published external technical critiques.',
		director: 'Authorship, independence and conflict of interest',
		directorTexto:
			'leads this research portfolio and builds products with autonomous agents at aisona-lab (explicitly disclosed conflict of interest). All source code, the public predictions ledger, model limits and external critiques remain open.',
		contacto: 'Technical critique and research collaboration',
		contactoTexto:
			'Critical feedback is the most valuable input: open an issue to challenge H1 assumptions, contribute real measurements or critique the empirical protocol.',
		contactoAccion: 'Submit technical critique on GitHub',
		metodologia: 'Read full methodological protocol',
		sobre: 'About the author and conflict of interest',
		catalogo: 'Available artifacts',
		hfPendiente: 'Hugging Face mirror publication: awaiting a confirmed profile.',
		hf: 'Hugging Face profile',
		codigo: 'Clean main repository on GitHub',
		licencias: 'Per-artifact licences and scope',
		licenciasTexto:
			'Simulator code in experiments/ and resilience.ts is licensed under Apache-2.0; synthetic and future observational datasets, schemas and manifests are distributed under CC BY 4.0. External sources retain their original terms.',
		defensa: 'Experimental scope and R10 policy',
		defensaTexto:
			'All experiments model abstract delegation, coordination, discovery-funnel and defensive resilience mechanisms. No module reproduces real infrastructure or provides offensive or biological protocols.',
		sintetico: 'Synthetic data',
		modelo: 'Abstract model',
		reproducir: 'Reproducibility, code and SHA-256 checksums',
		sinDatos: 'The experiment is in preparation.',
		tarjetas: {
			atlas: 'The contextual atlas by scale: 17 topics, graded evidence and four conditional futures (frozen during H1 empirical phase).',
			research: 'Three falsifiable hypotheses (H1 active with explorable; H2 and H3 frozen as v0.2.0 scenarios) plus observed data panel.',
			sim: 'Deterministic models and interactive sensitivity map covering delegation, coordination, science and resilience.',
			open: 'Direct downloads for CSVs, Colab notebook, empirical protocol, JSON schemas and SHA-256 manifests.',
		},
	},
} as const;

export const textosStudio = (lang: Idioma) => STUDIO[lang];
