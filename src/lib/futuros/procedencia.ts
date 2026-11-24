// Etiquetas locales del modelo: no cambian los identificadores públicos ni el CSV.
import type { Idioma } from '../../i18n/rutas';
import type { Parametro } from './parametros';

export const RELACIONES: Record<Idioma, Record<Parametro['relacion'], string>> = {
 es: { observado: 'Observado', estimado: 'Estimado', derivado: 'Derivado', calibrado: 'Calibrado con', supuesto: 'Supuesto' },
 en: { observado: 'Observed', estimado: 'Estimated', derivado: 'Derived', calibrado: 'Calibrated against', supuesto: 'Assumed' },
};

export const ELECTRICIDAD = {
 es: 'Electricidad de los centros de datos',
 en: 'Data-centre electricity',
};

export const BASE_ELECTRICA = {
 es: 'La base de 550 TWh representa todos los centros de datos, no solo IA. Su evolución con la capacidad de IA es un supuesto del modelo.',
 en: 'The 550 TWh baseline represents all data centres, not just AI. Its evolution with AI capability is a model assumption.',
};

export const BANDAS = {
 es: 'Las bandas p10–p90 muestran sensibilidad condicional a los rangos y ecuaciones elegidos (200 simulaciones con muestreo uniforme). No son intervalos empíricos ni probabilidades de que ocurra un futuro.',
 en: 'The p10–p90 bands show conditional sensitivity to the chosen ranges and equations (200 simulations with uniform sampling). They are not empirical intervals or probabilities that a future will occur.',
};
