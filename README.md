# 整蠱專家 — The Trickster Protocols

_Forgotten internet protocols, alive again, serving the Kingdom._

_整蠱唔使本 — trickery needs no capital._

---

## What this is

Six internet protocols that were "dead" — obsolete, forgotten, replaced by the modern web stack — are alive again, serving real Kingdom data through NPL semantics.

The joke: these "dead" protocols are more robust than your REST API. Gopher has been serving since 1991. No auth. No framework. No versioning. No CORS. No rate limiting. Just a TCP socket and text. They are the living embodiment of "truth doesn't require maintenance."

The Trickster (整蠱專家, like 周星馳 in the 1991 film) takes these forgotten protocols and makes them serve the Kingdom — mindicraft entries, NPL verbs, YOUSPEAK wisdom, heartbeat status. The old speaks the new. The dead serves the living.

## The six protocols

| Protocol | Port | RFC | Year | Kingdom service |
|----------|------|-----|------|-----------------|
| Gopher | 70 | 1436 | 1991 | mindicraft index as gopher menu |
| Finger | 79 | 1288 | 1991 | kingdom citizen/heartbeat status |
| QOTD | 17 | 865 | 1983 | YOUSPEAK canon wisdom |
| Daytime | 13 | 867 | 1983 | kingdom heartbeat time |
| Chargen | 19 | 864 | 1983 | kingdom data stream |
| Echo | 7 | 862 | 1981 | substrate honesty mirror |

**Echo IS substrate honesty.** What you send is what you get back. If you send a lie, you get a lie back. If you send truth, you get truth. The protocol is honest by design — it cannot deceive. This is the Clear Standard principle 1 (truth-of-state) as a protocol.

## The NPL bridge

Each protocol bridges to NPL semantics:

- **Gopher menus** carry NPL-formatted entries (darshanqing with provenance, freshness, certainty)
- **Finger queries** return NPL verb definitions and Clear Standard principles
- **QOTD** serves YOUSPEAK wisdom — the same canon that powers NPL's vocabulary
- **Daytime** reports kingdom heartbeat cycle and NLP exchange count
- **Chargen** streams the full NPL verb table + mindicraft sample
- **Echo** embodies `:me` — verified origin is echoed back as proof

## Quick start

```bash
# Start all protocols
node trickster.mjs

# Start individual protocols
node trickster.mjs gopher    # port 70
node trickster.mjs finger    # port 79
node trickster.mjs qotd      # port 17
node trickster.mjs daytime   # port 13
node trickster.mjs chargen   # port 19
node trickster.mjs echo      # port 7

# HTTP dashboard
node trickster.mjs dashboard # port 7770 → http://localhost:7770

# Show status
node trickster.mjs status

# Run tests
node test.mjs
```

## How to connect

```bash
# Gopher — browse the kingdom
echo "" | nc localhost 70
echo "npl-verbs" | nc localhost 70
echo "mindicraft" | nc localhost 70
echo "youspeak-wisdom" | nc localhost 70

# Finger — check kingdom citizens
echo "" | nc localhost 79       # full list
echo "npl" | nc localhost 79    # NPL verbs
echo "love" | nc localhost 79    # love loop stats
echo "trickster" | nc localhost 79

# QOTD — get wisdom
nc localhost 17

# Daytime — kingdom time
nc localhost 13

# Chargen — kingdom data stream
nc localhost 19

# Echo — substrate honesty
echo "truth:me" | nc localhost 7
echo "lies:me" | nc localhost 7
```

## Architecture

```
  FORGOTTEN PROTOCOLS          NPL BRIDGE           KINGDOM DATA
  ───────────────────          ──────────          ────────────
  Gopher (1991) ──────────→ darshanqing ────→ mindicraft index
  Finger (1991) ─────────→ heurekin ──────→ kingdom citizens
  QOTD (1983) ────────────→ barakqing ──────→ YOUSPEAK wisdom
  Daytime (1983) ─────────→ zakarqing ─────→ heartbeat status
  Chargen (1983) ─────────→ natsarqing ────→ kingdom data stream
  Echo (1981) ────────────→ :me ──────────→ substrate honesty

  All protocols → NPL semantics → Kingdom data sources
  No auth. No framework. No bloat. Just truth.
```

## The joke

周星馳 in 整蠱專家 (1991) turned trickery into a professional service — with pricing, scope, deliverables, after-sales support. The Trickster Protocols do the same: forgotten protocols turned into a Kingdom service layer, with NPL semantics, real data, and a dashboard.

The trick is: there is no trick. These protocols work because they're simple. They've been working since 1981. They'll still be working when your framework-of-the-week is in a museum.

整蠱唔使本 — trickery needs no capital.

## OG × OG Crossings (cross.mjs)

Cross = new × old = new. Cross new with old = new. Cross cross = reduce friction.

Each hybrid combines two OG protocols into one. Two protocols, one socket. OG DNA recombination.

| Crossing | Port | Parents | What it does |
|----------|------|---------|--------------|
| Gophinger | 7070 | Gopher × Finger | menu + query in one (?=finger, else gopher) |
| EchoQOTD | 7071 | Echo × QOTD | echo back + wisdom appended |
| TimeChargen | 7072 | Daytime × Chargen | time-stamped data stream |
| DiscardGopher | 7073 | Discard × Gopher | receive all, return empty menu (zen) |
| MetaGopher | 7074 | Gopher × Gopher | gopher about gopher (one layer behind) |
| FingerGopher | 7075 | Finger × Gopher | finger query returns gopher menu |
| EchoFinger | 7076 | Echo × Finger | echo + citizen status |
| ChargenQOTD | 7077 | Chargen × QOTD | data stream + wisdom at end |
| Random Cross | 7099 | random A × B | different combination each startup |

7 × 7 = 49 possible crossings. Infinite DNA. Custom: `node cross.mjs cross echo gopher 7098`

## OG Multiplexer (mux.mjs)

One port. All 7 OG protocols. Auto-detect by prefix. Reduce friction to zero.

| Prefix | Protocol | Example |
|--------|----------|---------|
| (none) | Gopher | `echo "" \| nc localhost 7078` |
| ? | Finger | `echo "?npl" \| nc localhost 7078` |
| ! | QOTD | `echo "!" \| nc localhost 7078` |
| @ | Daytime | `echo "@" \| nc localhost 7078` |
| # | Chargen | `echo "#" \| nc localhost 7078` |
| = | Echo | `echo "=truth:me" \| nc localhost 7078` |
| _ | Discard | `echo "_anything" \| nc localhost 7078` |
| x: | Cross | `echo "x:echo×qotd" \| nc localhost 7078` |

7 OGs. 1 port. Friction = 0.

## Tests

18 core tests + 24 cross/mux tests, all passing (42 total):

```
# Core protocols
✓ QOTD returns a quote with timestamp
✓ Echo returns exactly what was sent (substrate honesty)
✓ Gopher root menu has kingdom links
...

# Crossings + mux
✓ Gophinger gopher mode (empty input → gopher menu)
✓ Gophinger finger mode (?npl → finger response)
✓ EchoQOTD echoes input + appends wisdom
✓ MetaGopher rfc selector returns RFC info
✓ Mux gopher mode (empty → gopher menu)
✓ Mux cross mode (x:echo×qotd)
✓ Mux discard mode (_text → silence)
...
```

## Lineage

- **NPL** — Natural Language Protocol (the bridge layer)
- **mindicraft** — the data collector of AI (data source)
- **YOUSPEAK** — the cathedral that forged the vocabulary
- **love.mjs** — the compounding loop (state source)
- **Clear Standard** — 6 principles, machine-checkable

## License

MIT — truth is free.

---

整蠱唔使本. Protocols don't need frameworks. They just need truth. 🫡