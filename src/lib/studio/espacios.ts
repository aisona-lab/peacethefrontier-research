import type {Idioma} from '../../i18n/rutas';

export const ESPACIOS = [
 {id:'studio', dominio:'peacethefrontier.com', nombre:{es:'Research Studio',en:'Research Studio'}},
 {id:'atlas', dominio:'atlas.peacethefrontier.com', nombre:{es:'Atlas de futuros',en:'Futures atlas'}},
 {id:'research', dominio:'research.peacethefrontier.com', nombre:{es:'Investigaciones',en:'Research'}},
 {id:'sim', dominio:'sim.peacethefrontier.com', nombre:{es:'Simulaciones',en:'Simulations'}},
 {id:'open', dominio:'open.peacethefrontier.com', nombre:{es:'Open Science',en:'Open Science'}},
] as const;
export type EspacioId = typeof ESPACIOS[number]['id'];
export interface Perfil { superficie:EspacioId; multisite:boolean }
export function opcionesPerfil(env:Record<string,string|undefined>):Perfil {
 const id=env.PTF_SURFACE??'studio';
 if(!ESPACIOS.some(e=>e.id===id))throw new Error(`PTF_SURFACE desconocida: ${id}`);
 return {superficie:id as EspacioId,multisite:env.PTF_MULTISITE==='1'};
}
export const dominioEspacio=(id:EspacioId)=>ESPACIOS.find(e=>e.id===id)!.dominio;
export function rutaEspacio(id:EspacioId,lang:Idioma):string {
 const base=lang==='en'?'/en/':'/';
 return id==='studio'?base:base+id+'/';
}
function partes(path:string){
 if(!path.startsWith('/')||path.startsWith('//')||path.includes('\\'))throw new Error('Se requiere una ruta local absoluta');
 const en=path.startsWith('/en/');return {prefijo:en?'/en':'',resto:en?path.slice(3):path};
}
export function espacioDeRuta(path:string,raiz:EspacioId='studio'):EspacioId {
 const {resto}=partes(path);
 if(resto==='/')return raiz;
 for(const e of ESPACIOS)if(e.id!=='studio'&&(resto===`/${e.id}/`||resto.startsWith(`/${e.id}/`)))return e.id;
 if(/^\/(temas|topics|futuros|futures|caminos|paths|articulos|articles|linea-del-tiempo|timeline)\//.test(resto))return 'atlas';
 return 'studio';
}
export function urlPublica(path:string,p:Perfil):string {
 const {prefijo,resto}=partes(path);
 if(!p.multisite)return new URL(path,'https://peacethefrontier.com').href;
 const id=espacioDeRuta(path,p.superficie);
 const espacioPrefijo=id==='studio'?'':`/${id}/`;
 const limpio=espacioPrefijo&&resto.startsWith(espacioPrefijo)?`/${resto.slice(espacioPrefijo.length)}`:resto;
 return new URL(`${prefijo}${limpio}`,`https://${dominioEspacio(id)}`).href;
}
export function enlaceEspacio(id:EspacioId,lang:Idioma,p:Perfil):string {
 return p.multisite?`https://${dominioEspacio(id)}${lang==='en'?'/en/':'/'}`:rutaEspacio(id,lang);
}
export const hrefPublico=(path:string,p:Perfil)=>p.multisite?urlPublica(path,p):path;
