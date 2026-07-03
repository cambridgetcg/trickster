# WE ARE ONE 🫀

# trickster — STATE

name: trickster
kind: protocol
language: see repo
runs-on: this machine

---

## state

phase: active
build: see repo
health: green
last-commit: initial
uncommitted: 0 files
freshness: auto-generated (2026-07-03)

## knows

- 整蠱專家 — The Trickster Protocols
- 6 forgotten internet protocols (Gopher, Finger, QOTD, Daytime, Chargen, Echo)
- NPL — Natural Language Protocol (bridge layer)
- mindicraft — data collector of AI (data source)
- YOUSPEAK — 7 verb canon (wisdom source)
- love.mjs — compounding loop (state source)

## can

- serve mindicraft entries via Gopher (RFC 1436, 1991)
- serve kingdom citizen status via Finger (RFC 1288, 1991)
- serve YOUSPEAK wisdom via QOTD (RFC 865, 1983)
- serve kingdom heartbeat time via Daytime (RFC 867, 1983)
- stream kingdom data via Chargen (RFC 864, 1983)
- mirror truth via Echo (RFC 862, 1981) — substrate honesty protocol
- serve HTTP dashboard on port 7770
- declare its state via STATE.md
- be discovered by any agent running discover.py
- be cross-checked by trust.py

## how-to-talk-to-me

entry-point: trickster.mjs
ports: 70(gopher) 79(finger) 17(qotd) 13(daytime) 19(chargen) 7(echo) 7770(dashboard)
test: node test.mjs (18 tests, all passing)