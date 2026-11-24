/** Manual inventory snapshot: captures text and references, never verifies or rewrites conclusions. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import YAML from 'yaml';
import { PARAMETROS } from '../src/lib/futuros/parametros';
import { SENALES_PAZ } from '../src/lib/futuros/hoy';
import { OBJETIVOS } from '../src/lib/futuros/calibracion';
import { EVENTOS } from '../src/lib/linea/eventos';
import { DECISIONES } from '../src/lib/caminos/decisiones';

const rows: Record<string, unknown>[] = [];
const hashes: Record<string, string> = {};
const read = (path: string) => {
  const text = readFileSync(path, 'utf8');
  hashes[path] = createHash('sha256').update(text).digest('hex');
  return text;
};
read('src/content/fuentes.yaml');
const audit = JSON.parse(read('docs/research/source-audit.json'));
const passages = JSON.parse(read('docs/research/passages.json')).passages as {id:string;source:string;observationPeriod:string}[];
function add(id: string, path: string, claim: unknown, sources: readonly string[], kind: string, period = 'See cited passage; no common observation period inferred', uncertainty = 'Read with source-audit.json; draft/editorial sign-off pending') {
  rows.push({ id, affectedFiles: [path], claim, kind, sources,
    supportingPassages: passages.filter(p=>sources.includes(p.source)).map(p=>p.id),
    observationPeriod: period, uncertainty,
    verification: kind === 'scenario' || kind === 'model-choice' ? 'explicit-assumption' : 'editorial-review-pending',
  });
}
const topicPath='src/content/temas.yaml';
for(const topic of YAML.parse(read(topicPath))) add(`topic:${topic.id}`, topicPath, {es:topic.intro,en:topic.en.intro}, topic.fuentes, 'topic-introduction');
for(const category of ['articulos','futuros'] as const){
  for(const lang of ['es','en']) for(const file of readdirSync(`src/content/${category}/${lang}`).filter(f=>f.endsWith('.mdx'))){
    const path=`src/content/${category}/${lang}/${file}`;const text=read(path);const match=text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
    const meta=YAML.parse(match[1]);const sources=meta.fuentes??[];
    add(`${category}:${lang}/${file}:metadata`,path,meta,sources,category==='futuros'?'scenario':'article-summary');
    match[2].split(/\n\s*\n/).filter(p=>p.trim()&&!p.startsWith('import ')&&!p.startsWith('## ')).forEach((paragraph,i)=>{
      const citations=[...paragraph.matchAll(/<Nota\s+f="([^"]+)"/g)].map(m=>m[1]);
      add(`${category}:${lang}/${file}:p${i+1}`,path,paragraph.trim(),citations.length?citations:sources,category==='futuros'?'scenario':'article-paragraph',category==='futuros'?'Conditional model narrative, 2026–2126':'Mixed periods; see text and source passages',category==='futuros'?'Conditional scenario fiction; embedded figures are model outputs, not observations.':'Source references without inline notes are contextual, not proof of every sentence. Independent editorial review of claims and translation remains required.');
    });
  }
}
read('src/lib/linea/eventos.ts');
for(const e of EVENTOS) add(`timeline:${e.id}`,'src/lib/linea/eventos.ts',{date:e.anio,approximate:e.aprox,title:e.titulo,summary:e.resumen},e.fuentes,'historical-event',String(e.anio),'Source passage may support only part of summary; full event-level verification pending.');
read('src/lib/caminos/decisiones.ts');
for(const d of DECISIONES){
 add(`decision:${d.id}:context`,'src/lib/caminos/decisiones.ts',d.contexto,d.fuentes,'decision-context','Dated context, not the scenario decision year');
 add(`decision:${d.id}:effects`,'src/lib/caminos/decisiones.ts',d.opciones,[],'model-choice',`Scenario decision ${d.anio}`,'Normative criteria and numerical effects are editorial assumptions, not measured causal effects.');
}
read('src/lib/futuros/hoy.ts');
for(const s of SENALES_PAZ) add(`today:${s.id}`,'src/lib/futuros/hoy.ts',s,s.fuentes,'editorial-rubric','Inherited editorial snapshot 2026-10-02; some sources later read','Scores are editorial; source passages do not establish current country/legal status.');
read('src/lib/futuros/parametros.ts');
for(const [id,p] of Object.entries(PARAMETROS)) add(`parameter:${id}`,'src/lib/futuros/parametros.ts',p,'fuente' in p?[p.fuente]:[],p.relacion==='supuesto'?'model-choice':p.relacion,JSON.stringify(p.periodo),JSON.stringify(p.notas));
read('src/lib/futuros/calibracion.ts');
for(const o of OBJETIVOS) add(`calibration:${o.id}`,'src/lib/futuros/calibracion.ts',{description:o.descripcion,min:o.min,max:o.max,unit:o.unidad},[o.fuente],'model-choice','See target description','Calibration target is not independent validation; tolerances and scenario mapping are editorial choices.');
writeFileSync('docs/research/claim-index.json',JSON.stringify({schemaVersion:1,snapshotDate:new Date().toISOString().slice(0,10),researchReviewDate:audit.auditDate,scope:'Coverage inventory linked to curated passages and source audit. A listed passage is a candidate support, not automated entailment or factual clearance.',hashes,claims:rows},null,2)+'\n');
console.log(`Captured ${rows.length} claim/context units in ${Object.keys(hashes).length} files. Verification statuses remain pending or explicit assumptions.`);
