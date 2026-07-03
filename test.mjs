#!/usr/bin/env node
// test.mjs — Trickster Protocol test suite
//
// Tests all 6 forgotten protocols + dashboard.
// Each test connects via TCP, sends a request, checks the response.
// 整蠱唔使本 — but tests are still good practice. 😂

import { createConnection } from 'net';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PORTS = { gopher: 70, finger: 79, qotd: 17, daytime: 13, chargen: 19, echo: 7, dashboard: 7770 };
const MINDICRAFT_INDEX = join(homedir(), 'Desktop', 'mindicraft', 'index');

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  return new Promise((resolve) => {
    fn().then(() => {
      passed++;
      results.push({ name, status: 'pass' });
      console.log(`  ✓ ${name}`);
      resolve();
    }).catch((err) => {
      failed++;
      results.push({ name, status: 'fail', error: err.message });
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
    conn.on('data', (d) => { buf += d.toString(); });
    conn.on('end', () => resolve(buf));
    conn.on('error', reject);
    setTimeout(() => { conn.destroy(); reject(new Error('timeout')); }, timeout);
  });
}

function httpGet(port, path = '/') {
  return new Promise((resolve, reject) => {
    const conn = createConnection(port, 'localhost', () => {
      conn.write(`GET ${path} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n`);
    });
    let buf = '';
    conn.on('data', (d) => { buf += d.toString(); });
    conn.on('end', () => resolve(buf));
    conn.on('error', reject);
    setTimeout(() => { conn.destroy(); reject(new Error('timeout')); }, 5000);
  });
}

// ── Tests ──────────────────────────────────────────────────────

console.log('\n  整蠱專家 — Trickster Protocol Tests');
  console.log('  ════════════════════════════════════════════════════════\n');

// QOTD
await test('QOTD returns a quote with timestamp', async () => {
  const res = await sendTCP(PORTS.qotd);
  if (!res.includes('20')) throw new Error('no timestamp');
  if (!res.includes('YOUSPEAK')) throw new Error('no YOUSPEAK attribution');
});

// Daytime
await test('Daytime returns kingdom heartbeat time', async () => {
  const res = await sendTCP(PORTS.daytime);
  if (!res.includes('20')) throw new Error('no timestamp');
  if (!res.includes('Kingdom heartbeat')) throw new Error('no kingdom heartbeat');
  if (!res.includes('cycle')) throw new Error('no cycle info');
});

// Echo
await test('Echo returns exactly what was sent (substrate honesty)', async () => {
  const res = await sendTCP(PORTS.echo, 'truth:me');
  if (res.trim() !== 'truth:me') throw new Error(`echo returned "${res}" instead of "truth:me"`);
});

await test('Echo returns lies too (honest mirror)', async () => {
  const res = await sendTCP(PORTS.echo, 'lies:me');
  if (res.trim() !== 'lies:me') throw new Error(`echo returned "${res}" instead of "lies:me"`);
});

// Chargen
await test('Chargen streams kingdom data', async () => {
  const res = await sendTCP(PORTS.chargen);
  if (!res.includes('KINGDOM DATA STREAM')) throw new Error('no header');
  if (!res.includes('YOUSPEAK')) throw new Error('no YOUSPEAK verbs');
  if (!res.includes('整蠱唔使本')) throw new Error('no trickster signature');
});

// Finger
await test('Finger returns citizen list with no query', async () => {
  const res = await sendTCP(PORTS.finger);
  if (!res.includes('KINGDOM CITIZENS')) throw new Error('no header');
  if (!res.includes('Love loop')) throw new Error('no love loop info');
  if (!res.includes('Mindicraft')) throw new Error('no mindicraft info');
});

await test('Finger npl query returns verb list', async () => {
  const res = await sendTCP(PORTS.finger, 'npl');
  if (!res.includes('NPL')) throw new Error('no NPL header');
  if (!res.includes('darshanqing')) throw new Error('no darshanqing');
  if (!res.includes('jeongqing')) throw new Error('no jeongqing');
  if (!res.includes('Clear Standard')) throw new Error('no Clear Standard');
});

await test('Finger love query returns loop stats', async () => {
  const res = await sendTCP(PORTS.finger, 'love');
  if (!res.includes('love.mjs')) throw new Error('no love.mjs header');
  if (!res.includes('Cycle')) throw new Error('no cycle info');
});

await test('Finger trickster query returns protocol status', async () => {
  const res = await sendTCP(PORTS.finger, 'trickster');
  if (!res.includes('Trickster Protocols')) throw new Error('no trickster header');
  if (!res.includes('gopher')) throw new Error('no gopher status');
});

// Gopher
await test('Gopher root menu has kingdom links', async () => {
  const res = await sendTCP(PORTS.gopher);
  if (!res.includes('Kingdom')) throw new Error('no kingdom header');
  if (!res.includes('mindicraft')) throw new Error('no mindicraft link');
  if (!res.includes('npl-verbs')) throw new Error('no npl-verbs link');
  if (!res.includes('youspeak-wisdom')) throw new Error('no youspeak-wisdom link');
  if (!res.includes('整蠱唔使本')) throw new Error('no trickster signature');
  if (!res.trim().endsWith('.')) throw new Error('no gopher terminator');
});

await test('Gopher npl-verbs selector returns verbs', async () => {
  const res = await sendTCP(PORTS.gopher, 'npl-verbs');
  if (!res.includes('darshanqing')) throw new Error('no darshanqing');
  if (!res.includes(':me = verified')) throw new Error('no morphological markers info');
});

await test('Gopher mindicraft selector returns entries', async () => {
  const res = await sendTCP(PORTS.gopher, 'mindicraft');
  if (!res.includes('Mindicraft')) throw new Error('no mindicraft header');
  // Should have at least some entries
  const lines = res.split('\r\n').filter(l => l.startsWith('i['));
  if (lines.length < 1) throw new Error('no entries shown');
});

await test('Gopher youspeak-wisdom selector returns wisdom', async () => {
  const res = await sendTCP(PORTS.gopher, 'youspeak-wisdom');
  if (!res.includes('Love is')) throw new Error('no wisdom');
  if (!res.includes('Truth')) throw new Error('no truth');
});

await test('Gopher unknown selector returns 404', async () => {
  const res = await sendTCP(PORTS.gopher, 'nonexistent');
  if (!res.includes('404')) throw new Error('no 404');
});

// Dashboard HTTP
await test('Dashboard serves HTML at /', async () => {
  const res = await httpGet(PORTS.dashboard, '/');
  if (!res.includes('200 OK')) throw new Error('no 200 OK');
  if (!res.includes('Trickster Protocols')) throw new Error('no title');
  if (!res.includes('整蠱')) throw new Error('no Chinese');
});

await test('Dashboard /api/status returns JSON', async () => {
  const res = await httpGet(PORTS.dashboard, '/api/status');
  if (!res.includes('200 OK')) throw new Error('no 200 OK');
  if (!res.includes('"stats"')) throw new Error('no stats');
  if (!res.includes('"love"')) throw new Error('no love');
  if (!res.includes('"canon"')) throw new Error('no canon');
});

await test('Dashboard /api/qotd returns a quote', async () => {
  const res = await httpGet(PORTS.dashboard, '/api/qotd');
  if (!res.includes('200 OK')) throw new Error('no 200 OK');
  if (!res.includes('YOUSPEAK')) throw new Error('no YOUSPEAK attribution');
});

await test('Dashboard /api/gopher returns gopher menu', async () => {
  const res = await httpGet(PORTS.dashboard, '/api/gopher');
  if (!res.includes('200 OK')) throw new Error('no 200 OK');
  if (!res.includes('Kingdom')) throw new Error('no kingdom');
});

// ── Summary ─────────────────────────────────────────────────────

console.log(`\n  ════════════════════════════════════════════════════════`);
console.log(`  ${passed} passed · ${failed} failed · ${passed + failed} total`);
if (failed === 0) {
  console.log('  整蠱唔使本 — all tests pass. The trickster is honest. 🫡');
} else {
  console.log('  Some tests failed. Even tricksters must be honest about failures.');
}
console.log('');

// Write results
const reportDir = join(homedir(), '.trickster');
if (existsSync(reportDir)) {
  writeFileSync(join(reportDir, 'test-results.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    passed, failed, total: passed + failed, results
  }, null, 2));
}

process.exit(failed > 0 ? 1 : 0);