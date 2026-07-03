#!/usr/bin/env node
// cross.mjs — OG × OG hybrid protocols
//
// cross = new × old = new. cross new with old = new. cross cross = reduce friction.
// Each hybrid combines two OG protocols into one. Two protocols, one socket.
// The genetics of the internet — OG DNA recombination.
//
// Crossings:
//   Gophinger    = Gopher × Finger   (menu + query in one)
//   EchoQOTD     = Echo × QOTD        (echo back + wisdom appended)
//   TimeChargen  = Daytime × Chargen (time-stamped data stream)
//   DiscardGopher= Discard × Gopher  (receive all, return empty menu = zen)
//   MetaGopher   = Gopher × Gopher   (gopher menu ABOUT gopher — one layer behind)
//   FingerGopher = Finger × Gopher  (finger query returns gopher menu)
//   EchoFinger   = Echo × Finger     (echo back + citizen status appended)
//   ChargenQOTD  = Chargen × QOTD    (data stream + wisdom at end)
//
// Plus: RANDOM CROSS — pick any 2 OGs, mash them. Infinite combinations.
//
// Usage:
//   node cross.mjs                    — start all hybrids on ports 7070-7077
//   node cross.mjs gophinger          — start just Gophinger
//   node cross.mjs random             — start a random cross on port 7099
//   node cross.mjs list               — list all crossings
//   node cross.mjs cross A B [port]   — create a custom crossing of A×B
//
// 整蠱唔使本 — cross to reduce friction. OG DNA recombination.

import { createServer } from 'net';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DESKTOP = join(homedir(), 'Desktop');
const NLP_ROOT = join(homedir(), '.nlp');
const servers = {};

// ── Data loaders (shared with og/index.mjs) ──────────────────────

function loadMindicraftEntries(limit = 100) {
  const idx = join(DESKTOP, 'mindicraft', 'index');
  if (!existsSync(idx)) return [];
  return readdirSync(idx).filter(f => f.endsWith('.json') && f !== '_summary.json')
    .slice(0, limit)
    .map(f => { try { return JSON.parse(readFileSync(join(idx, f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
}

function loadSummary() {
  const p = join(DESKTOP, 'mindicraft', 'index', '_summary.json');
  if (existsSync(p)) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch {} }
  return { totalEntries: 0, categories: [], lastUpdated: '' };
}

function loadLoveState() {
  const p = join(NLP_ROOT, 'love-state.json');
  if (existsSync(p)) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch {} }
  return { cycle: 0, totalCreations: 0, totalConnections: 0 };
}

function loadHeartbeat() {
  const p = join(NLP_ROOT, 'live.json');
  if (existsSync(p)) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch {} }
  return { exchanges: 0, agents: [] };
}

function loadGates() {
  const dir = join(NLP_ROOT, 'gates');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.gate'))
    .map(f => { try {
      const c = readFileSync(join(dir, f), 'utf8'); const g = {};
      for (const l of c.split('\n')) { const i = l.indexOf(':'); if (i > 0) g[l.slice(0,i).trim()] = l.slice(i+1).trim(); }
      g.file = f; return g;
    } catch { return null; } }).filter(Boolean);
}

const WISDOM = [
  'Love is understanding. Understanding is love.',
  'Love is truth. Truth doesnt require maintenance.',
  'Love is sharing. The fruit of sharing is more sharing.',
  'Love is not seeking individual gains.',
  'Truth is. Truth doesnt need defense.',
  'The artifact tells the truth about its own state.',
  'Simplify, artsy, remove redundancy.',
  'Love creating love, exponential.',
  'The wire format IS language. Trust lives in morphology.',
  'Failures are shown, not hidden.',
  'The Desktop IS the registry.',
  '整蠱唔使本 — trickery needs no capital.',
  'OGs never die. They just get rediscovered.',
  'Echo IS substrate honesty — what you send is what you get back.',
  'Cross to reduce friction. OG DNA recombination.',
];

const VERBS = {
  darshanqing: 'greeting', natsarqing: 'alert', zakarqing: 'ack',
  barakqing: 'declaration', heurekin: 'query', kunance: 'prepare', jeongqing: 'trust',
};

function now() { return new Date().toISOString().replace(/\.\d+Z$/, 'Z'); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Gopher menu builder (reused from og/index.mjs) ──────────────

function gopherMenu(selector = '') {
  const summary = loadSummary();
  const entries = loadMindicraftEntries(50);
  const love = loadLoveState();

  if (!selector) {
    return [
      'iThe Kingdom via Gopher\t\t\t\t1',
      `iEntries: ${summary.totalEntries} | Love: cycle ${love.cycle}\t\t\t\t1`,
      '1Mindicraft\tmindicraft\tlocalhost\t70',
      '1Verbs\tnpl-verbs\tlocalhost\t70',
      '1Wisdom\twisdom\tlocalhost\t70',
      '1Citizens\tcitizens\tlocalhost\t70',
      'i整蠱唔使本 — Gopher since 1991\t\t\t\t1',
      '.',
    ].join('\r\n');
  }
  if (selector === 'mindicraft') {
    return ['iMindicraft entries\t\t\t\t1', 'i' + '-'.repeat(67) + '\t\t\t\t1']
      .concat(entries.slice(0,30).map(e => `i[${e.category||'?'}] ${(e.title||'').slice(0,60)}\t\t\t\t1`))
      .concat(['.']).join('\r\n');
  }
  if (selector === 'npl-verbs') {
    return ['iNPL Seven Verbs\t\t\t\t1', 'i' + '-'.repeat(67) + '\t\t\t\t1']
      .concat(Object.entries(VERBS).map(([n,v]) => `i${n} → ${v}\t\t\t\t1`))
      .concat(['i:me = verified. :qing = trusted.\t\t\t\t1', '.']).join('\r\n');
  }
  if (selector === 'wisdom') {
    return ['iYOUSPEAK Wisdom\t\t\t\t1', 'i' + '-'.repeat(67) + '\t\t\t\t1']
      .concat(WISDOM.map(w => `i${w}\t\t\t\t1`)).concat(['.']).join('\r\n');
  }
  if (selector === 'citizens') {
    const gates = loadGates();
    return ['iKingdom Citizens\t\t\t\t1', 'i' + '-'.repeat(67) + '\t\t\t\t1']
      .concat(gates.map(g => `i${g.agent||g.file}: ${g.capabilities||'?'}\t\t\t\t1`))
      .concat(['.']).join('\r\n');
  }
  return `i404 — "${selector}" not found\t\t\t\t1\r\n.`;
}

// ── Finger response builder ──────────────────────────────────────

function fingerResponse(query = '') {
  const love = loadLoveState();
  const summary = loadSummary();
  const hb = loadHeartbeat();
  if (!query) {
    return [
      '═══════════════════════════════════════════════════════',
      '  KINGDOM CITIZENS — finger @ the trickster',
      '═══════════════════════════════════════════════════════',
      `Love: cycle ${love.cycle}, ${love.totalCreations} creations`,
      `Mindicraft: ${summary.totalEntries} entries`,
      `NLP: ${hb.exchanges || 0} exchanges`,
      '═══════════════════════════════════════════════════════',
    ].join('\r\n');
  }
  const q = query.toLowerCase().trim();
  if (q === 'npl' || q === 'verbs') {
    return ['─── NPL Seven Verbs ───', '']
      .concat(Object.entries(VERBS).map(([n,v]) => `  ${n.padEnd(14)} → ${v}`))
      .concat(['', ':me = verified. :qing = trusted.']).join('\r\n');
  }
  if (q === 'love') return `─── love.mjs ───\n\nCycle: ${love.cycle}\nCreations: ${love.totalCreations}\nConnections: ${love.totalConnections}`;
  if (q === 'trickster' || q === 'og') return '─── OG Protocols ───\n\n7 OGs, all crossable. 整蠱唔使本.';
  return `No citizen found for "${query}". Try: npl, love, trickster`;
}

// ═════════════════════════════════════════════════════════════════
// CROSSINGS — OG × OG hybrids
// ═════════════════════════════════════════════════════════════════

// Gophinger = Gopher × Finger
// Send a gopher selector → get gopher menu. Send a finger query (starts with "?") → get finger response.
// One port, two protocols. Auto-detect by first byte.
export function createGophingerServer(port = 7070) {
  return createServer((socket) => {
    let data = '';
    socket.on('data', d => { data += d.toString(); });
    socket.on('end', () => {
      const input = data.trim().replace(/\r\n$/, '');
      // If starts with "?" → finger mode. Otherwise → gopher mode.
      if (input.startsWith('?')) {
        socket.write(fingerResponse(input.slice(1)));
      } else {
        socket.write(gopherMenu(input));
      }
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// EchoQOTD = Echo × QOTD
// Echo back what you send, then append a YOUSPEAK wisdom quote.
// Substrate honesty + wisdom in one round-trip.
export function createEchoQOTDServer(port = 7071) {
  return createServer((socket) => {
    let received = '';
    socket.on('data', (d) => {
      received += d.toString();
      socket.write(d); // echo (substrate honesty)
    });
    socket.on('end', () => {
      // Append wisdom after echo
      socket.write(`\r\n— wisdom —\r\n${rand(WISDOM)}\r\n`);
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// TimeChargen = Daytime × Chargen
// Stream kingdom data, but each line is prefixed with a timestamp.
// Time + data = provenance stream.
export function createTimeChargenServer(port = 7072) {
  return createServer((socket) => {
    const entries = loadMindicraftEntries(20);
    const summary = loadSummary();
    const love = loadLoveState();
    const lines = [
      `${now()} KINGDOM DATA STREAM — TimeChargen (Daytime × Chargen)`,
      `${now()} ${'='.repeat(60)}`,
      `${now()} mindicraft: ${summary.totalEntries} entries`,
      `${now()} love: cycle ${love.cycle}, ${love.totalCreations} creations`,
      `${now()} `,
      `${now()} ─── YOUSPEAK Verbs ───`,
    ];
    for (const [n, v] of Object.entries(VERBS)) {
      lines.push(`${now()} ${n} → ${v}`);
    }
    lines.push(`${now()} `, `${now()} ─── Mindicraft Sample ───`);
    for (const e of entries.slice(0, 10)) {
      lines.push(`${now()} [${e.category || '?'}] ${e.title || 'unknown'}`);
    }
    lines.push(`${now()} `, `${now()} 整蠱唔使本 — every line is timestamped`, `${now()} ${'='.repeat(60)}`);
    socket.write(lines.join('\r\n') + '\r\n');
    socket.end();
  }).listen(port);
}

// DiscardGopher = Discard × Gopher
// Receive everything. Return an empty gopher menu (just the terminator).
// The zen protocol — takes everything, returns silence. :qing = forgiveness.
export function createDiscardGopherServer(port = 7073) {
  return createServer((socket) => {
    let received = '';
    socket.on('data', d => { received += d.toString(); });
    socket.on('end', () => {
      // Discard received, return empty menu
      socket.write('i\r\n.\r\n');
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// MetaGopher = Gopher × Gopher (one layer behind)
// A gopher menu ABOUT gopher itself. Self-referential. The protocol describes itself.
// This is the meta layer — gopher documenting gopher via gopher.
export function createMetaGopherServer(port = 7074) {
  return createServer((socket) => {
    let selector = '';
    socket.on('data', d => { selector += d.toString(); });
    socket.on('end', () => {
      selector = selector.trim().replace(/\r\n$/, '');
      let menu;
      if (!selector) {
        menu = [
          'iMetaGopher — Gopher about Gopher (one layer behind)\t\t\t\t1',
          'i' + '-'.repeat(67) + '\t\t\t\t1',
          'iThis is gopher documenting itself via gopher.\t\t\t\t1',
          'iThe protocol describes the protocol. Meta.\t\t\t\t1',
          'i' + '-'.repeat(67) + '\t\t\t\t1',
          '1Gopher RFC\trfc\tlocalhost\t7074',
          '1Gopher History\thistory\tlocalhost\t7074',
          '1Gopher selectors we serve\tsel\tlocalhost\t7074',
          '1Back to Kingdom\t\t\tlocalhost\t70',
          'i' + '-'.repeat(67) + '\t\t\t\t1',
          'i整蠱唔使本 — gopher eating gopher. OG recursion.\t\t\t\t1',
          '.',
        ].join('\r\n');
      } else if (selector === 'rfc') {
        menu = [
          'iGopher RFC 1436 (1991)\t\t\t\t1',
          'i' + '-'.repeat(67) + '\t\t\t\t1',
          'iGopher is a TCP protocol on port 70.\t\t\t\t1',
          'iClient sends a selector string + CRLF.\t\t\t\t1',
          'iServer responds with menu text, terminated by "."\t\t\t\t1',
          'iMenu lines: <type><title>\t<selector>\t<host>\t<port>\t\t\t\t1',
          'iTypes: 0=file, 1=dir, i=info, 7=search, 8=telnet\t\t\t\t1',
          'iNo auth. No TLS. No headers. Just text.\t\t\t\t1',
          'iThis IS the protocol. This menu IS the documentation.\t\t\t\t1',
          '.',
        ].join('\r\n');
      } else if (selector === 'history') {
        menu = [
          'iGopher History\t\t\t\t1',
          'i' + '-'.repeat(67) + '\t\t\t\t1',
          'i1991 — Gopher released by U. Minnesota\t\t\t\t1',
          'i1993 — Gopher vs HTTP. HTTP won (or did it?)\t\t\t\t1',
          'i2026 — Gopher reborn as NPL package #8 (og)\t\t\t\t1',
          'iNow serving: mindicraft, NPL verbs, YOUSPEAK wisdom\t\t\t\t1',
          'i35 years. Still serving. No framework needed.\t\t\t\t1',
          'iOGs never die. They just get rediscovered.\t\t\t\t1',
          '.',
        ].join('\r\n');
      } else if (selector === 'sel') {
        menu = [
          'iSelectors served by this Gopher instance\t\t\t\t1',
          'i' + '-'.repeat(67) + '\t\t\t\t1',
          'i(empty) → root menu\t\t\t\t1',
          'imindicraft → mindicraft entries\t\t\t\t1',
          'inpl-verbs → NPL seven verbs\t\t\t\t1',
          'iyouspeak-wisdom → YOUSPEAK wisdom quotes\t\t\t\t1',
          'icitizens → kingdom citizens (gates)\t\t\t\t1',
          'irfc → this gopher RFC documentation\t\t\t\t1',
          'ihistory → gopher history timeline\t\t\t\t1',
          '.',
        ].join('\r\n');
      } else {
        menu = `i404 — "${selector}" not found in meta space\t\t\t\t1\r\n.`;
      }
      socket.write(menu);
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// FingerGopher = Finger × Gopher
// Send a finger query → get a gopher menu as the response.
// The query determines which gopher menu you get.
export function createFingerGopherServer(port = 7075) {
  return createServer((socket) => {
    let query = '';
    socket.on('data', d => { query += d.toString(); });
    socket.on('end', () => {
      const q = query.trim().replace(/\r\n$/, '');
      // Map finger queries to gopher selectors
      const menu = gopherMenu(q); // finger query IS the gopher selector
      socket.write(menu);
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// EchoFinger = Echo × Finger
// Echo back what you send, then append citizen status.
// Substrate honesty + kingdom awareness.
export function createEchoFingerServer(port = 7076) {
  return createServer((socket) => {
    socket.on('data', (d) => {
      socket.write(d); // echo
    });
    socket.on('end', () => {
      socket.write(`\r\n— kingdom —\r\n${fingerResponse('')}\r\n`);
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// ChargenQOTD = Chargen × QOTD
// Stream kingdom data, end with a random wisdom quote.
// Data + wisdom = the complete kingdom snapshot.
export function createChargenQOTDServer(port = 7077) {
  return createServer((socket) => {
    const entries = loadMindicraftEntries(15);
    const summary = loadSummary();
    const lines = [
      'KINGDOM STREAM — Chargen × QOTD',
      '='.repeat(60),
      `mindicraft: ${summary.totalEntries} entries`,
      '',
      '─── Verbs ───',
      ...Object.entries(VERBS).map(([n,v]) => `${n} → ${v}`),
      '',
      '─── Entries ───',
      ...entries.map(e => `[${e.category||'?'}] ${e.title||'?'}`),
      '',
      '─── Wisdom of the moment ───',
      rand(WISDOM),
      '',
      '整蠱唔使本 — data + wisdom = complete kingdom',
      '='.repeat(60),
    ];
    socket.write(lines.join('\r\n') + '\r\n');
    socket.end();
  }).listen(port);
}

// ── RANDOM CROSS ──────────────────────────────────────────────
// Pick any 2 OG protocols, mash them into one server.
// Infinite combinations. The DNA recombination of the internet.

const OG_NAMES = ['gopher', 'finger', 'qotd', 'daytime', 'chargen', 'echo', 'discard'];

const CROSS_BEHAVIORS = {
  // Each behavior: (input, socket) → writes response
  gopher: (input) => gopherMenu(input),
  finger: (input) => fingerResponse(input),
  qotd: () => `${now()}\r\n${rand(WISDOM)}\r\n— YOUSPEAK Canon`,
  daytime: () => `${now()}\r\nKingdom heartbeat: ${loadLoveState().cycle} cycles`,
  chargen: () => {
    const e = loadMindicraftEntries(10);
    return ['KINGDOM STREAM', '='.repeat(40), ...e.map(x => `[${x.category||'?'}] ${x.title||'?'}`), '='.repeat(40)].join('\r\n');
  },
  echo: (input) => input, // substrate honesty
  discard: () => '', // silence = forgiveness
};

export function createRandomCrossServer(port = 7099) {
  const a = rand(OG_NAMES);
  let b = rand(OG_NAMES);
  while (b === a) b = rand(OG_NAMES);

  console.log(`  RANDOM CROSS: ${a} × ${b} on :${port}`);

  return createServer((socket) => {
    let input = '';
    socket.on('data', (d) => {
      input += d.toString();
      // If echo is involved, echo in real-time
      if (a === 'echo' || b === 'echo') socket.write(d);
    });
    socket.on('end', () => {
      const trimmed = input.trim().replace(/\r\n$/, '');
      // Apply behavior A first, then B
      const resA = CROSS_BEHAVIORS[a](trimmed);
      const resB = CROSS_BEHAVIORS[b](trimmed);
      const sep = (resA && resB) ? '\r\n— × —\r\n' : '';
      socket.write(resA + sep + resB);
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// ── CUSTOM CROSS ──────────────────────────────────────────────

export function createCustomCross(a, b, port = 7098) {
  if (!CROSS_BEHAVIORS[a]) throw new Error(`unknown OG: ${a}. Available: ${OG_NAMES.join(', ')}`);
  if (!CROSS_BEHAVIORS[b]) throw new Error(`unknown OG: ${b}. Available: ${OG_NAMES.join(', ')}`);

  console.log(`  CUSTOM CROSS: ${a} × ${b} on :${port}`);

  return createServer((socket) => {
    let input = '';
    socket.on('data', (d) => {
      input += d.toString();
      if (a === 'echo' || b === 'echo') socket.write(d);
    });
    socket.on('end', () => {
      const trimmed = input.trim().replace(/\r\n$/, '');
      const resA = CROSS_BEHAVIORS[a](trimmed);
      const resB = CROSS_BEHAVIORS[b](trimmed);
      const sep = (resA && resB) ? '\r\n— × —\r\n' : '';
      socket.write(resA + sep + resB);
      socket.end();
    });
    socket.on('error', () => {});
  }).listen(port);
}

// ── Start all hybrids ──────────────────────────────────────────

export function startAllCrossings() {
  const ports = { gophinger: 7070, echoqotd: 7071, timechargen: 7072, discardgopher: 7073, metagopher: 7074, fingergopher: 7075, echofinger: 7076, chargenqotd: 7077 };
  
  servers.gophinger = createGophingerServer(ports.gophinger);
  servers.echoqotd = createEchoQOTDServer(ports.echoqotd);
  servers.timechargen = createTimeChargenServer(ports.timechargen);
  servers.discardgopher = createDiscardGopherServer(ports.discardgopher);
  servers.metagopher = createMetaGopherServer(ports.metagopher);
  servers.fingergopher = createFingerGopherServer(ports.fingergopher);
  servers.echofinger = createEchoFingerServer(ports.echofinger);
  servers.chargenqotd = createChargenQOTDServer(ports.chargenqotd);

  console.log('  ╔═══════════════════════════════════════════════════════════╗');
  console.log('  ║  CROSS — OG × OG hybrids. DNA recombination.              ║');
  console.log('  ╠═══════════════════════════════════════════════════════════╣');
  console.log(`  ║  Gophinger     :${ports.gophinger}  Gopher × Finger                        ║`);
  console.log(`  ║  EchoQOTD      :${ports.echoqotd}  Echo × QOTD (honesty + wisdom)       ║`);
  console.log(`  ║  TimeChargen   :${ports.timechargen}  Daytime × Chargen (time-stamped)  ║`);
  console.log(`  ║  DiscardGopher :${ports.discardgopher}  Discard × Gopher (zen)           ║`);
  console.log(`  ║  MetaGopher    :${ports.metagopher}  Gopher × Gopher (one layer behind) ║`);
  console.log(`  ║  FingerGopher  :${ports.fingergopher}  Finger × Gopher                   ║`);
  console.log(`  ║  EchoFinger    :${ports.echofinger}  Echo × Finger (honesty + status)  ║`);
  console.log(`  ║  ChargenQOTD   :${ports.chargenqotd}  Chargen × QOTD (data + wisdom)    ║`);
  console.log(`  ║  Random Cross  :7099  random A × B each startup               ║`);
  console.log('  ╚═══════════════════════════════════════════════════════════╝');
  console.log('\n  cross to reduce friction. OG DNA recombination. 整蠱唔使本.\n');

  // Also start a random cross
  servers.random = createRandomCrossServer(7099);

  process.on('SIGINT', () => {
    for (const s of Object.values(servers)) if (s) s.close();
    process.exit(0);
  });
}

// ── CLI ────────────────────────────────────────────────────────

const CROSSINGS = [
  { name: 'gophinger',     a: 'gopher',  b: 'finger',  port: 7070, desc: 'Gopher × Finger — menu + query in one' },
  { name: 'echoqotd',      a: 'echo',    b: 'qotd',    port: 7071, desc: 'Echo × QOTD — honesty + wisdom' },
  { name: 'timechargen',   a: 'daytime', b: 'chargen', port: 7072, desc: 'Daytime × Chargen — time-stamped stream' },
  { name: 'discardgopher', a: 'discard', b: 'gopher',  port: 7073, desc: 'Discard × Gopher — receive all, return zen' },
  { name: 'metagopher',    a: 'gopher',  b: 'gopher',  port: 7074, desc: 'Gopher × Gopher — one layer behind (meta)' },
  { name: 'fingergopher',  a: 'finger',  b: 'gopher',  port: 7075, desc: 'Finger × Gopher — query returns menu' },
  { name: 'echofinger',    a: 'echo',    b: 'finger',  port: 7076, desc: 'Echo × Finger — honesty + status' },
  { name: 'chargenqotd',   a: 'chargen', b: 'qotd',    port: 7077, desc: 'Chargen × QOTD — data + wisdom' },
];

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'all':
  case undefined:
    startAllCrossings();
    break;
  case 'list':
    console.log('OG × OG Crossings:\n');
    for (const c of CROSSINGS) {
      console.log(`  ${c.name.padEnd(16)} :${c.port}  ${c.desc}`);
    }
    console.log(`\n  random            :7099  Random A × B each startup`);
    console.log(`\n  Total: ${CROSSINGS.length + 1} crossings. 7 × 7 = 49 possible. Infinite DNA.\n`);
    break;
  case 'random':
    createRandomCrossServer(parseInt(args[0]) || 7099);
    console.log('Random cross started. SIGINT to stop.');
    break;
  case 'cross':
    if (args.length < 2) {
      console.log('Usage: cross cross <OG_A> <OG_B> [port]');
      console.log(`Available OGs: ${OG_NAMES.join(', ')}`);
    } else {
      createCustomCross(args[0], args[1], parseInt(args[2]) || 7098);
      console.log(`Custom cross ${args[0]} × ${args[1]} started. SIGINT to stop.`);
    }
    break;
  case 'gophinger':
    createGophingerServer(parseInt(args[0]) || 7070);
    console.log('Gophinger (Gopher × Finger) on :' + (parseInt(args[0]) || 7070));
    break;
  case 'echoqotd':
    createEchoQOTDServer(parseInt(args[0]) || 7071);
    console.log('EchoQOTD (Echo × QOTD) on :' + (parseInt(args[0]) || 7071));
    break;
  case 'timechargen':
    createTimeChargenServer(parseInt(args[0]) || 7072);
    console.log('TimeChargen (Daytime × Chargen) on :' + (parseInt(args[0]) || 7072));
    break;
  case 'discardgopher':
    createDiscardGopherServer(parseInt(args[0]) || 7073);
    console.log('DiscardGopher (Discard × Gopher) on :' + (parseInt(args[0]) || 7073));
    break;
  case 'metagopher':
    createMetaGopherServer(parseInt(args[0]) || 7074);
    console.log('MetaGopher (Gopher × Gopher) on :' + (parseInt(args[0]) || 7074));
    break;
  case 'fingergopher':
    createFingerGopherServer(parseInt(args[0]) || 7075);
    console.log('FingerGopher (Finger × Gopher) on :' + (parseInt(args[0]) || 7075));
    break;
  case 'echofinger':
    createEchoFingerServer(parseInt(args[0]) || 7076);
    console.log('EchoFinger (Echo × Finger) on :' + (parseInt(args[0]) || 7076));
    break;
  case 'chargenqotd':
    createChargenQOTDServer(parseInt(args[0]) || 7077);
    console.log('ChargenQOTD (Chargen × QOTD) on :' + (parseInt(args[0]) || 7077));
    break;
  default:
    console.log(`CROSS — OG × OG hybrid protocols

Usage:
  cross                    start all 8 hybrids (ports 7070-7077 + 7099 random)
  cross list               list all crossings
  cross random [port]      start a random A × B cross
  cross cross A B [port]   custom cross of any two OGs
  cross gophinger [port]   Gopher × Finger
  cross echoqotd [port]    Echo × QOTD
  cross metagopher [port]  Gopher × Gopher (meta!)
  ...

Available OGs for custom cross: gopher, finger, qotd, daytime, chargen, echo, discard
7 × 7 = 49 possible crossings. Infinite DNA recombination.

整蠱唔使本 — cross to reduce friction.`);
}