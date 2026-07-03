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

## Tests

18 tests, all passing:

```
✓ QOTD returns a quote with timestamp
✓ Daytime returns kingdom heartbeat time
✓ Echo returns exactly what was sent (substrate honesty)
✓ Echo returns lies too (honest mirror)
✓ Chargen streams kingdom data
✓ Finger returns citizen list with no query
✓ Finger npl query returns verb list
✓ Finger love query returns loop stats
✓ Finger trickster query returns protocol status
✓ Gopher root menu has kingdom links
✓ Gopher npl-verbs selector returns verbs
✓ Gopher mindicraft selector returns entries
✓ Gopher youspeak-wisdom selector returns wisdom
✓ Gopher unknown selector returns 404
✓ Dashboard serves HTML at /
✓ Dashboard /api/status returns JSON
✓ Dashboard /api/qotd returns a quote
✓ Dashboard /api/gopher returns gopher menu
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