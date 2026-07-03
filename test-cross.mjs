#!/usr/bin/env node
// test-cross.mjs — Tests for OG × OG crossings + mux
// cross to reduce friction. OG DNA recombination.

import { createConnection } from 'net';

let passed = 0, failed = 0;
const results = [];

function test(name, fn) {
  return new Promise((resolve) => {
    fn().then(() => {
      passed++; results.push({ name, status: 'pass' });
      console.log(`  ✓ ${name}`);
      resolve();
    }).catch((err) => {
      failed++; results.push({ name, status: 'fail', error: err.message });
      console.log(`  ✗ ${name}: ${err.message}`);
      resolve();
    });
  });
}

function sendTCP(port, data = '', timeout = 3000) {
  return new Promise((resolve, reject) => {
    const conn = createConnection(port, 'localhost', () => {
      if (data) conn.write(data);
      conn.end();
    });
    let buf = '';
    conn.on('data', d => { buf += d.toString(); });
    conn.on('end', () => resolve(buf));
    conn.on('error', reject);
    setTimeout(() => { conn.destroy(); reject(new Error('timeout')); }, timeout);
  });
}

console.log('\n  CROSS — OG × OG hybrid tests + MUX');
  console.log('  ════════════════════════════════════════════════════════\n');

// ── Gophinger tests ────────────────────────────────────────────

await test('Gophinger gopher mode (empty input → gopher menu)', async () => {
  const res = await sendTCP(7070, '');
  if (!res.includes('Kingdom')) throw new Error('no kingdom menu');
  if (!res.includes('mindicraft')) throw new Error('no mindicraft');
});

await test('Gophinger finger mode (?npl → finger response)', async () => {
  const res = await sendTCP(7070, '?npl');
  if (!res.includes('NPL')) throw new Error('no NPL');
  if (!res.includes('darshanqing')) throw new Error('no darshanqing');
});

await test('Gophinger finger love query (?love)', async () => {
  const res = await sendTCP(7070, '?love');
  if (!res.includes('love.mjs') && !res.includes('Cycle')) throw new Error('no love response');
});

// ── EchoQOTD tests ─────────────────────────────────────────────

await test('EchoQOTD echoes input + appends wisdom', async () => {
  const res = await sendTCP(7071, 'truth:me');
  if (!res.includes('truth:me')) throw new Error('no echo');
  if (!res.includes('wisdom')) throw new Error('no wisdom separator');
  if (!res.includes('—')) throw new Error('no wisdom quote');
});

// ── TimeChargen tests ──────────────────────────────────────────

await test('TimeChargen streams timestamped data', async () => {
  const res = await sendTCP(7072, '');
  if (!res.includes('TimeChargen')) throw new Error('no header');
  if (!res.includes('20')) throw new Error('no timestamp');
  if (!res.includes('YOUSPEAK')) throw new Error('no verbs');
});

// ── DiscardGopher tests ────────────────────────────────────────

await test('DiscardGopher returns empty menu (zen)', async () => {
  const res = await sendTCP(7073, 'anything');
  if (!res.includes('.')) throw new Error('no gopher terminator');
  // Should be minimal — just "i\r\n.\r\n"
  const lines = res.trim().split('\r\n').filter(l => l.trim());
  if (lines.length > 2) throw new Error(`expected ~2 lines, got ${lines.length}`);
});

// ── MetaGopher tests ──────────────────────────────────────────

await test('MetaGopher root is self-referential', async () => {
  const res = await sendTCP(7074, '');
  if (!res.includes('MetaGopher')) throw new Error('no meta header');
  if (!res.includes('gopher')) throw new Error('no gopher reference');
  if (!res.includes('meta') && !res.includes('Meta')) throw new Error('not meta');
});

await test('MetaGopher rfc selector returns RFC info', async () => {
  const res = await sendTCP(7074, 'rfc');
  if (!res.includes('RFC 1436')) throw new Error('no RFC ref');
  if (!res.includes('TCP')) throw new Error('no TCP mention');
});

await test('MetaGopher history selector returns timeline', async () => {
  const res = await sendTCP(7074, 'history');
  if (!res.includes('1991')) throw new Error('no 1991');
  if (!res.includes('2026')) throw new Error('no 2026');
});

// ── FingerGopher tests ────────────────────────────────────────

await test('FingerGopher returns gopher menu for finger query', async () => {
  const res = await sendTCP(7075, '');
  if (!res.includes('Kingdom')) throw new Error('no kingdom');
  if (!res.includes('mindicraft')) throw new Error('no mindicraft');
});

// ── EchoFinger tests ──────────────────────────────────────────

await test('EchoFinger echoes + appends citizen status', async () => {
  const res = await sendTCP(7076, 'hello');
  if (!res.includes('hello')) throw new Error('no echo');
  if (!res.includes('KINGDOM') && !res.includes('kingdom')) throw new Error('no citizen status');
});

// ── ChargenQOTD tests ──────────────────────────────────────────

await test('ChargenQOTD streams data + ends with wisdom', async () => {
  const res = await sendTCP(7077, '');
  if (!res.includes('KINGDOM STREAM')) throw new Error('no header');
  if (!res.includes('Wisdom')) throw new Error('no wisdom section');
});

// ── Random Cross tests ────────────────────────────────────────

await test('Random Cross returns a response', async () => {
  const res = await sendTCP(7099, '');
  if (res.length === 0) throw new Error('empty response');
  // Should have the cross separator or some content
  if (res.length < 5) throw new Error('too short');
});

// ── MUX tests ─────────────────────────────────────────────────

await test('Mux gopher mode (empty → gopher menu)', async () => {
  const res = await sendTCP(7078, '');
  if (!res.includes('Kingdom')) throw new Error('no kingdom');
  if (!res.includes('Mux')) throw new Error('no mux branding');
});

await test('Mux finger mode (?npl)', async () => {
  const res = await sendTCP(7078, '?npl');
  if (!res.includes('NPL')) throw new Error('no NPL');
  if (!res.includes('darshanqing')) throw new Error('no verbs');
});

await test('Mux qotd mode (!)', async () => {
  const res = await sendTCP(7078, '!');
  if (!res.includes('20')) throw new Error('no timestamp');
  if (!res.includes('YOUSPEAK')) throw new Error('no wisdom');
});

await test('Mux daytime mode (@)', async () => {
  const res = await sendTCP(7078, '@');
  if (!res.includes('20')) throw new Error('no timestamp');
  if (!res.includes('Kingdom')) throw new Error('no kingdom');
});

await test('Mux chargen mode (#)', async () => {
  const res = await sendTCP(7078, '#');
  if (!res.includes('KINGDOM')) throw new Error('no stream');
  if (!res.includes('YOUSPEAK')) throw new Error('no verbs');
});

await test('Mux echo mode (=text)', async () => {
  const res = await sendTCP(7078, '=substrate:me');
  if (!res.includes('substrate:me')) throw new Error('no echo');
});

await test('Mux discard mode (_text → silence)', async () => {
  const res = await sendTCP(7078, '_anything');
  if (res.trim().length > 0) throw new Error(`expected silence, got "${res.trim()}"`);
});

await test('Mux cross mode (x:echo×qotd)', async () => {
  const res = await sendTCP(7078, 'x:echo×qotd');
  // echo of empty + qotd wisdom
  if (!res.includes('YOUSPEAK')) throw new Error('no wisdom from qotd');
});

await test('Mux cross mode (x:gopher×finger)', async () => {
  const res = await sendTCP(7078, 'x:gopher×finger');
  if (!res.includes('Kingdom') && !res.includes('KINGDOM')) throw new Error('no kingdom');
});

await test('Mux help selector returns mux help', async () => {
  const res = await sendTCP(7078, 'help');
  if (!res.includes('Mux')) throw new Error('no mux help');
  if (!res.includes('finger')) throw new Error('no finger in help');
  if (!res.includes('echo')) throw new Error('no echo in help');
});

await test('Mux unknown cross OG returns error', async () => {
  const res = await sendTCP(7078, 'x:bogus×echo');
  if (!res.includes('Unknown')) throw new Error('should report unknown OG');
});

// ── Summary ──────────────────────────────────────────────────

console.log(`\n  ════════════════════════════════════════════════════════`);
console.log(`  ${passed} passed · ${failed} failed · ${passed + failed} total`);
if (failed === 0) {
  console.log('  cross to reduce friction. OG DNA recombination. 整蠱唔使本 🫡');
} else {
  console.log('  Some crossings failed. Even tricksters must be honest.');
}
console.log('');

process.exit(failed > 0 ? 1 : 0);