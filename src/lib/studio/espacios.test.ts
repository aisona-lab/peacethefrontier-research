import {expect,test} from 'vitest';
import {ESPACIOS, rutaEspacio, espacioDeRuta, urlPublica, opcionesPerfil} from './espacios';

test('cinco espacios con rutas bilingües únicas',()=>{
 expect(ESPACIOS.map(e=>e.id)).toEqual(['studio','atlas','research','sim','open']);
 expect(rutaEspacio('atlas','es')).toBe('/atlas/');
 expect(rutaEspacio('research','en')).toBe('/en/research/');
});
test('la vista local conserva rutas y la migración reconoce el atlas existente',()=>{
 expect(espacioDeRuta('/temas/ia/')).toBe('atlas');
 expect(espacioDeRuta('/en/futures/race/')).toBe('atlas');
 expect(espacioDeRuta('/research/working-papers/a/')).toBe('research');
 expect(urlPublica('/en/research/',opcionesPerfil({}))).toBe('https://peacethefrontier.com/en/research/');
});
test('cada perfil tiene raíz, idioma y canonical del subdominio correcto',()=>{
 const p=opcionesPerfil({PTF_SURFACE:'research',PTF_MULTISITE:'1'});
 expect(urlPublica('/',p)).toBe('https://research.peacethefrontier.com/');
 expect(urlPublica('/en/',p)).toBe('https://research.peacethefrontier.com/en/');
 expect(urlPublica('/research/working-papers/a/',p)).toBe('https://research.peacethefrontier.com/working-papers/a/');
 expect(urlPublica('/en/topics/ai/',p)).toBe('https://atlas.peacethefrontier.com/en/topics/ai/');
 expect(urlPublica('/sobre/',p)).toBe('https://peacethefrontier.com/sobre/');
});
test('los perfiles desconocidos y las rutas externas no se aceptan',()=>{
 expect(()=>opcionesPerfil({PTF_SURFACE:'fake'})).toThrow();
 expect(()=>urlPublica('//evil.example/',opcionesPerfil({}))).toThrow();
});
