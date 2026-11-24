// Las decisiones del camino (fase G5). Contexto heredado: véase el estado de revisión en docs/research/; criterios y efectos son
// estimaciones editoriales, discutibles, y la página lo dice. R10: armas y seguridad solo como política.
import { HOY } from '../futuros/hoy';
import type { Posicion } from '../futuros/tipos';
import type { Decision } from './motor';

export const INICIO: Posicion = { paz: HOY.paz.central, frontera: HOY.frontera.central };

export const DECISIONES: readonly Decision[] = [
	{
		id: 'armas',
		anio: 2026,
		titulo: { es: '¿Negociar un tratado sobre armas autónomas?', en: 'Negotiate a treaty on autonomous weapons?' },
		contexto: {
			es: 'Tras tres años de conversaciones en la ONU, 76 países apoyan negociar normas vinculantes sobre armas autónomas. En noviembre de 2026 una conferencia decide si se negocia, se sigue hablando o se abandona.',
			en: 'After three years of UN talks, 76 countries support negotiating binding rules on autonomous weapons. In November 2026 a conference decides whether to negotiate, keep talking or give up.',
		},
		fuentes: ['hrw-armas-autonomas-2026'],
		opciones: [
			{ id: 'negociar', texto: { es: 'Abrir negociaciones para un tratado vinculante', en: 'Open negotiations for a binding treaty' }, criterios: { danio: 1, consentimiento: 1, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.06, frontera: 0 } },
			{ id: 'hablar', texto: { es: 'Seguir con conversaciones, sin mandato para negociar', en: 'Keep talking, with no mandate to negotiate' }, criterios: { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 0 }, efecto: { paz: 0, frontera: 0 } },
			{ id: 'abandonar', texto: { es: 'Dejar caer el proceso', en: 'Let the process lapse' }, criterios: { danio: -1, consentimiento: 0, reparto: 0, reversibilidad: -1 }, efecto: { paz: -0.05, frontera: 0 } },
		],
	},
	{
		id: 'chips',
		anio: 2027,
		titulo: { es: '¿Qué hacer con los chips más avanzados?', en: 'What to do with the most advanced chips?' },
		contexto: {
			es: 'Estados Unidos limita la venta a China de los chips más avanzados para IA y en enero de 2026 permitió algunos modelos con cupos. Los controles frenan a un rival, pero alimentan la desconfianza.',
			en: 'The United States restricts sales of the most advanced AI chips to China and in January 2026 allowed some models under quotas. Controls slow a rival, but they feed mistrust.',
		},
		fuentes: ['cfr-chips-2026'],
		opciones: [
			{ id: 'verificar', texto: { es: 'Negociar entre potencias un acuerdo para verificar el cómputo', en: 'Negotiate a compute-verification deal between powers' }, criterios: { danio: 1, consentimiento: 1, reparto: 0, reversibilidad: 0 }, efecto: { paz: 0.08, frontera: -0.03 } },
			{ id: 'endurecer', texto: { es: 'Endurecer los controles de exportación', en: 'Tighten export controls' }, criterios: { danio: 0, consentimiento: -1, reparto: -1, reversibilidad: 1 }, efecto: { paz: -0.04, frontera: -0.05 } },
			{ id: 'vender', texto: { es: 'Vender sin límites a quien pague', en: 'Sell without limits to whoever pays' }, criterios: { danio: -1, consentimiento: 0, reparto: 1, reversibilidad: -1 }, efecto: { paz: 0, frontera: 0.03 } },
		],
	},
	{
		id: 'alto-riesgo',
		anio: 2027,
		titulo: { es: '¿Aplicar las reglas europeas de alto riesgo?', en: 'Apply the European high-risk rules?' },
		contexto: {
			es: 'La UE aplazó a diciembre de 2027 las obligaciones de su Ley de IA para los sistemas de alto riesgo, como los que se usan en el empleo, la educación o las fronteras. Llegada la fecha, puede aplicarlas, aplazarlas otra vez o rebajarlas.',
			en: 'The EU postponed to December 2027 its AI Act obligations for high-risk systems, such as those used in employment, education or borders. When the date comes, it can apply them, postpone them again or water them down.',
		},
		fuentes: ['ue-ley-ia'],
		opciones: [
			{ id: 'aplicar', texto: { es: 'Aplicarlas en la fecha prevista', en: 'Apply them on schedule' }, criterios: { danio: 1, consentimiento: 1, reparto: 1, reversibilidad: 0 }, efecto: { paz: 0.04, frontera: -0.02 } },
			{ id: 'aplazar', texto: { es: 'Aplazarlas otra vez', en: 'Postpone them again' }, criterios: { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 0 }, efecto: { paz: 0, frontera: 0 } },
			{ id: 'rebajar', texto: { es: 'Rebajarlas para competir con Estados Unidos y China', en: 'Water them down to compete with the US and China' }, criterios: { danio: -1, consentimiento: 0, reparto: -1, reversibilidad: 0 }, efecto: { paz: -0.03, frontera: 0.02 } },
		],
	},
	{
		id: 'ley-frontera',
		anio: 2028,
		titulo: { es: '¿Una ley nacional para la IA de frontera en Estados Unidos?', en: 'A national law for frontier AI in the United States?' },
		contexto: {
			es: 'California obliga desde 2026 a los desarrolladores de frontera a publicar sus marcos de seguridad y a informar de incidentes graves. Una orden ejecutiva federal de 2025 busca anular las leyes estatales y fijar un marco nacional mínimo.',
			en: 'Since 2026 California has required frontier developers to publish their safety frameworks and report serious incidents. A 2025 federal executive order seeks to override state laws and set a minimal national framework.',
		},
		fuentes: ['california-sb53', 'eeuu-orden-14365'],
		opciones: [
			{ id: 'ley', texto: { es: 'Una ley nacional con informes de seguridad y de incidentes', en: 'A national law with safety and incident reports' }, criterios: { danio: 1, consentimiento: 1, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.06, frontera: -0.03 } },
			{ id: 'voluntario', texto: { es: 'Dejarlo en compromisos voluntarios de las empresas', en: 'Leave it to voluntary company commitments' }, criterios: { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 0 }, efecto: { paz: -0.01, frontera: 0 } },
			{ id: 'anular', texto: { es: 'Anular las leyes estatales sin poner otra en su lugar', en: 'Override state laws without replacing them' }, criterios: { danio: -1, consentimiento: -1, reparto: 0, reversibilidad: -1 }, efecto: { paz: -0.05, frontera: 0.02 } },
		],
	},
	{
		id: 'licencias',
		anio: 2029,
		titulo: { es: '¿Licencias para entrenar los modelos más grandes?', en: 'Licences to train the largest models?' },
		contexto: {
			es: 'La Ley de IA europea impone obligaciones a los modelos de propósito general desde 2025. Una licencia, como en la aviación o los medicamentos, exigiría pruebas antes de entrenar y de publicar un modelo.',
			en: 'The European AI Act has imposed obligations on general-purpose models since 2025. A licence, as in aviation or medicines, would require tests before training and releasing a model.',
		},
		fuentes: ['ue-ley-ia'],
		opciones: [
			{ id: 'licencia', texto: { es: 'Licencia con auditorías externas', en: 'A licence with external audits' }, criterios: { danio: 1, consentimiento: 1, reparto: -1, reversibilidad: 1 }, efecto: { paz: 0.06, frontera: -0.1 } },
			{ id: 'registro', texto: { es: 'Solo un registro público de los grandes entrenamientos', en: 'Only a public register of large training runs' }, criterios: { danio: 0, consentimiento: 1, reparto: 0, reversibilidad: 0 }, efecto: { paz: 0.03, frontera: -0.02 } },
			{ id: 'nada', texto: { es: 'Nada: que decida cada empresa', en: 'Nothing: each company decides' }, criterios: { danio: -1, consentimiento: 0, reparto: 0, reversibilidad: -1 }, efecto: { paz: -0.02, frontera: 0.02 } },
		],
	},
	{
		id: 'energia',
		anio: 2030,
		titulo: { es: '¿Con qué energía crecen los centros de datos?', en: 'What energy do data centres grow on?' },
		contexto: {
			es: 'La AIE estima que los centros de datos usaron unos 415 TWh en 2024, cerca del 1,5 % de la electricidad mundial, y que en su escenario base llegarán a unos 945 TWh en 2030.',
			en: 'The IEA estimates that data centres used about 415 TWh in 2024, around 1.5% of the world’s electricity, and that in its base case they will reach about 945 TWh in 2030.',
		},
		fuentes: ['aie-energia-ia'],
		opciones: [
			{ id: 'limpia', texto: { es: 'Exigir que cada centro nuevo aporte su propia energía limpia', en: 'Require every new centre to bring its own clean energy' }, criterios: { danio: 1, consentimiento: 0, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.03, frontera: -0.05 } },
			{ id: 'limitar', texto: { es: 'Limitar su electricidad hasta que la red esté preparada', en: 'Cap their electricity until the grid is ready' }, criterios: { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.02, frontera: -0.1 } },
			{ id: 'mercado', texto: { es: 'Que el mercado elija, con gas si hace falta', en: 'Let the market choose, with gas if needed' }, criterios: { danio: -1, consentimiento: 0, reparto: 0, reversibilidad: -1 }, efecto: { paz: 0, frontera: 0.02 } },
		],
	},
	{
		id: 'agencia',
		anio: 2031,
		titulo: { es: '¿Una agencia internacional que verifique la IA?', en: 'An international agency that verifies AI?' },
		contexto: {
			es: 'La ONU creó en 2025 un panel científico y un diálogo anual sobre la IA, que informan pero no verifican. Una agencia como la de la energía atómica inspeccionaría los grandes centros de datos.',
			en: 'In 2025 the UN created a scientific panel and an annual dialogue on AI, which inform but do not verify. An agency like the atomic energy agency would inspect large data centres.',
		},
		fuentes: ['onu-panel-ia', 'onu-dialogo-ia'],
		opciones: [
			{ id: 'agencia', texto: { es: 'Crear la agencia, con inspecciones', en: 'Create the agency, with inspections' }, criterios: { danio: 1, consentimiento: 1, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.1, frontera: -0.06 } },
			{ id: 'panel', texto: { es: 'Seguir solo con el panel científico', en: 'Keep only the scientific panel' }, criterios: { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 0 }, efecto: { paz: 0, frontera: 0 } },
			{ id: 'bloques', texto: { es: 'Que cada bloque se vigile a sí mismo', en: 'Each bloc monitors itself' }, criterios: { danio: -1, consentimiento: 0, reparto: -1, reversibilidad: 0 }, efecto: { paz: -0.06, frontera: 0 } },
		],
	},
	{
		id: 'suministro',
		anio: 2032,
		titulo: { es: 'Si una crisis corta el suministro de chips, ¿cómo se responde?', en: 'If a crisis cuts the chip supply, how do we respond?' },
		contexto: {
			es: 'Más del 90 % de los chips más avanzados se fabrica en Taiwán. Esta decisión es una hipótesis: qué hacer si una crisis interrumpe ese suministro durante años.',
			en: 'More than 90% of the most advanced chips are made in Taiwan. This decision is a hypothesis: what to do if a crisis cuts that supply for years.',
		},
		fuentes: ['cfr-taiwan-2024'],
		opciones: [
			{ id: 'juntos', texto: { es: 'Reconstruirlo entre bloques, con reglas compartidas', en: 'Rebuild it across blocs, with shared rules' }, criterios: { danio: 1, consentimiento: 1, reparto: 1, reversibilidad: 0 }, efecto: { paz: 0.08, frontera: -0.1 } },
			{ id: 'cada-bloque', texto: { es: 'Que cada bloque fabrique sus propios chips', en: 'Each bloc makes its own chips' }, criterios: { danio: 0, consentimiento: 0, reparto: -1, reversibilidad: 0 }, efecto: { paz: -0.06, frontera: -0.2 } },
			{ id: 'escalar', texto: { es: 'Responder con sanciones y presión militar', en: 'Respond with sanctions and military pressure' }, criterios: { danio: -1, consentimiento: -1, reparto: -1, reversibilidad: -1 }, efecto: { paz: -0.12, frontera: -0.25 } },
		],
	},
	{
		id: 'empleo',
		anio: 2033,
		titulo: { es: '¿Quién paga la transición del trabajo?', en: 'Who pays for the transition at work?' },
		contexto: {
			es: 'Un estudio de 2023 estimó que, en Estados Unidos, alrededor del 80 % de los trabajadores podría ver afectado al menos el 10 % de sus tareas por los modelos de lenguaje, y un 19 %, al menos la mitad.',
			en: 'A 2023 study estimated that in the United States around 80% of workers could have at least 10% of their tasks affected by language models, and 19% at least half.',
		},
		fuentes: ['eloundou-2023'],
		opciones: [
			{ id: 'fondo', texto: { es: 'Un fondo de transición pagado con impuestos a la automatización', en: 'A transition fund paid for by taxes on automation' }, criterios: { danio: 1, consentimiento: 0, reparto: 1, reversibilidad: 0 }, efecto: { paz: 0.04, frontera: -0.01 } },
			{ id: 'proteger', texto: { es: 'Prohibir automatizar ciertos empleos', en: 'Ban automating certain jobs' }, criterios: { danio: 0, consentimiento: -1, reparto: 1, reversibilidad: 0 }, efecto: { paz: 0.02, frontera: -0.05 } },
			{ id: 'adaptarse', texto: { es: 'Que cada persona se adapte por su cuenta', en: 'Everyone adapts on their own' }, criterios: { danio: -1, consentimiento: 0, reparto: -1, reversibilidad: 0 }, efecto: { paz: -0.03, frontera: 0 } },
		],
	},
	{
		id: 'pesos',
		anio: 2035,
		titulo: { es: '¿Publicar los pesos de los modelos más capaces?', en: 'Release the weights of the most capable models?' },
		contexto: {
			es: 'Publicar los pesos de un modelo deja que cualquiera lo estudie, lo adapte y lo use, y reparte el control del mercado. También impide retirarlo si aparece un uso dañino. En 2024 el Gobierno de Estados Unidos recomendó vigilar los riesgos sin restringirlos todavía.',
			en: 'Releasing a model’s weights lets anyone study, adapt and use it, and spreads market control. It also makes it impossible to withdraw if a harmful use appears. In 2024 the US government recommended monitoring the risks without restricting them yet.',
		},
		fuentes: ['ntia-pesos-2024'],
		opciones: [
			{ id: 'por-etapas', texto: { es: 'Publicar por etapas, tras evaluaciones independientes', en: 'Release in stages, after independent evaluations' }, criterios: { danio: 1, consentimiento: 0, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.03, frontera: -0.02 } },
			{ id: 'abiertos', texto: { es: 'Publicarlos todos, sin condiciones', en: 'Release them all, unconditionally' }, criterios: { danio: -1, consentimiento: 0, reparto: 1, reversibilidad: -1 }, efecto: { paz: -0.02, frontera: 0.04 } },
			{ id: 'cerrados', texto: { es: 'Mantenerlos cerrados en pocas empresas', en: 'Keep them closed within a few companies' }, criterios: { danio: 1, consentimiento: 0, reparto: -1, reversibilidad: 0 }, efecto: { paz: -0.01, frontera: 0 } },
		],
	},
	{
		id: 'linea-roja',
		anio: 2037,
		titulo: { es: '¿Qué pasa si un modelo cruza una línea roja?', en: 'What if a model crosses a red line?' },
		contexto: {
			es: 'En 2024, empresas de IA firmaron en Seúl compromisos voluntarios para no desarrollar ni desplegar modelos cuyos riesgos graves no puedan mitigar. Hacerlos obligatorios supondría poder pausar un desarrollo.',
			en: 'In 2024, AI companies signed voluntary commitments in Seoul not to develop or deploy models whose severe risks they cannot mitigate. Making them mandatory would mean being able to pause a development.',
		},
		fuentes: ['seul-compromisos-2024'],
		opciones: [
			{ id: 'pausa', texto: { es: 'Pausa obligatoria y verificada hasta mitigar el riesgo', en: 'A mandatory, verified pause until the risk is mitigated' }, criterios: { danio: 1, consentimiento: 1, reparto: 0, reversibilidad: 1 }, efecto: { paz: 0.08, frontera: -0.15 } },
			{ id: 'voluntaria', texto: { es: 'Mantener los compromisos voluntarios', en: 'Keep the voluntary commitments' }, criterios: { danio: 0, consentimiento: 0, reparto: 0, reversibilidad: 0 }, efecto: { paz: 0, frontera: -0.02 } },
			{ id: 'seguir', texto: { es: 'Seguir: si paramos, otro llegará antes', en: 'Keep going: if we stop, someone else gets there first' }, criterios: { danio: -1, consentimiento: -1, reparto: 0, reversibilidad: -1 }, efecto: { paz: -0.06, frontera: 0.03 } },
		],
	},
];
