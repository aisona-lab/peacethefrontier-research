import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const dir = await mkdtemp(join(tmpdir(), 'atlas-ledger-'));
try {
  const outfile = join(dir, 'snapshot.cjs');
  await build({ entryPoints: ['scripts/research-ledger.ts'], bundle: true, platform: 'node', format: 'cjs', outfile });
  execFileSync(process.execPath, [outfile], { stdio: 'inherit' });
} finally { await rm(dir, { recursive: true, force: true }); }
