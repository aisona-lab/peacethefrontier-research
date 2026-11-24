import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clasificarEnlace, recogerEnlaces } from './enlaces.mjs';

test('access restrictions are not broken links', () => {
  for (const status of [401, 403, 451]) assert.equal(clasificarEnlace(status), 'restricted');
  assert.equal(clasificarEnlace(200, 'Just a moment... Enable JavaScript and cookies to continue'), 'restricted');
});
test('permanent errors, temporary errors and unknown failures stay distinct', () => {
  for (const status of [404, 410]) assert.equal(clasificarEnlace(status), 'broken');
  for (const status of [408, 429, 500, 502, 503, 504]) assert.equal(clasificarEnlace(status), 'temporary');
  assert.equal(clasificarEnlace(200, 'Research report'), 'reachable');
  assert.equal(clasificarEnlace(200, ''), 'empty-response');
  assert.equal(clasificarEnlace(400), 'needs-review');
  assert.equal(clasificarEnlace(null), 'temporary');
});
test('deduplicate URLs but retain source IDs, DOI and existing archive', () => {
  const links = recogerEnlaces([{id:'a',url:'https://example.org',doi:'10.1234/test'}, {id:'b',url:'https://example.org',archivo:'https://archive.org/test'}]);
  assert.equal(links.length, 3);
  assert.deepEqual(links[0].sources, ['a', 'b']);
  assert.equal(links[1].url, 'https://doi.org/10.1234/test');
});
