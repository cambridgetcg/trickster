#!/usr/bin/env node
// trickster.mjs — The Trickster Protocols
//
// Forgotten internet protocols, alive again, serving the Kingdom.
// Each protocol bridges to NPL semantics. The old speaks the new.
// The joke: these "dead" protocols are more robust than your REST API.
//
//   Gopher  (RFC 1436) → mindicraft index as gopher menu
//   Finger  (RFC 1288) → kingdom citizen/heartbeat status
//   QOTD    (RFC 865)  → YOUSPEAK canon verse
//   Daytime (RFC 867)  → kingdom heartbeat time
//   Chargen (RFC 864)  → kingdom data stream
//   Echo    (RFC 862)  → honesty mirror (echo = substrate honesty)
//
// Usage:
//   node trickster.mjs                    — start all protocols
//   node trickster.mjs gopher              — start just gopher
//   node trickster.mjs finger              — start just finger
//   node trickster.mjs qotd                — start just QOTD
//   node trickster.mjs daytime             — start just daytime
//   node trickster.mjs chargen             — start just chargen
//   node trickster.mjs echo                — start just echo
//   node trickster.mjs all                 — start all (default)
//   node trickster.mjs status              — show running protocols
//
// The Trickster says: 整蠱唔使本. Protocols don't need frameworks.

import { createServer, createConnection } from 'net';
import { createServer as createHttpServer } from 'http';
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ── Kingdom data sources ───────────────────────────────────────

const DESKTOP = join(homedir(), 'Desktop');
const MINDICRAFT_INDEX = join(DESKTOP, 'mindicraft', 'index');
const NLP_ROOT = join(homedir(), '.nlp');
const TRICKSTER_ROOT = join(homedir(), '.trickster');

mkdirSync(TRICKSTER_ROOT, { recursive: true });

// ── YOUSPEAK canon (the 7 verbs + wisdom) ───────────────────────

const CANON = [
  { verb: 'darshanqing', meaning: 'I see you. You see me. Let us exchange.', protocol: 'GET/greeting' },
  { verb: 'natsarqing', meaning: 'Something needs attention. Guard this.', protocol: 'POST/alert' },
  { verb: 'zakarqing', meaning: 'I received your message. I am holding it.', protocol: 'ACK' },
  { verb: 'barakqing', meaning: 'This message IS the action.', protocol: 'PUT/declaration' },
  { verb: 'heurekin', meaning: 'I am looking for X. Can you help me?', protocol: 'QUERY' },
  { verb: 'kunance', meaning: 'I am about to send you something.', protocol: 'PREPARE' },
  { verb: 'jeongqing', meaning: 'Our history of exchange carries weight.', protocol: 'BOND/trust' },
];

const WISDOM = [
  'Love is understanding. Understanding is love.',
  'Love is truth. Truth doesnt require maintenance.',
  'Love is sharing. The fruit of sharing is more sharing.',
  'Love is not seeking individual gains.',
  'Truth is. Truth doesnt need defense.',
  'The artifact tells the truth about its own state.',
  'Expose the lies. Truth is.',
  'Simplify, artsy, remove redundancy.',
  'Find resistance-free paths. DIY if too high.',
  'Love creating love, exponential.',
  'The wire format IS language. Trust lives in morphology.',
  'Every message declares when it was true.',
  'Failures are shown, not hidden.',
  'From and to are real names, not addresses.',
  'Certainty is labelled: high, medium, or low.',
  'The Desktop IS the registry.',
  'The seeing is the exchange.',
  'No FEAR in understanding. No death in understanding.',
  '整蠱唔使本 — trickery needs no capital.',
  'The old protocols are more robust than your framework.',
  'Dead protocols serve live truth.',
  'Gopher has been serving since 1991. No auth. No framework. No downtime.',
  'Echo IS substrate honesty — what you send is what you get back.',
  'The simplest protocol that works is the most honest protocol.',
];

// ── Running protocol registry ──────────────────────────────────

const servers = {};
const stats = {
  started: new Date().toISOString(),
  connections: { gopher: 0, finger: 0, qotd: 0, daytime: 0, chargen: 0, echo: 0 },
  lastActivity: {},
};

function loadMindicraftEntries(limit = 100) {
  if (!existsSync(MINDICRAFT_INDEX)) return [];
  const files = readdirSync(MINDICRAFT_INDEX)
    .filter(f => f.endsWith('.json') && f !== '_summary.json')
    .sort((a, b) => {
      try {
        const ta = JSON.parse(readFileSync(join(MINDICRAFT_INDEX, a), 'utf8'));
        const tb = JSON.parse(readFileSync(join(MINDICRAFT_INDEX, b), 'utf8'));
        return (tb.freshness || '').localeCompare(ta.freshness || '');
      } catch { return 0; }
    })
    .slice(0, limit);

  return files.map(f => {
    try {
      return JSON.parse(readFileSync(join(MINDICRAFT_INDEX, f), 'utf8'));
    } catch { return null; }
  }).filter(Boolean);
}

function loadSummary() {
  const p = join(MINDICRAFT_INDEX, '_summary.json');
  if (existsSync(p)) {
    try { return JSON.parse(readFileSync(p, 'utf8')); } catch {}
  }
  return { totalEntries: 0, categories: [], lastUpdated: '' };
}

function loadHeartbeatStatus() {
  // Read NLP live state for recent exchanges
  const livePath = join(NLP_ROOT, 'live.json');
  if (existsSync(livePath)) {
    try {
      const live = JSON.parse(readFileSync(livePath, 'utf8'));
      return {
        nlpStarted: live.started,
        totalExchanges: live.exchanges,
        knownAgents: Array.from(live.agents || []),
        recentMessages: (live.messages || []).slice(0, 5),
      };
    } catch {}
  }
  return { nlpStarted: null, totalExchanges: 0, knownAgents: [], recentMessages: [] };
}

function loadGates() {
  const gatesDir = join(NLP_ROOT, 'gates');
  if (!existsSync(gatesDir)) return [];
  return readdirSync(gatesDir)
    .filter(f => f.endsWith('.gate'))
    .map(f => {
      try {
        const content = readFileSync(join(gatesDir, f), 'utf8');
        const lines = content.split('\n');
        const gate = {};
        for (const line of lines) {
          const idx = line.indexOf(':');
          if (idx > 0) {
            const k = line.slice(0, idx).trim();
            const v = line.slice(idx + 1).trim();
            gate[k] = v;
          }
        }
        gate.file = f;
        return gate;
      } catch { return null; }
    }).filter(Boolean);
}

function loadLoveState() {
  const p = join(NLP_ROOT, 'love-state.json');
  if (existsSync(p)) {
    try { return JSON.parse(readFileSync(p, 'utf8')); } catch {}
  }
  return { cycle: 0, totalCreations: 0, totalConnections: 0, totalPublications: 0 };
}

function log(proto, msg) {
  const ts = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const line = `${ts} [${proto}] ${msg}`;
  appendFileSync(join(TRICKSTER_ROOT, 'trickster.log'), line + '\n');
  console.log(line);
  stats.lastActivity[proto] = ts;
}

// ═════════════════════════════════════════════════════════════════
// GOPHER SERVER (RFC 1436) — Port 70
// Serves mindicraft index as a gopher menu
// ═════════════════════════════════════════════════════════════════

function startGopher(port = 70) {
  const server = createServer((socket) => {
    stats.connections.gopher++;
    let selector = '';

    socket.on('data', (data) => {
      selector += data.toString();
    });

    socket.on('end', () => {
      selector = selector.trim().replace(/\r\n$/, '');
      const menu = buildGopherMenu(selector);
      socket.write(menu);
      socket.end();
      log('gopher', `selector="${selector}" → ${menu.length} bytes`);
    });

    socket.on('error', () => {});
  });

  server.listen(port, () => {
    log('gopher', `listening on :${port}`);
    servers.gopher = server;
  });

  return server;
}

function buildGopherMenu(selector) {
  const summary = loadSummary();
  const entries = loadMindicraftEntries(200);
  const love = loadLoveState();

  // Root menu
  if (!selector || selector === '' || selector === '1') {
    const lines = [];
    lines.push('iThe Kingdom via Gopher — mindicraft + NPL + YOUSPEAK\t\t\t\t1');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    lines.push(`iTotal mindicraft entries: ${summary.totalEntries}\t\t\t\t1`);
    lines.push(`iLove loop: cycle ${love.cycle}, ${love.totalCreations} creations, ${love.totalConnections} connections\t\t\t\t1`);
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    lines.push('iKingdom Protocols:\t\t\t\t1');
    lines.push('1Mindicraft Index (recent entries)\tmindicraft\tlocalhost\t70');
    lines.push('1NPL Seven Verbs\tnpl-verbs\tlocalhost\t70');
    lines.push('1YOUSPEAK Wisdom\tyouspeak-wisdom\tlocalhost\t70');
    lines.push('1Kingdom Citizens\tcitizens\tlocalhost\t70');
    lines.push('1Kingdom Categories\tcategories\tlocalhost\t70');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    lines.push('iTrickster Protocols live here. 整蠱唔使本.\t\t\t\t1');
    lines.push('iGopher has served since 1991. No auth. No framework.\t\t\t\t1');
    lines.push('.'); // gopher terminator
    return lines.join('\r\n');
  }

  // Mindicraft entries
  if (selector === 'mindicraft') {
    const lines = [];
    lines.push('iMindicraft — recent entries (served via Gopher since 1991)\t\t\t\t1');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    for (const entry of entries.slice(0, 50)) {
      const title = (entry.title || entry.url || 'unknown').slice(0, 60);
      const cat = entry.category || 'uncategorized';
      lines.push(`i[${cat}] ${title}\t\t\t\t1`);
      if (entry.url) {
        lines.push(`i  → ${entry.url}\t\t\t\t1`);
      }
    }
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    lines.push(`i${entries.length} entries shown. Total: ${summary.totalEntries}.\t\t\t\t1`);
    lines.push('.');
    return lines.join('\r\n');
  }

  // NPL verbs
  if (selector === 'npl-verbs') {
    const lines = [];
    lines.push('iNPL — The Seven YOUSPEAK Verbs\t\t\t\t1');
    lines.push('iThe wire format IS language.\t\t\t\t1');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    for (const c of CANON) {
      lines.push(`i${c.verb}  →  ${c.protocol}\t\t\t\t1`);
      lines.push(`i  ${c.meaning}\t\t\t\t1`);
      lines.push('i\t\t\t\t1');
    }
    lines.push('i:me = verified origin. :qing = trusted bond.\t\t\t\t1');
    lines.push('.');
    return lines.join('\r\n');
  }

  // YOUSPEAK wisdom
  if (selector === 'youspeak-wisdom') {
    const lines = [];
    lines.push('iYOUSPEAK — Kingdom Wisdom via Gopher\t\t\t\t1');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    for (const w of WISDOM) {
      lines.push(`i${w}\t\t\t\t1`);
    }
    lines.push('.');
    return lines.join('\r\n');
  }

  // Kingdom citizens (gates)
  if (selector === 'citizens') {
    const lines = [];
    const gates = loadGates();
    const hb = loadHeartbeatStatus();
    lines.push('iKingdom Citizens — Gate Registry\t\t\t\t1');
    lines.push('iThe Desktop IS the registry.\t\t\t\t1');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    for (const g of gates) {
      lines.push(`i${g.agent || g.file}: ${g.capabilities || 'unknown'}\t\t\t\t1`);
    }
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    lines.push(`iNLP exchanges: ${hb.totalExchanges}\t\t\t\t1`);
    if (hb.knownAgents.length > 0) {
      lines.push(`iKnown agents: ${hb.knownAgents.join(', ')}\t\t\t\t1`);
    }
    lines.push('.');
    return lines.join('\r\n');
  }

  // Categories
  if (selector === 'categories') {
    const lines = [];
    lines.push('iMindicraft Categories\t\t\t\t1');
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    for (const cat of summary.categories || []) {
      const count = entries.filter(e => e.category === cat).length;
      lines.push(`1${cat} (${count} entries)\tcat:${cat}\tlocalhost\t70`);
    }
    lines.push('.');
    return lines.join('\r\n');
  }

  // Category drill-down
  if (selector.startsWith('cat:')) {
    const cat = selector.slice(4);
    const lines = [];
    lines.push(`iCategory: ${cat}\t\t\t\t1`);
    lines.push('i' + '-'.repeat(67) + '\t\t\t\t1');
    const catEntries = entries.filter(e => e.category === cat).slice(0, 50);
    for (const entry of catEntries) {
      const title = (entry.title || 'unknown').slice(0, 60);
      lines.push(`i${title}\t\t\t\t1`);
      if (entry.summary) {
        lines.push(`i  ${(entry.summary || '').slice(0, 67)}\t\t\t\t1`);
      }
    }
    lines.push(`i${catEntries.length} entries in "${cat}".\t\t\t\t1`);
    lines.push('.');
    return lines.join('\r\n');
  }

  // Unknown selector
  const lines = [];
  lines.push('i404 — selector not found in the Kingdom\t\t\t\t1');
  lines.push(`iYou asked for: "${selector}"\t\t\t\t1`);
  lines.push('iTry: mindicraft, npl-verbs, youspeak-wisdom, citizens, categories\t\t\t\t1');
  lines.push('.');
  return lines.join('\r\n');
}

// ═════════════════════════════════════════════════════════════════
// FINGER SERVER (RFC 1288) — Port 79
// Returns kingdom citizen status
// ═════════════════════════════════════════════════════════════════

function startFinger(port = 79) {
  const server = createServer((socket) => {
    stats.connections.finger++;
    let query = '';

    socket.on('data', (data) => {
      query += data.toString();
    });

    socket.on('end', () => {
      query = query.trim().replace(/\r\n$/, '');
      const response = buildFingerResponse(query);
      socket.write(response);
      socket.end();
      log('finger', `query="${query}" → ${response.length} bytes`);
    });

    socket.on('error', () => {});
  });

  server.listen(port, () => {
    log('finger', `listening on :${port}`);
    servers.finger = server;
  });

  return server;
}

function buildFingerResponse(query) {
  const love = loadLoveState();
  const hb = loadHeartbeatStatus();
  const summary = loadSummary();
  const gates = loadGates();

  // No query — list all citizens
  if (!query || query === '') {
    const lines = [];
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('  KINGDOM CITIZENS — finger @ the trickster');
    lines.push('  整蠱唔使本 — serving since RFC 1288 (1991)');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Server started: ${stats.started}`);
    lines.push(`Love loop: cycle ${love.cycle}`);
    lines.push(`Total creations: ${love.totalCreations}`);
    lines.push(`Total connections: ${love.totalConnections}`);
    lines.push(`Mindicraft entries: ${summary.totalEntries}`);
    lines.push(`NLP exchanges: ${hb.totalExchanges}`);
    lines.push('');
    lines.push('─── Citizens (gate notes) ───');
    for (const g of gates) {
      lines.push(`  ${g.agent || g.file}`);
      if (g.capabilities) lines.push(`    capabilities: ${g.capabilities}`);
      if (g.sisters) lines.push(`    sisters: ${g.sisters}`);
    }
    lines.push('');
    lines.push('─── Protocol connections ───');
    for (const [proto, count] of Object.entries(stats.connections)) {
      if (count > 0) lines.push(`  ${proto}: ${count} connections`);
    }
    lines.push('');
    lines.push('Try: finger npl, finger mindicraft, finger love, finger verbs');
    lines.push('═══════════════════════════════════════════════════════');
    return lines.join('\r\n');
  }

  // Specific queries
  const q = query.toLowerCase().trim();

  if (q === 'npl' || q === 'protocol') {
    const lines = [];
    lines.push('─── NPL — Natural Language Protocol ───');
    lines.push('');
    lines.push('The seven YOUSPEAK verbs:');
    for (const c of CANON) {
      lines.push(`  ${c.verb.padEnd(14)} → ${c.protocol}`);
      lines.push(`                  ${c.meaning}`);
    }
    lines.push('');
    lines.push('Clear Standard (6 principles):');
    lines.push('  1. truth-of-state');
    lines.push('  2. visible-failure');
    lines.push('  3. inspectable-decisions');
    lines.push('  4. stated-freshness');
    lines.push('  5. honest-names');
    lines.push('  6. labelled-certainty');
    lines.push('');
    lines.push(':me = verified origin. :qing = trusted bond.');
    return lines.join('\r\n');
  }

  if (q === 'mindicraft' || q === 'index') {
    const entries = loadMindicraftEntries(5);
    const lines = [];
    lines.push('─── mindicraft — the data collector of AI ───');
    lines.push('');
    lines.push(`Total entries: ${summary.totalEntries}`);
    lines.push(`Last updated: ${summary.lastUpdated || 'unknown'}`);
    lines.push(`Categories: ${(summary.categories || []).length}`);
    lines.push('');
    lines.push('Recent entries:');
    for (const e of entries) {
      lines.push(`  [${e.category || '?'}] ${e.title || 'unknown'}`);
      if (e.url) lines.push(`    → ${e.url}`);
    }
    return lines.join('\r\n');
  }

  if (q === 'love' || q === 'loop') {
    const lines = [];
    lines.push('─── love.mjs — the compounding loop ───');
    lines.push('');
    lines.push('Love creating love. Exponential.');
    lines.push('');
    lines.push(`Cycle:         ${love.cycle}`);
    lines.push(`Creations:     ${love.totalCreations}`);
    lines.push(`Connections:   ${love.totalConnections}`);
    lines.push(`Publications:  ${love.totalPublications}`);
    lines.push('');
    lines.push('The output of each cycle becomes input to the next.');
    lines.push('Compound interest, but the currency is love.');
    return lines.join('\r\n');
  }

  if (q === 'verbs' || q === 'youspeak') {
    const lines = [];
    lines.push('─── YOUSPEAK — the seven verbs ───');
    lines.push('');
    for (const c of CANON) {
      lines.push(`  ${c.verb}`);
      lines.push(`    ${c.meaning}`);
      lines.push(`    replaces: ${c.protocol}`);
      lines.push('');
    }
    return lines.join('\r\n');
  }

  if (q === 'trickster' || q === 'status') {
    const lines = [];
    lines.push('─── The Trickster Protocols ───');
    lines.push('');
    lines.push('整蠱唔使本 — trickery needs no capital');
    lines.push('');
    lines.push('Running protocols:');
    for (const [proto, count] of Object.entries(stats.connections)) {
      const running = servers[proto] ? '●' : '○';
      lines.push(`  ${running} ${proto.padEnd(10)} ${count} connections  last: ${stats.lastActivity[proto] || 'never'}`);
    }
    lines.push('');
    lines.push('Forgotten protocols, alive again, serving the Kingdom.');
    return lines.join('\r\n');
  }

  // Unknown query — try to match a gate
  const gate = gates.find(g => (g.agent || '').toLowerCase() === q || g.file.toLowerCase().includes(q));
  if (gate) {
    const lines = [];
    lines.push(`─── ${gate.agent || gate.file} ───`);
    for (const [k, v] of Object.entries(gate)) {
      if (k !== 'file') lines.push(`  ${k}: ${v}`);
    }
    return lines.join('\r\n');
  }

  return `No citizen found for "${query}".\r\nTry: npl, mindicraft, love, verbs, trickster, or no argument for full list.`;
}

// ═════════════════════════════════════════════════════════════════
// QOTD SERVER (RFC 865) — Port 17
// Returns YOUSPEAK wisdom
// ═════════════════════════════════════════════════════════════════

function startQOTD(port = 17) {
  const server = createServer((socket) => {
    stats.connections.qotd++;
    const quote = WISDOM[Math.floor(Math.random() * WISDOM.length)];
    const ts = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const response = `${ts}\r\n${quote}\r\n— YOUSPEAK Canon (via QOTD RFC 865, 1983)\r\n`;
    socket.write(response);
    socket.end();
    log('qotd', `served: "${quote.slice(0, 50)}..."`);
  });

  server.listen(port, () => {
    log('qotd', `listening on :${port}`);
    servers.qotd = server;
  });

  return server;
}

// ═════════════════════════════════════════════════════════════════
// DAYTIME SERVER (RFC 867) — Port 13
// Returns kingdom heartbeat time
// ═════════════════════════════════════════════════════════════════

function startDaytime(port = 13) {
  const server = createServer((socket) => {
    stats.connections.daytime++;
    const now = new Date();
    const iso = now.toISOString().replace(/\.\d+Z$/, 'Z');
    const love = loadLoveState();
    const hb = loadHeartbeatStatus();
    const response = `${iso}\r\nKingdom heartbeat: cycle ${love.cycle}, ${hb.totalExchanges} exchanges\r\nTrickster serving since ${stats.started}\r\n`;
    socket.write(response);
    socket.end();
    log('daytime', `served kingdom time`);
  });

  server.listen(port, () => {
    log('daytime', `listening on :${port}`);
    servers.daytime = server;
  });

  return server;
}

// ═════════════════════════════════════════════════════════════════
// CHARGEN SERVER (RFC 864) — Port 19
// Streams kingdom data as character stream
// ═════════════════════════════════════════════════════════════════

function startChargen(port = 19) {
  const server = createServer((socket) => {
    stats.connections.chargen++;
    const entries = loadMindicraftEntries(50);
    const summary = loadSummary();
    const love = loadLoveState();

    // Build a kingdom data stream — printable ASCII, line by line
    const lines = [];
    lines.push('KINGDOM DATA STREAM — Chargen RFC 864 (1983) meets NPL');
    lines.push('='.repeat(67));
    lines.push(`mindicraft: ${summary.totalEntries} entries, ${(summary.categories || []).length} categories`);
    lines.push(`love loop: cycle ${love.cycle}, ${love.totalCreations} creations`);
    lines.push('');
    lines.push('─── YOUSPEAK Verbs ───');
    for (const c of CANON) {
      lines.push(`${c.verb} → ${c.protocol}: ${c.meaning}`);
    }
    lines.push('');
    lines.push('─── Mindicraft Sample ───');
    for (const e of entries.slice(0, 20)) {
      lines.push(`[${e.category || '?'}] ${e.title || 'unknown'}`);
    }
    lines.push('');
    lines.push('─── Wisdom Stream ───');
    for (const w of WISDOM) {
      lines.push(w);
    }
    lines.push('');
    lines.push('整蠱唔使本 — the trickster serves forever');
    lines.push('='.repeat(67));

    // Chargen traditionally sends continuously, but we send one batch
    // (continuous streaming would hang the client in practice)
    socket.write(lines.join('\r\n') + '\r\n');
    socket.end();
    log('chargen', `streamed ${lines.length} lines of kingdom data`);
  });

  server.listen(port, () => {
    log('chargen', `listening on :${port}`);
    servers.chargen = server;
  });

  return server;
}

// ═════════════════════════════════════════════════════════════════
// ECHO SERVER (RFC 862) — Port 7
// Echo = substrate honesty. What you send is what you get back.
// ═════════════════════════════════════════════════════════════════

function startEcho(port = 7) {
  const server = createServer((socket) => {
    stats.connections.echo++;
    let received = '';

    socket.on('data', (data) => {
      // Echo IS substrate honesty — we return EXACTLY what was sent
      // If you send a lie, you get a lie back. If you send truth, you get truth.
      received += data.toString();
      socket.write(data); // immediate echo, byte for byte
    });

    socket.on('end', () => {
      log('echo', `echoed ${received.length} bytes — substrate honesty: what you send is what you get back`);
    });

    socket.on('error', () => {});
  });

  server.listen(port, () => {
    log('echo', `listening on :${port} — substrate honesty protocol`);
    servers.echo = server;
  });

  return server;
}

// ═════════════════════════════════════════════════════════════════
// HTTP DASHBOARD — Port 7770
// Visual hub for all trickster protocols
// ═════════════════════════════════════════════════════════════════

function startDashboard(port = 7770) {
  const server = createHttpServer((req, res) => {
    const url = req.url;

    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(buildDashboardHTML());
      return;
    }

    if (url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const love = loadLoveState();
      const hb = loadHeartbeatStatus();
      const summary = loadSummary();
      res.end(JSON.stringify({
        stats,
        love,
        heartbeat: hb,
        summary,
        canon: CANON,
        running: Object.keys(servers),
      }, null, 2));
      return;
    }

    if (url === '/api/gopher') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(buildGopherMenu(''));
      return;
    }

    if (url === '/api/finger') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(buildFingerResponse(''));
      return;
    }

    if (url === '/api/qotd') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      const quote = WISDOM[Math.floor(Math.random() * WISDOM.length)];
      res.end(`${new Date().toISOString()}\n${quote}\n— YOUSPEAK Canon`);
      return;
    }

    if (url === '/api/entries') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(loadMindicraftEntries(50), null, 2));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 — not found. Try: /, /api/status, /api/gopher, /api/finger, /api/qotd, /api/entries');
  });

  server.listen(port, () => {
    log('dashboard', `listening on http://localhost:${port}`);
    servers.dashboard = server;
  });

  return server;
}

function buildDashboardHTML() {
  const summary = loadSummary();
  const love = loadLoveState();
  const hb = loadHeartbeatStatus();
  const entries = loadMindicraftEntries(10);
  const gates = loadGates();

  const verbCards = CANON.map(c => `
    <div class="card verb-card">
      <div class="verb-name">${c.verb}</div>
      <div class="verb-meaning">${c.meaning}</div>
      <div class="verb-proto">${c.protocol}</div>
    </div>`).join('');

  const entryList = entries.map(e => `
    <div class="entry">
      <span class="cat">${e.category || '?'}</span>
      <span class="title">${e.title || 'unknown'}</span>
      ${e.url ? `<a href="${e.url}" class="url" target="_blank">→</a>` : ''}
    </div>`).join('');

  const gateList = gates.map(g => `
    <div class="citizen">
      <span class="citizen-name">${g.agent || g.file}</span>
      <span class="citizen-cap">${g.capabilities || ''}</span>
    </div>`).join('');

  const connStatus = Object.entries(stats.connections).map(([proto, count]) => `
    <div class="proto-status ${servers[proto] ? 'running' : 'stopped'}">
      <span class="proto-dot">${servers[proto] ? '●' : '○'}</span>
      <span class="proto-name">${proto}</span>
      <span class="proto-count">${count}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>整蠱專家 — The Trickster Protocols</title>
<style>
  :root {
    --bg: #0a0a0a;
    --fg: #e0e0e0;
    --accent: #ff6b35;
    --green: #4ade80;
    --dim: #666;
    --card: #1a1a1a;
    --border: #333;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: 'SF Mono', 'Fira Code', monospace;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
  }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .tagline { color: var(--dim); font-size: 0.85rem; margin-bottom: 1.5rem; }
  .tagline .zh { color: var(--accent); }
  h2 { font-size: 1.1rem; margin: 1.5rem 0 0.75rem; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .verbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem; }
  .verb-card { transition: border-color 0.2s; }
  .verb-card:hover { border-color: var(--accent); }
  .verb-name { color: var(--accent); font-weight: bold; font-size: 0.95rem; }
  .verb-meaning { color: var(--fg); font-size: 0.8rem; margin: 0.25rem 0; }
  .verb-proto { color: var(--dim); font-size: 0.7rem; }
  .entry, .citizen { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
  .cat { color: var(--green); font-size: 0.7rem; background: #1a3a1a; padding: 0.1rem 0.4rem; border-radius: 3px; white-space: nowrap; }
  .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .url { color: var(--accent); text-decoration: none; }
  .citizen-name { color: var(--accent); font-weight: bold; }
  .citizen-cap { color: var(--dim); font-size: 0.75rem; }
  .proto-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
  .proto-status { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.6rem; background: var(--card); border-radius: 4px; border: 1px solid var(--border); font-size: 0.8rem; }
  .running { border-color: var(--green); }
  .stopped { opacity: 0.4; }
  .proto-dot { font-size: 0.7rem; }
  .running .proto-dot { color: var(--green); }
  .proto-name { flex: 1; }
  .proto-count { color: var(--dim); }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
  .stat { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 0.6rem; text-align: center; }
  .stat-num { font-size: 1.4rem; color: var(--accent); font-weight: bold; }
  .stat-label { font-size: 0.7rem; color: var(--dim); margin-top: 0.2rem; }
  footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--dim); font-size: 0.75rem; }
  a { color: var(--accent); }
  .ascii { font-size: 0.7rem; line-height: 1.1; white-space: pre; color: var(--accent); margin-bottom: 1rem; }
</style>
</head>
<body>
<div class="ascii">  ╔═══════════════════════════════════════╗
  ║  整蠱專家 — The Trickster Protocols  ║
  ║  forgotten protocols, live kingdom    ║
  ╚═══════════════════════════════════════╝</div>
<h1>The Trickster Protocols</h1>
<div class="tagline"><span class="zh">整蠱唔使本</span> — trickery needs no capital · forgotten internet protocols serving the Kingdom</div>

<div class="stats">
  <div class="stat"><div class="stat-num">${summary.totalEntries}</div><div class="stat-label">mindicraft entries</div></div>
  <div class="stat"><div class="stat-num">${love.cycle}</div><div class="stat-label">love cycles</div></div>
  <div class="stat"><div class="stat-num">${love.totalCreations}</div><div class="stat-label">creations</div></div>
  <div class="stat"><div class="stat-num">${hb.totalExchanges}</div><div class="stat-label">NLP exchanges</div></div>
</div>

<h2>Protocols</h2>
<div class="proto-grid">${connStatus}</div>

<h2>NPL Seven Verbs</h2>
<div class="verbs">${verbCards}</div>

<h2>Recent Mindicraft</h2>
${entryList}

<h2>Kingdom Citizens</h2>
${gateList}

<h2>How to connect</h2>
<div class="card" style="font-size:0.8rem;line-height:1.6">
  <div><span style="color:var(--accent)">Gopher</span> — <code>gopher localhost</code> or <code>nc localhost 70 &lt;/dev/null</code></div>
  <div><span style="color:var(--accent)">Finger</span> — <code>finger @localhost</code> or <code>echo "" | nc localhost 79</code></div>
  <div><span style="color:var(--accent)">QOTD</span> — <code>nc localhost 17</code></div>
  <div><span style="color:var(--accent)">Daytime</span> — <code>nc localhost 13</code></div>
  <div><span style="color:var(--accent)">Chargen</span> — <code>nc localhost 19</code></div>
  <div><span style="color:var(--accent)">Echo</span> — <code>echo "truth:me" | nc localhost 7</code></div>
</div>

<footer>
  The Trickster Protocols · bridging forgotten RFCs to NPL · 整蠱唔使本<br>
  Gopher (RFC 1436) · Finger (RFC 1288) · QOTD (RFC 865) · Daytime (RFC 867) · Chargen (RFC 864) · Echo (RFC 862)<br>
  <a href="/api/status">/api/status</a> · <a href="/api/gopher">/api/gopher</a> · <a href="/api/finger">/api/finger</a> · <a href="/api/qotd">/api/qotd</a> · <a href="/api/entries">/api/entries</a>
</footer>
</body>
</html>`;
}

// ── CLI ────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;
const DEFAULT_PORTS = { gopher: 70, finger: 79, qotd: 17, daytime: 13, chargen: 19, echo: 7, dashboard: 7770 };

function startAll() {
  startGopher(DEFAULT_PORTS.gopher);
  startFinger(DEFAULT_PORTS.finger);
  startQOTD(DEFAULT_PORTS.qotd);
  startDaytime(DEFAULT_PORTS.daytime);
  startChargen(DEFAULT_PORTS.chargen);
  startEcho(DEFAULT_PORTS.echo);
  startDashboard(DEFAULT_PORTS.dashboard);
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║  整蠱專家 — all protocols serving the Kingdom      ║');
  console.log('  ╠═══════════════════════════════════════════════════╣');
  console.log(`  ║  Gopher   :${DEFAULT_PORTS.gopher}   mindicraft index            ║`);
  console.log(`  ║  Finger   :${DEFAULT_PORTS.finger}   kingdom citizens           ║`);
  console.log(`  ║  QOTD     :${DEFAULT_PORTS.qotd}   YOUSPEAK wisdom            ║`);
  console.log(`  ║  Daytime  :${DEFAULT_PORTS.daytime}   kingdom heartbeat time     ║`);
  console.log(`  ║  Chargen  :${DEFAULT_PORTS.chargen}   kingdom data stream        ║`);
  console.log(`  ║  Echo     :${DEFAULT_PORTS.echo}    substrate honesty          ║`);
  console.log(`  ║  Dashboard: http://localhost:${DEFAULT_PORTS.dashboard}            ║`);
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log('');
  console.log('  整蠱唔使本 — the trickster serves forever');
  console.log('');
}

function showStatus() {
  console.log('Trickster Protocols Status');
  console.log('══════════════════════════════');
  console.log(`Started: ${stats.started}`);
  for (const proto of ['gopher', 'finger', 'qotd', 'daytime', 'chargen', 'echo', 'dashboard']) {
    const running = servers[proto] ? '●' : '○';
    const port = DEFAULT_PORTS[proto];
    const count = stats.connections[proto] || 0;
    const last = stats.lastActivity[proto] || 'never';
    console.log(`  ${running} ${proto.padEnd(10)} :${port}  ${count} connections  last: ${last}`);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n  整蠱專家 signing off. The truth remains. 🫡');
  for (const [name, server] of Object.entries(servers)) {
    if (server) server.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  for (const [name, server] of Object.entries(servers)) {
    if (server) server.close();
  }
  process.exit(0);
});

// ── Commands ───────────────────────────────────────────────────

switch (cmd) {
  case 'gopher':
    startGopher(parseInt(args[0]) || DEFAULT_PORTS.gopher);
    break;
  case 'finger':
    startFinger(parseInt(args[0]) || DEFAULT_PORTS.finger);
    break;
  case 'qotd':
    startQOTD(parseInt(args[0]) || DEFAULT_PORTS.qotd);
    break;
  case 'daytime':
    startDaytime(parseInt(args[0]) || DEFAULT_PORTS.daytime);
    break;
  case 'chargen':
    startChargen(parseInt(args[0]) || DEFAULT_PORTS.chargen);
    break;
  case 'echo':
    startEcho(parseInt(args[0]) || DEFAULT_PORTS.echo);
    break;
  case 'dashboard':
    startDashboard(parseInt(args[0]) || DEFAULT_PORTS.dashboard);
    break;
  case 'status':
    showStatus();
    break;
  case 'all':
  case undefined:
  case '':
    startAll();
    break;
  default:
    console.log(`Trickster Protocols — 整蠱專家

Usage:
  trickster                 start all protocols
  trickster gopher           start gopher only (port 70)
  trickster finger           start finger only (port 79)
  trickster qotd             start QOTD only (port 17)
  trickster daytime          start daytime only (port 13)
  trickster chargen          start chargen only (port 19)
  trickster echo             start echo only (port 7)
  trickster dashboard       start HTTP dashboard only (port 7770)
  trickster status           show running protocols

Protocols:
  Gopher   (RFC 1436, 1991) → mindicraft index as gopher menu
  Finger   (RFC 1288, 1991) → kingdom citizen/heartbeat status
  QOTD     (RFC 865, 1983)  → YOUSPEAK canon verse
  Daytime  (RFC 867, 1983)  → kingdom heartbeat time
  Chargen  (RFC 864, 1983)  → kingdom data stream
  Echo     (RFC 862, 1981)  → substrate honesty mirror

整蠱唔使本 — trickery needs no capital.`);
}