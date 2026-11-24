// Eventos de la línea del tiempo (spec R4). Fechas históricas heredadas; el estado de nueva verificación está en docs/research/.
// R10: armas solo como historia y política.
import type { Idioma } from '../../i18n/rutas';
import type { NivelId } from '../evidencia';
import { proyectarGuardado } from '../futuros/montecarlo';
import { presetDe, type CuadranteId } from '../futuros/posicion';
import type { Evento as EventoModelo } from '../futuros/tipos';

export interface Evento {
	id: string;
	/** Negativo = antes de Cristo. Posición en la línea y orden. */
	anio: number;
	/** "c." delante del año. */
	aprox?: boolean;
	/** Sustituye al año cuando la fecha es un periodo ("siglo III a. C."). */
	fecha?: Record<Idioma, string>;
	tipo: 'hito' | 'perdido' | 'recuperado';
	/** El otro extremo de un par perdido ↔ recuperado. */
	par?: string;
	titulo: Record<Idioma, string>;
	resumen: Record<Idioma, string>;
	/** Ids de src/content/temas.yaml. */
	temas: readonly string[];
	evidencia: NivelId;
	/** Ids de src/content/fuentes.yaml. */
	fuentes: readonly string[];
}

export function textoAnio(e: Pick<Evento, 'anio' | 'aprox' | 'fecha'>, lang: Idioma): string {
	if (e.fecha) return e.fecha[lang];
	const anio = e.anio < 0 ? `${-e.anio} ${lang === 'es' ? 'a. C.' : 'BCE'}` : String(e.anio);
	return e.aprox ? `c. ${anio}` : anio;
}

export const EVENTOS: readonly Evento[] = [
	{
		id: 'escritura',
		anio: -3200,
		aprox: true,
		tipo: 'hito',
		titulo: { es: 'La escritura', en: 'Writing' },
		resumen: {
			es: 'Escribas sumerios de Uruk, en el actual Irak, desarrollan la escritura cuneiforme para registrar transacciones.',
			en: 'Sumerian scribes in Uruk, in present-day Iraq, develop cuneiform writing to record transactions.',
		},
		temas: ['informacion', 'conocimiento-antiguo'],
		evidencia: 'consenso',
		fuentes: ['archaeology-escritura-2016'],
	},
	{
		id: 'aristarco',
		anio: -250,
		fecha: { es: 'siglo III a. C.', en: '3rd century BCE' },
		tipo: 'perdido',
		par: 'copernico',
		titulo: { es: 'Aristarco pone el Sol en el centro', en: 'Aristarchus puts the Sun at the centre' },
		resumen: {
			es: 'Según Arquímedes, Aristarco de Samos propuso que la Tierra gira cada día sobre sí misma y da vueltas alrededor del Sol. La idea quedó al margen durante casi dos mil años.',
			en: 'According to Archimedes, Aristarchus of Samos proposed that the Earth rotates daily and revolves around the Sun. The idea was sidelined for almost two thousand years.',
		},
		temas: ['espacio', 'conocimiento-antiguo'],
		evidencia: 'consenso',
		fuentes: ['sep-copernico'],
	},
	{
		id: 'anticitera',
		anio: -100,
		fecha: { es: 'finales del siglo II a. C.', en: 'late 2nd century BCE' },
		tipo: 'perdido',
		par: 'anticitera-descifrado',
		titulo: { es: 'El mecanismo de Anticitera', en: 'The Antikythera Mechanism' },
		resumen: {
			es: 'Un aparato griego de engranajes calcula y muestra ciclos astronómicos, como las fases de la Luna. No se conoce nada tan complejo durante al menos un milenio. Se pierde en un naufragio.',
			en: 'A Greek geared device calculates and displays astronomical cycles, such as the phases of the Moon. Nothing as complex is known for at least a millennium. It is lost in a shipwreck.',
		},
		temas: ['tecnologias', 'conocimiento-antiguo', 'espacio'],
		evidencia: 'consenso',
		fuentes: ['freeth-2006'],
	},
	{
		id: 'herculano',
		anio: 79,
		tipo: 'perdido',
		par: 'herculano-leido',
		titulo: { es: 'El Vesubio sepulta una biblioteca', en: 'Vesuvius buries a library' },
		resumen: {
			es: 'La erupción del Vesubio entierra en Herculano una biblioteca de rollos de papiro, carbonizados y sin poder abrirse.',
			en: 'The eruption of Vesuvius buries a library of papyrus scrolls in Herculaneum, carbonised and impossible to open.',
		},
		temas: ['conocimiento-antiguo', 'informacion'],
		evidencia: 'consenso',
		fuentes: ['vesuvius-2024'],
	},
	{
		id: 'hormigon-romano',
		anio: 128,
		tipo: 'perdido',
		par: 'hormigon-descifrado',
		titulo: { es: 'El hormigón romano', en: 'Roman concrete' },
		resumen: {
			es: 'Se dedica el Panteón de Roma, con la mayor cúpula de hormigón sin armar del mundo. Cómo hacían los romanos un hormigón que dura milenios se convirtió en un enigma.',
			en: 'Rome’s Pantheon, with the world’s largest unreinforced concrete dome, is dedicated. How the Romans made concrete that lasts for millennia became a riddle.',
		},
		temas: ['tecnologias', 'conocimiento-antiguo'],
		evidencia: 'consenso',
		fuentes: ['mit-hormigon-2023'],
	},
	{
		id: 'arquimedes-raspado',
		anio: 1229,
		tipo: 'perdido',
		par: 'arquimedes-leido',
		titulo: { es: 'Arquímedes, bajo un libro de oraciones', en: 'Archimedes, under a prayer book' },
		resumen: {
			es: 'Un manuscrito del siglo X con tratados de Arquímedes se raspa y se reutiliza para un libro de oraciones, terminado en 1229. Contiene El método, del que no existe ninguna otra copia.',
			en: 'A 10th-century manuscript of treatises by Archimedes is scraped and reused for a prayer book, finished in 1229. It contains The Method, of which no other copy exists.',
		},
		temas: ['conocimiento-antiguo', 'informacion'],
		evidencia: 'consenso',
		fuentes: ['palimpsesto-arquimedes'],
	},
	{
		id: 'copernico',
		anio: 1543,
		tipo: 'recuperado',
		par: 'aristarco',
		titulo: { es: 'Copérnico', en: 'Copernicus' },
		resumen: {
			es: 'Copérnico publica De revolutionibus, que pone el Sol en el centro: la idea que Arquímedes atribuía a Aristarco.',
			en: 'Copernicus publishes De revolutionibus, which puts the Sun at the centre: the idea Archimedes attributed to Aristarchus.',
		},
		temas: ['espacio'],
		evidencia: 'consenso',
		fuentes: ['sep-copernico'],
	},
	{
		id: 'vacuna',
		anio: 1796,
		tipo: 'hito',
		titulo: { es: 'La primera vacuna', en: 'The first vaccine' },
		resumen: {
			es: 'Edward Jenner demuestra la primera vacuna, contra la viruela, con material de la viruela bovina.',
			en: 'Edward Jenner demonstrates the first vaccine, against smallpox, using material from cowpox.',
		},
		temas: ['salud'],
		evidencia: 'consenso',
		fuentes: ['oms-viruela'],
	},
	{
		id: 'lovelace',
		anio: 1843,
		tipo: 'hito',
		titulo: { es: 'Las notas de Ada Lovelace', en: 'Ada Lovelace’s notes' },
		resumen: {
			es: 'Ada Lovelace publica sus notas sobre la máquina analítica de Babbage, con la primera descripción publicada de una secuencia de operaciones para resolver un problema con una máquina. Imagina que podría componer música.',
			en: 'Ada Lovelace publishes her notes on Babbage’s Analytical Engine, with the first published description of a sequence of operations for solving a problem with a machine. She imagines it could compose music.',
		},
		temas: ['computo', 'ia'],
		evidencia: 'consenso',
		fuentes: ['chm-lovelace'],
	},
	{
		id: 'arquimedes-leido',
		anio: 1906,
		tipo: 'recuperado',
		par: 'arquimedes-raspado',
		titulo: { es: 'Reaparece Arquímedes', en: 'Archimedes reappears' },
		resumen: {
			es: 'Johan Ludvig Heiberg descubre que el libro de oraciones contiene siete tratados de Arquímedes. Desde 1999, el palimpsesto se estudia y se fotografía en el Walters Art Museum de Baltimore.',
			en: 'Johan Ludvig Heiberg discovers that the prayer book contains seven treatises by Archimedes. Since 1999 the palimpsest has been studied and imaged at the Walters Art Museum in Baltimore.',
		},
		temas: ['conocimiento-antiguo'],
		evidencia: 'consenso',
		fuentes: ['palimpsesto-arquimedes'],
	},
	{
		id: 'penicilina',
		anio: 1928,
		tipo: 'hito',
		titulo: { es: 'La penicilina', en: 'Penicillin' },
		resumen: {
			es: 'Alexander Fleming descubre la penicilina en Londres. El primer paciente la recibe en 1941, y en 1943 ya alcanza para los ejércitos aliados.',
			en: 'Alexander Fleming discovers penicillin in London. The first patient receives it in 1941, and by 1943 there is enough for the Allied armed forces.',
		},
		temas: ['salud'],
		evidencia: 'consenso',
		fuentes: ['gaynes-2017'],
	},
	{
		id: 'trinity',
		anio: 1945,
		tipo: 'hito',
		titulo: { es: 'La primera prueba nuclear', en: 'The first nuclear test' },
		resumen: {
			es: 'Estados Unidos prueba la primera arma nuclear en el desierto de Nuevo México.',
			en: 'The United States tests the first nuclear weapon in the New Mexico desert.',
		},
		temas: ['poder', 'riesgo'],
		evidencia: 'consenso',
		fuentes: ['ahf-trinity'],
	},
	{
		id: 'turing',
		anio: 1950,
		tipo: 'hito',
		titulo: { es: 'El juego de la imitación', en: 'The imitation game' },
		resumen: {
			es: 'Alan Turing propone cambiar la pregunta «¿pueden pensar las máquinas?» por un juego: si un interrogador, solo con preguntas escritas, distingue a la máquina de la persona.',
			en: 'Alan Turing proposes replacing the question “can machines think?” with a game: whether an interrogator, using only written questions, can tell the machine from the person.',
		},
		temas: ['ia', 'mente'],
		evidencia: 'consenso',
		fuentes: ['sep-turing'],
	},
	{
		id: 'dartmouth',
		anio: 1956,
		tipo: 'hito',
		titulo: { es: 'El taller de Dartmouth', en: 'The Dartmouth workshop' },
		resumen: {
			es: 'Un taller de verano estudia la «inteligencia artificial». Su propuesta conjetura que cualquier rasgo de la inteligencia puede describirse con tanta precisión que una máquina lo simule.',
			en: 'A summer workshop studies “artificial intelligence”. Its proposal conjectures that any feature of intelligence can be described so precisely that a machine can simulate it.',
		},
		temas: ['ia'],
		evidencia: 'consenso',
		fuentes: ['dartmouth-1955'],
	},
	{
		id: 'tnp',
		anio: 1968,
		tipo: 'hito',
		titulo: { es: 'El Tratado de No Proliferación', en: 'The Non-Proliferation Treaty' },
		resumen: {
			es: 'Se abre a la firma el Tratado de No Proliferación Nuclear. Entra en vigor en 1970 y hoy tiene 191 Estados parte.',
			en: 'The Treaty on the Non-Proliferation of Nuclear Weapons opens for signature. It enters into force in 1970 and today has 191 States parties.',
		},
		temas: ['poder', 'gobernanza', 'riesgo'],
		evidencia: 'consenso',
		fuentes: ['unoda-tnp'],
	},
	{
		id: 'apolo-11',
		anio: 1969,
		tipo: 'hito',
		titulo: { es: 'Personas en la Luna', en: 'People on the Moon' },
		resumen: {
			es: 'Neil Armstrong y Buzz Aldrin caminan sobre la Luna.',
			en: 'Neil Armstrong and Buzz Aldrin walk on the Moon.',
		},
		temas: ['espacio'],
		evidencia: 'consenso',
		fuentes: ['nasa-apolo-11'],
	},
	{
		id: 'asilomar',
		anio: 1975,
		tipo: 'hito',
		titulo: { es: 'Asilomar', en: 'Asilomar' },
		resumen: {
			es: 'Científicos reunidos en Asilomar (California) acuerdan avanzar con cautela en la investigación con ADN recombinante. De ahí salen las directrices de los NIH, que adoptaron incluso empresas privadas: un precedente de autorregulación.',
			en: 'Scientists meeting at Asilomar (California) agree to proceed cautiously with recombinant DNA research. This leads to the NIH Guidelines, adopted even by private companies: a precedent for self-regulation.',
		},
		temas: ['salud', 'gobernanza'],
		evidencia: 'consenso',
		fuentes: ['berg-1975', 'imperiale-2025'],
	},
	{
		id: 'viruela-erradicada',
		anio: 1980,
		tipo: 'hito',
		titulo: { es: 'Adiós a la viruela', en: 'Farewell to smallpox' },
		resumen: {
			es: 'La OMS declara erradicada la viruela.',
			en: 'WHO declares smallpox eradicated.',
		},
		temas: ['salud'],
		evidencia: 'consenso',
		fuentes: ['oms-viruela'],
	},
	{
		id: 'montreal',
		anio: 1987,
		tipo: 'hito',
		titulo: { es: 'El Protocolo de Montreal', en: 'The Montreal Protocol' },
		resumen: {
			es: 'Se firma el Protocolo de Montreal para proteger la capa de ozono. Entra en vigor en 1989.',
			en: 'The Montreal Protocol is signed to protect the ozone layer. It enters into force in 1989.',
		},
		temas: ['planeta', 'gobernanza'],
		evidencia: 'consenso',
		fuentes: ['pnuma-montreal'],
	},
	{
		id: 'ipcc',
		anio: 1988,
		tipo: 'hito',
		titulo: { es: 'Nace el IPCC', en: 'The IPCC is born' },
		resumen: {
			es: 'El PNUMA y la Organización Meteorológica Mundial crean el IPCC para ofrecer evaluaciones científicas periódicas sobre el cambio climático.',
			en: 'UNEP and the World Meteorological Organization create the IPCC to provide regular scientific assessments of climate change.',
		},
		temas: ['planeta'],
		evidencia: 'consenso',
		fuentes: ['ipcc-historia'],
	},
	{
		id: 'web',
		anio: 1989,
		tipo: 'hito',
		titulo: { es: 'La web', en: 'The Web' },
		resumen: {
			es: 'Tim Berners-Lee inventa la World Wide Web en el CERN. En 1993, el CERN pone su software en el dominio público.',
			en: 'Tim Berners-Lee invents the World Wide Web at CERN. In 1993 CERN puts its software in the public domain.',
		},
		temas: ['informacion', 'computo'],
		evidencia: 'consenso',
		fuentes: ['cern-web'],
	},
	{
		id: 'genoma',
		anio: 2003,
		tipo: 'hito',
		titulo: { es: 'El genoma humano', en: 'The human genome' },
		resumen: {
			es: 'Concluye el Proyecto Genoma Humano, iniciado en 1990, con la primera secuencia del genoma humano.',
			en: 'The Human Genome Project, launched in 1990, is completed with the first sequence of the human genome.',
		},
		temas: ['salud'],
		evidencia: 'consenso',
		fuentes: ['nhgri-genoma'],
	},
	{
		id: 'anticitera-descifrado',
		anio: 2006,
		tipo: 'recuperado',
		par: 'anticitera',
		titulo: { es: 'Se descifra Anticitera', en: 'Antikythera decoded' },
		resumen: {
			es: 'Hallado en 1901 en un naufragio romano, el mecanismo se estudia con nuevas técnicas de imagen que aclaran qué calculaba y cómo.',
			en: 'Found in 1901 in a Roman shipwreck, the mechanism is studied with new imaging techniques that clarify what it calculated and how.',
		},
		temas: ['tecnologias', 'conocimiento-antiguo', 'espacio'],
		evidencia: 'consenso',
		fuentes: ['freeth-2006'],
	},
	{
		id: 'alexnet',
		anio: 2012,
		tipo: 'hito',
		titulo: { es: 'El aprendizaje profundo despega', en: 'Deep learning takes off' },
		resumen: {
			es: 'Una red neuronal profunda, AlexNet, clasifica las imágenes de ImageNet con mucho menos error que los métodos anteriores.',
			en: 'A deep neural network, AlexNet, classifies ImageNet images with far fewer errors than earlier methods.',
		},
		temas: ['ia', 'computo'],
		evidencia: 'consenso',
		fuentes: ['krizhevsky-2012'],
	},
	{
		id: 'paris',
		anio: 2015,
		tipo: 'hito',
		titulo: { es: 'El Acuerdo de París', en: 'The Paris Agreement' },
		resumen: {
			es: 'Se adopta el Acuerdo de París: mantener el calentamiento muy por debajo de 2 °C e intentar no pasar de 1,5 °C.',
			en: 'The Paris Agreement is adopted: keep warming well below 2 °C and pursue efforts to limit it to 1.5 °C.',
		},
		temas: ['planeta', 'gobernanza'],
		evidencia: 'consenso',
		fuentes: ['onu-paris'],
	},
	{
		id: 'transformer',
		anio: 2017,
		tipo: 'hito',
		titulo: { es: 'El Transformer', en: 'The Transformer' },
		resumen: {
			es: 'Se propone el Transformer, una red neuronal basada solo en mecanismos de atención, sin recurrencia ni convoluciones.',
			en: 'The Transformer is proposed: a neural network based solely on attention mechanisms, without recurrence or convolutions.',
		},
		temas: ['ia'],
		evidencia: 'consenso',
		fuentes: ['vaswani-2017'],
	},
	{
		id: 'alphafold',
		anio: 2021,
		tipo: 'hito',
		titulo: { es: 'AlphaFold', en: 'AlphaFold' },
		resumen: {
			es: 'AlphaFold predice con gran precisión la estructura de las proteínas, un problema abierto durante más de 50 años. En 2024, Demis Hassabis y John Jumper reciben por ello el Nobel de Química, compartido con David Baker.',
			en: 'AlphaFold predicts protein structures with high accuracy, a problem open for more than 50 years. In 2024 Demis Hassabis and John Jumper receive the Nobel Prize in Chemistry for it, shared with David Baker.',
		},
		temas: ['salud', 'ia', 'tecnologias'],
		evidencia: 'consenso',
		fuentes: ['jumper-2021', 'kva-nobel-2024'],
	},
	{
		id: 'hormigon-descifrado',
		anio: 2023,
		tipo: 'recuperado',
		par: 'hormigon-romano',
		titulo: { es: 'El secreto del hormigón romano', en: 'The secret of Roman concrete' },
		resumen: {
			es: 'Un estudio muestra que los romanos mezclaban cal viva en caliente. Los grumos de cal que quedan en el hormigón sellan sus grietas cuando entra el agua.',
			en: 'A study shows that the Romans used hot mixing with quicklime. The lime clasts left in the concrete seal its cracks when water gets in.',
		},
		temas: ['tecnologias', 'conocimiento-antiguo'],
		evidencia: 'emergente',
		fuentes: ['seymour-2023', 'mit-hormigon-2023'],
	},
	{
		id: 'herculano-leido',
		anio: 2024,
		tipo: 'recuperado',
		par: 'herculano',
		titulo: { es: 'Se lee un rollo de Herculano', en: 'A Herculaneum scroll is read' },
		resumen: {
			es: 'Con escáneres, visión artificial y aprendizaje automático, el Vesuvius Challenge lee más de 2.000 caracteres de un rollo cerrado durante 2.000 años: filosofía epicúrea sobre el placer.',
			en: 'With scans, computer vision and machine learning, the Vesuvius Challenge reads more than 2,000 characters from a scroll closed for 2,000 years: Epicurean philosophy on pleasure.',
		},
		temas: ['conocimiento-antiguo', 'ia'],
		evidencia: 'emergente',
		fuentes: ['vesuvius-2024'],
	},
	{
		id: 'ley-ia',
		anio: 2024,
		tipo: 'hito',
		titulo: { es: 'La Ley de IA europea', en: 'The European AI Act' },
		resumen: {
			es: 'Entra en vigor la Ley de IA de la Unión Europea. Sus prohibiciones se aplican desde febrero de 2025.',
			en: 'The European Union’s AI Act enters into force. Its prohibitions apply from February 2025.',
		},
		temas: ['gobernanza'],
		evidencia: 'consenso',
		fuentes: ['ue-ley-ia'],
	},
];

/** Los eventos que el modelo dispara en un futuro (sobre la mediana), con la primera crisis solamente. */
export function eventosDelFuturo(id: CuadranteId): EventoModelo[] {
	const eventos = proyectarGuardado(presetDe(id)).eventos.filter((e) => e.anio > 2026);
	const primeraCrisis = eventos.find((e) => e.id === 'crisis');
	return eventos.filter((e) => e.id !== 'crisis' || e === primeraCrisis);
}
