import {opcionesPerfil} from './espacios';
export const PERFIL = opcionesPerfil(process.env);
export const DIRECTOR = 'Carlos Nicolás Soto';
export const REPOSITORIO = 'https://github.com/aisona-lab/peacethefrontier-research';
export function urlCodigoRepositorio(rutaCodigo: string): string {
	if (/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/.test(rutaCodigo)) return rutaCodigo;
	return `${REPOSITORIO}/tree/main/${rutaCodigo.replace(/^\/+|\/+$/g, '')}`;
}
const email=process.env.PTF_CONTACT_EMAIL;
if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('PTF_CONTACT_EMAIL no es un correo válido');
export const CONTACTO=email?`mailto:${email}`:`${REPOSITORIO}/issues/new`;
const hf=process.env.PTF_HF_URL;
if(hf){const u=new URL(hf);if(u.protocol!=='https:'||u.hostname!=='huggingface.co'||!/^\/[A-Za-z0-9_-]+\/?$/.test(u.pathname)||u.search||u.hash||u.username||u.password)throw new Error('PTF_HF_URL debe identificar un perfil u organización de Hugging Face');}
export const HUGGING_FACE=hf;
