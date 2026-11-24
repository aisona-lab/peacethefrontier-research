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
			'Portafolio de investigación de Carlos Nicolás Soto: hipótesis falsables, modelos matemáticos, experimentos reproducibles con código en GitHub y niveles explícitos de evidencia.',
		intro: {
			research:
				'Programa de investigación original sobre transición de copilotos a agentes autónomos (H1), coordinación multi-agente (H2) e IA científica con oráculos verificables (H3), acompañado de código público y series descargables.',
			sim: 'Modelos computacionales deterministas para contrastar umbrales de delegación, juegos multi-agente, embudos científicos y continuidad de servicio. Todos los registros declaran semillas, unidades y condición sintética.',
			open: 'Catálogo completo de código fuente (Apache-2.0), datasets sintéticos (CC BY 4.0), esquemas JSON y sumas SHA-256 para inspeccionar y reproducir cada investigación localmente.',
		},
		areas: 'Ecosistema conectado del portafolio',
		entrar: 'Explorar',
		papeles: 'Investigaciones originales y working papers (PTF-WP)',
		borrador: 'Borrador versionado · revisión editorial final pendiente',
		sinPapers: 'Los primeros documentos están en preparación editorial.',
		metodo: 'Metodología: de la hipótesis falsable al nivel de evidencia',
		metodoTexto:
			'Cada investigación formula una hipótesis acotada con criterio explícito de refutación, implementa su modelo formal en experiments/, verifica determinismo y hashes SHA-256 y gradúa sus conclusiones según la escala de evidencia del estudio.',
		director: 'Autoría y dirección científica',
		directorTexto:
			'dirige y desarrolla este portafolio de investigación independiente. El código fuente, la asistencia de herramientas de IA, los límites de cada modelo y el historial de versiones son públicos y auditables.',
		contacto: 'Contacto y colaboración científica',
		contactoTexto:
			'Plantea una revisión técnica, señala una corrección o propón una colaboración de investigación a través del repositorio público.',
		contactoAccion: 'Abrir consulta en GitHub',
		metodologia: 'Leer protocolo metodológico completo',
		sobre: 'Sobre el autor y la tesis central',
		catalogo: 'Artefactos disponibles',
		hfPendiente: 'Publicación espejo en Hugging Face: pendiente de perfil confirmado.',
		hf: 'Perfil en Hugging Face',
		codigo: 'Repositorio principal limpio en GitHub',
		licencias: 'Licencias y alcance por artefacto',
		licenciasTexto:
			'El código de los simuladores en experiments/ y resilience.ts se publica bajo Apache-2.0; los datasets sintéticos generados, sus esquemas y manifiestos se distribuyen bajo CC BY 4.0. Las fuentes externas conservan sus licencias originales.',
		defensa: 'Alcance experimental y política R10',
		defensaTexto:
			'Todos los experimentos modelan mecanismos abstractos de delegación, coordinación, embudos de descubrimiento y resiliencia defensiva. Ningún módulo reproduce sistemas reales ni contiene procedimientos ofensivos o protocolos biológicos.',
		sintetico: 'Datos sintéticos',
		modelo: 'Modelo abstracto',
		reproducir: 'Reproducibilidad, código y sumas SHA-256',
		sinDatos: 'El experimento está en preparación.',
		tarjetas: {
			atlas: 'El atlas contextual por escalas: 17 temas, evidencia graduada y cuatro futuros condicionales.',
			research: 'Programa de tres hipótesis falsables y cinco working papers con código y datos vinculados.',
			sim: 'Cuatro entornos de simulación deterministas sobre delegación, coordinación, ciencia y resiliencia.',
			open: 'Descarga directa de CSV, esquemas JSON, código TypeScript, licencias y manifiestos SHA-256.',
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
			'Research portfolio of Carlos Nicolás Soto: falsifiable hypotheses, mathematical models, reproducible experiments linked to GitHub code and explicit evidence levels.',
		intro: {
			research:
				'Original research programme testing copilot-to-agent delegation thresholds (H1), multi-agent coordination (H2) and verifiable-oracle scientific AI (H3), paired with public code and downloadable datasets.',
			sim: 'Deterministic computational models testing delegation economics, multi-agent games, scientific discovery funnels and service continuity. Every record declares seeds, units and synthetic status.',
			open: 'Complete catalogue of source code (Apache-2.0), synthetic datasets (CC BY 4.0), JSON schemas and SHA-256 checksums to inspect and reproduce every paper locally.',
		},
		areas: 'Connected portfolio ecosystem',
		entrar: 'Explore',
		papeles: 'Original investigations and working papers (PTF-WP)',
		borrador: 'Versioned draft · final human sign-off pending',
		sinPapers: 'The first documents are in editorial preparation.',
		metodo: 'Methodology: from falsifiable hypothesis to evidence grade',
		metodoTexto:
			'Every investigation states a bounded hypothesis with an explicit refutation criterion, implements its formal model in experiments/, verifies determinism and SHA-256 checksums, and grades conclusions on our four-tier evidence scale.',
		director: 'Authorship and scientific direction',
		directorTexto:
			'leads and builds this independent research portfolio. Source code, AI tool assistance, model limitations and version histories remain public and auditable.',
		contacto: 'Contact and research collaboration',
		contactoTexto:
			'Open a methodological review, flag a correction or propose a research collaboration through the public repository.',
		contactoAccion: 'Open inquiry on GitHub',
		metodologia: 'Read full methodological protocol',
		sobre: 'About the author and central thesis',
		catalogo: 'Available artifacts',
		hfPendiente: 'Hugging Face mirror publication: awaiting a confirmed profile.',
		hf: 'Hugging Face profile',
		codigo: 'Clean main repository on GitHub',
		licencias: 'Per-artifact licences and scope',
		licenciasTexto:
			'Simulator code in experiments/ and resilience.ts is licensed under Apache-2.0; generated synthetic datasets, schemas and manifests are distributed under CC BY 4.0. External sources retain their original terms.',
		defensa: 'Experimental scope and R10 policy',
		defensaTexto:
			'All experiments model abstract delegation, coordination, discovery-funnel and defensive resilience mechanisms. No module reproduces real infrastructure or provides offensive or biological protocols.',
		sintetico: 'Synthetic data',
		modelo: 'Abstract model',
		reproducir: 'Reproducibility, code and SHA-256 checksums',
		sinDatos: 'The experiment is in preparation.',
		tarjetas: {
			atlas: 'The contextual atlas by scale: 17 topics, graded evidence and four conditional futures.',
			research: 'Three falsifiable hypotheses and five working papers with linked code and datasets.',
			sim: 'Four deterministic simulation suites covering delegation, coordination, science and resilience.',
			open: 'Direct downloads for CSVs, JSON schemas, TypeScript models, licences and SHA-256 manifests.',
		},
	},
} as const;

export const textosStudio = (lang: Idioma) => STUDIO[lang];
