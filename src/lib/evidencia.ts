// Niveles de evidencia (R2.2). Se distinguen por estilo de línea, como en los mapas:
// continua = seguro, discontinua = incierto. Así no dependen del color.

export const NIVELES = [
	{
		id: 'consenso',
		nombre: { es: 'Consenso', en: 'Consensus' },
		descripcion: {
			es: 'La evidencia es amplia y los especialistas coinciden. Por ejemplo, que la actividad humana está calentando el planeta.',
			en: 'The evidence is broad and specialists agree. For example, that human activity is warming the planet.',
		},
	},
	{
		id: 'emergente',
		nombre: { es: 'Evidencia emergente', en: 'Emerging evidence' },
		descripcion: {
			es: 'Hay estudios sólidos, pero son recientes o pocos. La conclusión puede cambiar.',
			en: 'There are solid studies, but they are recent or few. The conclusion may change.',
		},
	},
	{
		id: 'especulativo',
		nombre: { es: 'Especulativo', en: 'Speculative' },
		descripcion: {
			es: 'Una hipótesis razonable que todavía no tiene evidencia directa.',
			en: 'A reasonable hypothesis that still lacks direct evidence.',
		},
	},
	{
		id: 'escenario-ficcion',
		nombre: { es: 'Escenario', en: 'Scenario' },
		descripcion: {
			es: 'Un futuro posible construido a partir de supuestos explícitos. No es una predicción.',
			en: 'A possible future built from explicit assumptions. It is not a prediction.',
		},
	},
] as const;

export type NivelId = (typeof NIVELES)[number]['id'];
