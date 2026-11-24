import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';

/** Access status is deliberately separate from factual verification. */
export function clasificarEnlace(status, sample) {
  if ([401, 403, 451].includes(status)) return 'restricted';
  if ([404, 410].includes(status)) return 'broken';
  if (status === null || [408, 429].includes(status) || status >= 500) return 'temporary';
  if (status >= 200 && status < 300) {
    if (sample !== undefined && !sample.trim()) return 'empty-response';
    if (/just a moment|verify (?:that )?you are human|enable javascript and cookies to continue|captcha challenge/i.test(sample ?? '')) return 'restricted';
    return 'reachable';
  }
  return 'needs-review';
}

export function recogerEnlaces(sources) {
  const links = new Map();
  for (const source of sources) {
    for (const url of [source.url, source.archivo, source.doi && `https://doi.org/${source.doi}`].filter(Boolean)) {
      if (!links.has(url)) links.set(url, { url, sources: [] });
      if (!links.get(url).sources.includes(source.id)) links.get(url).sources.push(source.id);
    }
  }
  return [...links.values()];
}

async function comprobar(link) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(link.url, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'PeaceTheFrontier-SourceReview/1.0 (weekly editorial link check)', Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8' },
    });
    // A GET catches sites that reject HEAD; sample a bounded body and close the connection.
    const reader = response.body?.getReader();
    let sample = '', size = 0;
    if (reader) {
      try {
        while (size < 32768) {
          const { value, done } = await reader.read();
          if (done) break;
          sample += new TextDecoder().decode(value);
          size += value.byteLength;
        }
      } finally { await reader.cancel(); }
    }
    return { ...link, checkedAt, status: response.status, finalUrl: response.url,
      outcome: clasificarEnlace(response.status, sample) };
  } catch (error) {
    return { ...link, checkedAt, status: null, outcome: 'temporary', error: error.cause?.code ?? error.name };
  }
}

async function main() {
  const sources = YAML.parse(await readFile('src/content/fuentes.yaml', 'utf8'));
  const queue = recogerEnlaces(sources);
  const results = [];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const link = queue.shift();
      const attempts = [await comprobar(link)];
      if (attempts[0].outcome === 'temporary') {
        await new Promise((r) => setTimeout(r, 2000));
        attempts.push(await comprobar(link));
      }
      results.push({ ...attempts.at(-1), attempts });
    }
  }));
  results.sort((a, b) => a.url.localeCompare(b.url));
  await mkdir('reports', { recursive: true });
  const report = { checkedAt: new Date().toISOString(), scope: 'Source URLs, DOI resolvers and existing archives; availability only, not factual verification.', results };
  await writeFile('reports/source-links.json', JSON.stringify(report, null, 2) + '\n');
  const esc = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
  const counts = Object.fromEntries([...new Set(results.map((r) => r.outcome))].map((s) => [s, results.filter((r) => r.outcome === s).length]));
  await writeFile('reports/source-links.md', `# Source link report\n\nChecked: ${report.checkedAt}\n\n${report.scope}\n\n${Object.entries(counts).map(([k,v])=>`${k}: ${v}`).join(' · ')}\n\n404/410 are broken; 401/403/451 and challenges are access restrictions. Timeouts, rate limits and server failures are temporary and receive one retry. Empty successful responses and other errors need manual review. Redirects and attempts are recorded in JSON. No content is rewritten or published.\n\n| Sources | Outcome | HTTP | URL |\n|---|---|---|---|\n` + results.map((r) => `| ${esc(r.sources.join(', '))} | ${r.outcome} | ${r.status ?? '—'} | ${esc(r.url)} |`).join('\n') + '\n');
  console.log(`Source link report: ${results.length} URLs; ${JSON.stringify(counts)}. See reports/source-links.md`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
