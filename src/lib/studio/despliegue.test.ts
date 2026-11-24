import {mkdtempSync,writeFileSync,mkdirSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {expect,test} from 'vitest';
import {prepararPerfil} from './despliegue';
const html=(url:string,noindex=false)=>`<html><head><link rel="canonical" href="${url}">${noindex?'<meta name="robots" content="noindex">':''}</head><body>real page</body></html>`;
test('un perfil research sirve rutas propias, redirige las heredadas y excluye borradores del sitemap',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'studio-profile-'));
 try{
  for(const [file,url,draft] of [
   ['index.html','https://research.peacethefrontier.com/',false],
   ['research/working-papers/p/index.html','https://research.peacethefrontier.com/working-papers/p/',true],
   ['temas/ia/index.html','https://atlas.peacethefrontier.com/temas/ia/',false],
  ] as const){mkdirSync(join(dir,file,'..'),{recursive:true});writeFileSync(join(dir,file),html(url,draft));}
  await prepararPerfil(dir,'research');
  expect(existsSync(join(dir,'working-papers/p/index.html'))).toBe(true);
  expect(readFileSync(join(dir,'_redirects'),'utf8')).toContain('/temas/ia/ https://atlas.peacethefrontier.com/temas/ia/ 301');
  expect(readFileSync(join(dir,'_redirects'),'utf8')).toContain('/research/working-papers/p/ https://research.peacethefrontier.com/working-papers/p/ 301');
  const sitemap=readFileSync(join(dir,'sitemap-0.xml'),'utf8');
  expect(sitemap).toContain('<loc>https://research.peacethefrontier.com/</loc>');
  expect(sitemap).not.toContain('working-papers');expect(sitemap).not.toContain('atlas.');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
