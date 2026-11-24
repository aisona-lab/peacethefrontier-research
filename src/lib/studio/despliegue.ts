import {readdir,readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {ESPACIOS,dominioEspacio,type EspacioId} from './espacios';
const escapeXml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const rutaHtml=(file:string)=>file==='index.html'?'/':`/${file.endsWith('/index.html')?file.slice(0,-10):file}`;
export async function prepararPerfil(dir:string,id:EspacioId){
 const origin=`https://${dominioEspacio(id)}`;
 const files=(await readdir(dir,{recursive:true})).filter(f=>f.endsWith('.html'));
 const redirects=new Set<string>();const urls=new Set<string>();
 let original='';try{original=(await readFile(join(dir,'_redirects'),'utf8')).split('\n# Canonical studio migration\n')[0];}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 for(const file of files){
  const text=await readFile(join(dir,file),'utf8');
  const tag=text.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  const href=tag?.match(/href=["']([^"']+)["']/i)?.[1];
  if(!href)throw new Error(`Canonical ausente: ${file}`);
  const canonical=new URL(href);
  if(!ESPACIOS.some(e=>e.dominio===canonical.hostname)||canonical.protocol!=='https:')throw new Error(`Canonical no permitido: ${href}`);
  const source=rutaHtml(file);
  if(file==='index.html'&&canonical.origin!==origin)throw new Error(`La raíz no corresponde al perfil ${id}`);
  if(canonical.origin===origin){
   if(!/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(text))urls.add(canonical.href);
   if(source!==canonical.pathname){
    const dest=resolve(dir,`.${canonical.pathname}`,canonical.pathname.endsWith('/')?'index.html':'');
    if(!dest.startsWith(resolve(dir)+'/'))throw new Error('Ruta de salida no permitida');
    if(canonical.pathname!=='/'&&canonical.pathname!=='/en/') {await mkdir(dirname(dest),{recursive:true});await copyFile(join(dir,file),dest);}
   }
  }
  if(canonical.origin!==origin||canonical.pathname!==source)redirects.add(`${source} ${canonical.href} 301`);
 }
 const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...urls].sort().map(u=>`<url><loc>${escapeXml(u)}</loc></url>`).join('')}</urlset>\n`;
 await writeFile(join(dir,'sitemap-0.xml'),sitemap);
 await writeFile(join(dir,'sitemap-index.xml'),`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/sitemap-0.xml</loc></sitemap></sitemapindex>\n`);
 await writeFile(join(dir,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap-index.xml\n`);
 await writeFile(join(dir,'_redirects'),original.trimEnd()+'\n# Canonical studio migration\n'+[...redirects].sort().join('\n')+'\n');
 return {id,pages:files.length,indexed:urls.size,redirects:redirects.size};
}
