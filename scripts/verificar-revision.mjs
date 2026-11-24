import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
export function assertCurrentRevision(expected,actual){
 if(!/^[a-f0-9]{40}$/.test(expected??'')||!/^[a-f0-9]{40}$/.test(actual??''))throw new Error('A full expected SHA and current main SHA are required');
 if(expected!==actual)throw new Error(`Refusing stale deployment ${expected}; main is ${actual}`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const expected=process.env.GITHUB_SHA;
 const refs=execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8',timeout:30000});
 const current=refs.trim().split(/\s+/)[0];
 assertCurrentRevision(expected,current);
 console.log(`Current main revision verified: ${current}`);
}
