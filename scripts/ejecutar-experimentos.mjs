import { execFileSync } from 'node:child_process';

execFileSync(
	process.execPath,
	['--experimental-strip-types', 'scripts/ejecutar-experimentos.ts', ...process.argv.slice(2)],
	{ stdio: 'inherit' },
);
