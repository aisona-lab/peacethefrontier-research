import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import YAML from 'yaml';
import { expect, test } from 'vitest';
import { DESTACADOS } from './destacados';

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

test('el inventario conserva un resultado por fuente original y añadida', () => {
 const sources = YAML.parse(readFileSync('src/content/fuentes.yaml', 'utf8')) as {id:string}[];
 const audit = json('docs/research/source-audit.json').sources as {id:string;addedInRefresh?:boolean;reviewOutcome:string}[];
 expect(new Set(audit.map(s=>s.id)).size).toBe(audit.length);
 expect(audit.filter(s=>!s.addedInRefresh)).toHaveLength(56);
 expect(audit.map(s=>s.id).sort()).toEqual(sources.map(s=>s.id).sort());
 for(const source of audit) expect(source.reviewOutcome.length, source.id).toBeGreaterThan(20);
});

test('el registro de afirmaciones detecta cambios de texto y referencias inexistentes', () => {
 const index=json('docs/research/claim-index.json');
	for (const path of ['src/content/fuentes.yaml', 'docs/research/passages.json', 'docs/research/source-audit.json']) expect(index.hashes[path], path).toBeTruthy();
 const sourceIds=new Set((YAML.parse(readFileSync('src/content/fuentes.yaml','utf8')) as {id:string}[]).map(s=>s.id));
 const passages=new Set(json('docs/research/passages.json').passages.map((p:{id:string})=>p.id));
 for(const [path,hash] of Object.entries(index.hashes)) {
  expect(createHash('sha256').update(readFileSync(path)).digest('hex'), `Actualizar y revisar el registro para ${path}`).toBe(hash);
 }
 for(const claim of index.claims) {
  expect(claim.uncertainty,claim.id).toBeTruthy();
  expect(claim.observationPeriod,claim.id).toBeTruthy();
  for(const source of claim.sources) expect(sourceIds.has(source),claim.id).toBe(true);
  for(const passage of claim.supportingPassages) expect(passages.has(passage),claim.id).toBe(true);
 }
});

test('la interfaz solo indica verificación cuando el inventario registra pasajes revisados', () => {
	const sources=YAML.parse(readFileSync('src/content/fuentes.yaml','utf8')) as {id:string;verificacion?:string}[];
	const audit=json('docs/research/source-audit.json').sources as {id:string;verification:string;passages:string[]}[];
	for(const source of sources.filter(s=>s.verificacion==='verificada')) {
		const record=audit.find(s=>s.id===source.id)!;
		expect(record.verification,source.id).toBe('reviewed-excerpt');
		expect(record.passages.length,source.id).toBeGreaterThan(0);
	}
});

test('las cuatro revisiones existen como borradores extensos en ambos idiomas', () => {
 for(const lang of ['es','en']) {
  const articles=readdirSync(`src/content/articulos/${lang}`).map(f=>readFileSync(`src/content/articulos/${lang}/${f}`,'utf8'));
  for(const featured of DESTACADOS) {
   const text=articles.find(a=>a.includes(`clave: ${featured.clave}\n`))!;
   expect(text,`${lang}/${featured.clave}`).toBeTruthy();
   expect(text).toContain('estado: borrador');
   const words=text.split('\n---\n')[1].split(/\s+/).length;
   expect(words).toBeGreaterThanOrEqual(1500);
   expect(words).toBeLessThanOrEqual(2500);
  }
 }
});
