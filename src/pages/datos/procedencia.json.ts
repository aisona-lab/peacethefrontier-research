import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PARAMETROS } from '../../lib/futuros/parametros';
import { ANIO_INICIAL } from '../../lib/futuros/tipos';
import { BANDAS, BASE_ELECTRICA } from '../../lib/futuros/procedencia';

/** Companion metadata keeps the existing six CSV columns backward compatible. */
export const GET: APIRoute = async () => new Response(JSON.stringify({
	schemaVersion: 1,
	baselineYear: ANIO_INICIAL,
	outputKind: 'conditional-scenario-output',
	csvColumns: ['anio', 'indicador', 'unidad', 'p10', 'p50', 'p90'],
	uncertainty: BANDAS,
	indicatorNotes: { energiaIA: BASE_ELECTRICA },
	parameters: PARAMETROS,
	sources: (await getCollection('fuentes')).map((f) => ({ id: f.id, ...f.data })),
}, null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
