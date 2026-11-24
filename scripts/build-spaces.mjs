import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.cwd();const temp=await mkdtemp(join(tmpdir(),'studio-spaces-'));
try{
 const helper=join(temp,'profiles.mjs');
 await build({stdin:{contents:`export {prepararPerfil} from ${JSON.stringify(resolve('src/lib/studio/despliegue.ts'))}; export {ESPACIOS} from ${JSON.stringify(resolve('src/lib/studio/espacios.ts'))};`,resolveDir:root},bundle:true,platform:'node',format:'esm',outfile:helper});
 const {prepararPerfil,ESPACIOS}=await import(pathToFileURL(helper).href);
 const requested=process.argv.slice(2);if(requested.some(id=>!ESPACIOS.some(e=>e.id===id)))throw new Error('Unknown surface profile');
 const surfaces=requested.length?ESPACIOS.filter(e=>requested.includes(e.id)):ESPACIOS;
 const report=[];
 for(const surface of surfaces){
  const out=`dist-${surface.id}`;const env={...process.env,PTF_SURFACE:surface.id,PTF_MULTISITE:'1',PTF_DIST_DIR:out};
  execFileSync('npm',['run','astro','--','build','--outDir',out],{stdio:'inherit',env});
  // Capture each physical page before root aliases are copied; referenced OG assets remain local.
  execFileSync(process.execPath,['scripts/generar-og.mjs'],{stdio:'inherit',env});
  report.push(await prepararPerfil(out,surface.id));
  execFileSync(process.execPath,['scripts/auditar-csp.mjs'],{stdio:'inherit',env});
 }
 await writeFile('studio-build-report.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{await rm(temp,{recursive:true,force:true});}
