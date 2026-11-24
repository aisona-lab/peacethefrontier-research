import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = await mkdtemp(join(tmpdir(), 'atlas-resiliencia-'));
try {
  const outfile = join(dir, 'generar-resiliencia.cjs');
  await build({ entryPoints: ['scripts/generar-resiliencia.ts'], bundle: true, platform: 'node', format: 'cjs', outfile });
  execFileSync(process.execPath, [outfile, ...process.argv.slice(2)], { stdio: 'inherit' });
} finally { await rm(dir, { recursive: true, force: true }); }
