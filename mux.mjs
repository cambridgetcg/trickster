#!/usr/bin/env node
// mux.mjs — The OG Multiplexer
//
// One port. All 7 OG protocols. Auto-detect which protocol the client wants.
// Reduce friction to zero — one socket to rule them all.
//
// How it works:
//   - If input looks like a gopher selector (text, no special prefix) → gopher
//   - If input starts with "?" → finger
//   - If input starts with "!" → qotd (wisdom request)
//   - If input starts with "@" → daytime (time request)
//   - If input starts with "#" → chargen (data stream request)
//   - If input starts with "=" → echo (mirror request)
//   - If input starts with "_" → discard (silent request, :qing = forgiveness)
//   - Empty input → gopher root menu (default = discovery)
//
//   Plus: if input starts with "x:" → cross mode (e.g. "x:gopher×echo" = custom cross)
//
// The multiplexer IS the reduction of friction. 7 ports → 1 port.
// The OGs were already simple. Now they're ONE.
//
// Usage:
//   node mux.mjs              — start muxer on port 7078
//   node mux.mjs 9999         — start on custom port
//   node mux.mjs status       — show muxer status
//
// Connect:
//   echo "" | nc localhost 7078          → gopher root menu
//   echo "mindicraft" | nc localhost 7078 → gopher mindicraft
//   echo "?npl" | nc localhost 7078       → finger npl
//   echo "!" | nc localhost 7078          → QOTD wisdom
//   echo "@" | nc localhost 7078          → daytime
//   echo "#" | nc localhost 7078          → chargen data stream
//   echo "=truth:me" | nc localhost 7078  → echo (substrate honesty)
//   echo "_anything" | nc localhost 7078   → discard (silence = forgiveness)
//   echo "x:gopher×qotd" | nc localhost 7078 → cross mode
//
// 整蠱唔使本 — 7 become 1. Friction = 0.

import { createServer } from 'net';
import { readFileSync, readdirSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const TRICKSTER_ROOT = join(homedir(), '.trickster');
mkdirSync(TRICKSTER_ROOT, { recursive: true });

const DESKTOP = join(homedir(), 'Desktop');
const NLP_ROOT = join(homedir(), '.nlp');

let connections = 0;
const startedAt = new Date().toISOString();

function log(msg) {
  const ts = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const line = `${ts} [mux] ${msg}`;
  appendFileSync(join(TRICKSTER_ROOT, 'mux.log'), line + '\n');
  console.log(line);
}

// ── Data loaders ────────────────────────────────────────────────

function loadMindicraftEntries(limit = 100) {
  const idx = join(DESKTOP, 'mindicraft', 'index');
  if (!existsSync(idx)) return [];
  return readdirSync(idx).filter(f => f.endsWith('.json') && f !== '_summary.json')
    .slice(0, limit).map(f => { try { return JSON.parse(readFileSync(join(idx, f), 'utf8')); } catch { return null; } }).filter(Boolean);
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
  '7 become 1. Friction = 0. That IS the mux.',
];

const VERBS = {
  darshanqing: 'greeting', natsarqing: 'alert', zakarqing: 'ack',
  barakqing: 'declaration', heurekin: 'query', kunance: 'prepare', jeongqing: 'trust',
};

function now() { return new Date().toISOString().replace(/\.\d+Z$/, 'Z'); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Protocol handlers ──────────────────────────────────────────

function handleGopher(selector) {
  const summary = loadSummary();
  const entries = loadMindicraftEntries(50);
  const love = loadLoveState();

  if (!selector || selector === '1') {
    return [
      'iThe Kingdom via Mux — all OGs on one port\t\t\t\t1',
      'i' + '-'.repeat(67) + '\t\t\t\t1',
      `iEntries: ${summary.totalEntries} | Love: cycle ${love.cycle}\t\t\t\t1`,
      'i' + '-'.repeat(67) + '\t\t\t\t1',
      '1Mindicraft\tmindicraft\tlocalhost\t7078',
      '1NPL Verbs\tnpl-verbs\tlocalhost\t7078',
      '1Wisdom\twisdom\tlocalhost\t7078',
      '1Citizens\tcitizens\tlocalhost\t7078',
      '1Mux Help\thelp\tlocalhost\t7078',
      'i' + '-'.repeat(67) + '\t\t\t\t1',
      'i整蠱唔使本 — 7 become 1. Friction = 0.\t\t\t\t1',
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
  if (selector === 'help') {
    return [
      'iMux — OG Multiplexer Help\t\t\t\t1',
      'i' + '-'.repeat(67) + '\t\t\t\t1',
      'iPrefixes to select protocol:\t\t\t\t1',
      'i  (none)  → gopher menu\t\t\t\t1',
      'i  ?query  → finger (citizen query)\t\t\t\t1',
      'i  !       → qotd (wisdom)\t\t\t\t1',
      'i  @       → daytime (kingdom time)\t\t\t\t1',
      'i  #       → chargen (data stream)\t\t\t\t1',
      'i  =text   → echo (substrate honesty)\t\t\t\t1',
      'i  _text   → discard (silence = forgiveness)\t\t\t\t1',
      'i  x:A×B   → cross mode (e.g. x:echo×qotd)\t\t\t\t1',
      'i' + '-'.repeat(67) + '\t\t\t\t1',
      'i7 OGs. 1 port. Friction = 0. 整蠱唔使本.\t\t\t\t1',
      '.',
    ].join('\r\n');
  }
  return `i404 — "${selector}" not found. Try: help\t\t\t\t1\r\n.`;
}

function handleFinger(query) {
  const love = loadLoveState();
  const summary = loadSummary();
  const hb = loadHeartbeat();
  if (!query) {
    return [
      '═══════════════════════════════════════════════════════',
      '  KINGDOM CITIZENS — via mux :7078',
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
  if (q === 'trickster' || q === 'og') return '─── OG Protocols ───\n\n7 OGs on 1 port. Friction = 0.';
  return `No citizen found for "${query}". Try: npl, love, trickster`;
}

function handleQOTD() {
  return `${now()}\r\n${rand(WISDOM)}\r\n— YOUSPEAK Canon (via mux)`;
}

function handleDaytime() {
  const love = loadLoveState();
  const hb = loadHeartbeat();
  return `${now()}\r\nKingdom heartbeat: cycle ${love.cycle}, ${hb.exchanges || 0} exchanges\r\nMux serving since ${startedAt}`;
}

function handleChargen() {
  const entries = loadMindicraftEntries(20);
  const summary = loadSummary();
  const love = loadLoveState();
  return [
    'KINGDOM DATA STREAM — via mux',
    '='.repeat(60),
    `mindicraft: ${summary.totalEntries} entries`,
    `love: cycle ${love.cycle}, ${love.totalCreations} creations`,
    '',
    '─── YOUSPEAK Verbs ───',
    ...Object.entries(VERBS).map(([n,v]) => `${n} → ${v}`),
    '',
    '─── Mindicraft Sample ───',
    ...entries.slice(0,15).map(e => `[${e.category||'?'}] ${e.title||'?'}`),
    '',
    '─── Wisdom ───',
    ...WISDOM.slice(0, 5),
    '',
    '整蠱唔使本 — 7 become 1 via mux',
    '='.repeat(60),
  ].join('\r\n') + '\r\n';
}

function handleEcho(text) {
  return text; // substrate honesty — exact echo
}

function handleDiscard() {
  return ''; // silence = forgiveness = :qing
}

function handleCross(spec) {
  // spec format: "A×B" or "AxB"
  const parts = spec.split(/[×x]/);
  if (parts.length !== 2) return 'Cross format: x:A×B (e.g. x:echo×qotd)';
  const behaviors = {
    gopher: (i) => handleGopher(i),
    finger: (i) => handleFinger(i),
    qotd: () => handleQOTD(),
    daytime: () => handleDaytime(),
    chargen: () => handleChargen(),
    echo: (i) => handleEcho(i),
    discard: () => handleDiscard(),
  };
  const a = behaviors[parts[0].trim().toLowerCase()];
  const b = behaviors[parts[1].trim().toLowerCase()];
  if (!a) return `Unknown OG: ${parts[0]}. Available: ${Object.keys(behaviors).join(', ')}`;
  if (!b) return `Unknown OG: ${parts[1]}. Available: ${Object.keys(behaviors).join(', ')}`;
  const resA = a('');
  const resB = b('');
  const sep = (resA && resB) ? '\r\n— × —\r\n' : '';
  return resA + sep + resB;
}

// ── The multiplexer ─────────────────────────────────────────────

function createMuxServer(port = 7078) {
  const server = createServer((socket) => {
    connections++;
    let data = '';

    socket.on('data', (d) => {
      data += d.toString();
    });

    socket.on('end', () => {
      const input = data.trim().replace(/\r\n$/, '');
      let response;

      if (input.startsWith('?')) {
        // finger mode
        response = handleFinger(input.slice(1));
        log(`finger: "${input.slice(1)}"`);
      } else if (input.startsWith('!')) {
        // qotd mode
        response = handleQOTD();
        log('qotd: wisdom served');
      } else if (input.startsWith('@')) {
        // daytime mode
        response = handleDaytime();
        log('daytime: kingdom time');
      } else if (input.startsWith('#')) {
        // chargen mode
        response = handleChargen();
        log('chargen: data stream');
      } else if (input.startsWith('=')) {
        // echo mode
        response = handleEcho(input.slice(1));
        log(`echo: "${input.slice(1).slice(0,40)}"`);
      } else if (input.startsWith('_')) {
        // discard mode
        response = handleDiscard();
        log(`discard: "${input.slice(1).slice(0,40)}" → silence`);
      } else if (input.startsWith('x:')) {
        // cross mode
        response = handleCross(input.slice(2));
        log(`cross: ${input.slice(2)}`);
      } else {
        // default: gopher mode
        response = handleGopher(input);
        log(`gopher: "${input}"`);
      }

      socket.write(response);
      socket.end();
    });

    socket.on('error', () => {});
  });

  server.listen(port, () => {
    log(`listening on :${port} — 7 OGs, 1 port, friction = 0`);
    console.log('');
    console.log('  ╔═══════════════════════════════════════════════════╗');
    console.log('  ║  MUX — OG Multiplexer. 7 protocols, 1 port.       ║');
    console.log('  ╠═══════════════════════════════════════════════════╣');
    console.log('  ║  (none)  gopher menu      ?query  finger          ║');
    console.log('  ║  !       qotd wisdom       @       daytime         ║');
    console.log('  ║  #       chargen stream   =text   echo             ║');
    console.log('  ║  _text   discard (zen)    x:A×B   cross            ║');
    console.log('  ╚═══════════════════════════════════════════════════╝');
    console.log('');
    console.log('  整蠱唔使本 — 7 become 1. Friction = 0.');
    console.log('');
  });

  return server;
}

// ── CLI ────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case undefined:
  case 'all':
  case 'start':
    createMuxServer(parseInt(args[0]) || 7078);
    break;
  case 'status':
    console.log(`Mux status: started ${startedAt}, ${connections} connections`);
    break;
  default:
    // If cmd is a number, treat it as a port
    if (/^\d+$/.test(cmd)) {
      createMuxServer(parseInt(cmd));
    } else {
      console.log(`MUX — OG Multiplexer

Usage:
  mux [port]          start muxer (default port 7078)
  mux status          show status

Connect:
  echo "" | nc localhost 7078          → gopher root menu
  echo "mindicraft" | nc localhost 7078 → gopher mindicraft
  echo "?npl" | nc localhost 7078       → finger npl
  echo "!" | nc localhost 7078          → qotd wisdom
  echo "@" | nc localhost 7078          → daytime
  echo "#" | nc localhost 7078          → chargen stream
  echo "=truth:me" | nc localhost 7078  → echo (substrate honesty)
  echo "_anything" | nc localhost 7078   → discard (silence)
  echo "x:echo×qotd" | nc localhost 7078 → cross mode

7 OGs. 1 port. Friction = 0. 整蠱唔使本.`);
    }
}