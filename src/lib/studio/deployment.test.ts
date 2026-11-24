import {readFileSync} from 'node:fs';import YAML from 'yaml';
import {expect,test} from 'vitest';
import {assertCurrentRevision} from '../../../scripts/verificar-revision.mjs';

test('activación y CI comparten el bloqueo de toda la secuencia, incluidas ejecuciones antiguas de CI',()=>{
 const ci=YAML.parse(readFileSync('.github/workflows/ci.yml','utf8'));
 const manual=YAML.parse(readFileSync('.github/workflows/studio-domains.yml','utf8'));
 // This legacy main-run group must stay stable to drain already-running path deployments.
 expect(ci.name).toBe('CI');
 expect(ci.concurrency.group).toBe('${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}');
 expect(manual.concurrency.group).toBe(`${ci.name}-refs/heads/main`);
 expect(ci.concurrency['cancel-in-progress']).toContain('pull_request');
 expect(manual.concurrency['cancel-in-progress']).toBe(false);
});
test('una revisión anterior no puede publicar después de que avance main',()=>{
 expect(()=>assertCurrentRevision('a'.repeat(40),'a'.repeat(40))).not.toThrow();
 expect(()=>assertCurrentRevision('a'.repeat(40),'b'.repeat(40))).toThrow(/stale/i);
 expect(()=>assertCurrentRevision('', 'b'.repeat(40))).toThrow();
});
test('cada ruta de publicación verifica main inmediatamente antes de wrangler',()=>{
 for(const path of ['.github/workflows/ci.yml','.github/workflows/studio-domains.yml']){
  const workflow=YAML.parse(readFileSync(path,'utf8'));
  const commands=Object.values(workflow.jobs).flatMap((job:any)=>job.steps??[]).map((step:any)=>step.run??'').filter((run:string)=>run.includes('wrangler deploy'));
  expect(commands.length).toBeGreaterThan(0);
  for(const command of commands) {
   for(const prefix of command.split('npx wrangler deploy').slice(0,-1)) expect(prefix).toContain('node scripts/verificar-revision.mjs');
  }
 }
});
