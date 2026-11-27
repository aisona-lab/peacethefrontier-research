#!/usr/bin/env node
// Recolector CLI para Semanas 4-6: consulta PRs reales de un repositorio público vía `gh api`
// y devuelve filas candidatas (en JSON/CSV) con URL verificable, commits, checks fallidos y tiempo hasta revisión.
// Nunca modifica automáticamente el dataset publicado sin verificación humana de autoría de agente.
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const arg = (name) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
};

const repo = arg('repo');
const limit = Number(arg('limit') ?? '20');

if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || !Number.isInteger(limit) || limit < 1) {
	console.error('Uso: node experiments/h1-empirico/collect-github-prs.mjs --repo <owner/repo> [--limit 20]');
	process.exit(1);
}

const raw = execFileSync(
	'gh',
	[
		'pr',
		'list',
		'-R',
		repo,
		'--state',
		'all',
		'--limit',
		String(limit),
		'--json',
		'number,title,url,state,createdAt,mergedAt,closedAt,author,commits,reviews,statusCheckRollup',
	],
	{ encoding: 'utf8' },
);

const prs = JSON.parse(raw);
const summary = prs.map((pr) => {
	const checks = pr.statusCheckRollup ?? [];
	const failedChecks = checks.filter((c) => c.conclusion === 'FAILURE' || c.state === 'FAILURE').length;
	const totalSteps = Math.max(1, (pr.commits?.length ?? 0) + checks.length);
	const created = new Date(pr.createdAt).getTime();
	const end = pr.mergedAt ? new Date(pr.mergedAt).getTime() : pr.closedAt ? new Date(pr.closedAt).getTime() : null;
	const cycleMinutes = end ? Math.round((end - created) / 60000) : null;
	return {
		source_type: 'open-repo-pr',
		source_ref: pr.url,
		author: pr.author?.login ?? 'unknown',
		state: pr.state,
		commits: pr.commits?.length ?? 0,
		reviews: pr.reviews?.length ?? 0,
		failed_checks: failedChecks,
		candidate_chain_steps: totalSteps,
		pr_cycle_minutes: cycleMinutes,
		title: pr.title,
	};
});

console.log(JSON.stringify({ repo, inspected: summary.length, candidates: summary }, null, 2));
