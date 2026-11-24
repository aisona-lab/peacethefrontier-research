// Publication metadata is independent of access and editorial verification.
import { z } from 'astro/zod';
import { esDatosHasta } from './editorial';
import type { Idioma } from '../i18n/rutas';

const fecha = z.string().refine(esDatosHasta, 'use AAAA-MM or AAAA-MM-DD');
const enlace = z.url().refine((s) => /^https?:\/\//.test(s), 'use an HTTP(S) source');

export const esquemaFuente = z.object({
	titulo: z.string().min(1),
	organizacion: z.string().min(1),
	organizacionEn: z.string().optional(),
	anio: z.number().int().optional(),
	fechaPublicacion: fecha.optional(),
	autores: z.array(z.string().min(1)).optional(),
	tipo: z.enum(['oficial', 'revisado-por-pares', 'preprint', 'prensa', 'libro', 'dataset', 'analisis']),
	url: enlace,
	doi: z.string().regex(/^10\.\d{4,9}\/\S+$/i).optional(),
	archivo: enlace.optional(),
	fechaAcceso: z.union([z.iso.date(), z.iso.datetime({ offset: true }), z.date()]).pipe(z.coerce.date()).optional(),
	verificacion: z.enum(['pendiente', 'acceso-limitado', 'verificada']).default('pendiente'),
	verificado: fecha.optional(),
}).refine((f) => !f.anio || !f.fechaPublicacion || String(f.anio) === f.fechaPublicacion.slice(0, 4), {
	message: 'publication year and date disagree',
}).refine((f) => f.verificacion !== 'verificada' || Boolean(f.verificado && f.fechaAcceso), {
	message: 'verified sources need review and successful access dates',
});

export type Fuente = z.infer<typeof esquemaFuente>;
export function fechaFuente(f: Pick<Fuente, 'anio' | 'fechaPublicacion'>, lang: Idioma): string {
	return f.fechaPublicacion?.slice(0, 4) ?? (f.anio ? String(f.anio) : lang === 'es' ? 's. f.' : 'n.d.');
}
