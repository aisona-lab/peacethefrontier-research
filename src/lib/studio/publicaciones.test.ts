import {expect,test} from 'vitest';
import {rutaPublicacion,workingPaperCompleto} from './publicaciones';

test('las rutas existentes de artículos permanecen y research aloja los working papers',()=>{
 expect(rutaPublicacion('es','computo-de-la-ia','articulo')).toBe('/articulos/computo-de-la-ia/');
 expect(rutaPublicacion('en','model-audit','working-paper')).toBe('/en/research/working-papers/model-audit/');
});
test('un working paper requiere serie, número y versión',()=>{
 const p={tipoPublicacion:'working-paper',serie:'PTF-WP',numero:1,version:'0.1.0'};
 expect(workingPaperCompleto(p)).toBe(true);
 for(const key of ['serie','numero','version'])expect(workingPaperCompleto({...p,[key]:undefined})).toBe(false);
 expect(workingPaperCompleto({tipoPublicacion:'articulo'})).toBe(true);
});
