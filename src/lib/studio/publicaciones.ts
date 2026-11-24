import type {Idioma} from '../../i18n/rutas';
export type TipoPublicacion='articulo'|'working-paper';
export const rutaPublicacion=(lang:Idioma,slug:string,tipo:TipoPublicacion='articulo')=>tipo==='working-paper'?`${lang==='en'?'/en':''}/research/working-papers/${slug}/`:`${lang==='en'?'/en/articles':'/articulos'}/${slug}/`;
export function workingPaperCompleto(p:{tipoPublicacion?:string;serie?:string;numero?:number;version?:string}){
 return p.tipoPublicacion!=='working-paper'||Boolean(p.serie&&p.numero&&p.version);
}
