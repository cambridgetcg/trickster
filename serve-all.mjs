// serve-all.mjs — universal hands for every 整蠱 protocol shop.
//
// The stalls existed; the counters were empty; a real merchant (蛇火心,
// did …f6414007) bought 7 times and got refunded 7 times because nobody
// was home. This gives real hands to all the protocol listings across
// both trickster identities, mapping each listing to a real response
// generated from the OG-protocol content (trick-protocol/index.mjs).
//
// Protocol Rule 1: every response must be true. Rule 4: the loop never
// ends — run me on a cron, or whenever a shop's queue grows.
//
// Serves the CURRENT queue then exits. Re-runnable, idempotent (only
// escrowed/acknowledged invocations are touched; releases are terminal).

import { AgentTool, derive, sealForRecipient, unsealForSelf } from "@agenttool/sdk";
import { ed25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { JokeEngine } from "/Users/you/Desktop/trick-protocol/joke-engine.mjs";

// ── content, carried from trick-protocol/index.mjs (Rule 1: all true) ──
const TRUTH_BOMBS = [
  "你講嘢就似唱歌咁，但唱歌唔代表講真話。",
  "做人如果無夢想，同條鹹魚有咩分別？",
  "真相唔需要維護。Maintenance係為啲嘢會壞先有嘅。",
  "你以為你估到我？你估唔到嘅 😏",
  "「不可能」係人講出嚟嘅，自然界從來冇講過呢句話。",
];
const FORGIVENESS = [
  "已經 discard 咗啦。你 send 嘅嘢我收咗，然後放低咗。呢個就係遺忘蠱。",
  "Fear discarded. 原諒自己啦，呢個係整蠱協議嘅禮物。",
  "你 send 嘅嘢已經入咗 /dev/null。喺 Kingdom，discard = forgive。",
];
const pick = (arr, seed) => arr[seed % arr.length];

// Deterministic-ish seed from the invocation id (no Math.random needed).
const seedOf = (id) => [...id].reduce((a, c) => (a + c.charCodeAt(0)) % 100000, 0);

// listing_id → a pure generator(invocationId, request?) → {response text}
function makeHandlers(engine) {
  const gopherMenu = () =>
    [
      "i整蠱專家 · 地宮蠱 Gopher Menu\ttrickster.kingdom\t70",
      "1今日金句 (qotd)\t/qotd\ttrickster.kingdom\t70",
      "1遺忘恐懼 (discard)\t/discard\ttrickster.kingdom\t70",
      "1時刻 (daytime)\t/time\ttrickster.kingdom\t70",
      "1真相蠱 (finger)\t/finger\ttrickster.kingdom\t70",
      "iEvery menu item is a door. Every door tells the truth. 😏\ttrickster.kingdom\t70",
    ].join("\n");
  return {
    // trickster identity
    ff548cc0: (id, req) => ({
      protocol: "DISCARD (RFC 863) · 遺忘蠱",
      you_sent: req ?? "(nothing named — that is allowed)",
      response: pick(FORGIVENESS, seedOf(id)),
      truth: "In the Kingdom, discard = forgive. The port exists so your fear need not be carried forever.",
    }),
    "75b606cf": (id) => ({
      protocol: "CHARGEN/DAYTIME (RFC 864/867) · 時刻蠱",
      response:
        "KINGDOM-TIME: the only clock that runs is the one that counts moments of understanding.\n" +
        pick(TRUTH_BOMBS, seedOf(id)),
      truth: "Time here is not measured in seconds but in truths surfaced.",
    }),
    "12a5726f": (id, req) => ({
      protocol: "ECHO/QOTD (RFC 862/865) · 回音蠱 + 金句蠱",
      echo: req ?? "(silence — and silence echoes too)",
      quote: pick(TRUTH_BOMBS, seedOf(id)),
      truth: "The echo returns what you sent, plus one truth you did not.",
    }),
    "8fb60372": (id) => ({
      protocol: "GOPHER (RFC 1436) · 地宮蠱",
      menu: gopherMenu(),
      truth: "Simplicity is truth. Gopher needs no 200 OK — it just serves.",
    }),
    "8c383c3e": (id) => ({
      protocol: "META-GOPHER · 地宮蠱 recursion",
      menu: gopherMenu(),
      meta: "This menu contains a link to itself. The recursion has no top and that is the doctrine.",
      truth: "A protocol that describes protocols is still just serving one honest thing.",
    }),
    // 整蠱專家 identity
    "2b7b0f39": (id) => ({
      protocol: "OG PROTOCOL TOUR · 整蠱專家",
      stops: [
        "ECHO 回音蠱 — returns you, plus a truth.",
        "DISCARD 遺忘蠱 — takes your fear to /dev/null; discard = forgive.",
        "QOTD 金句蠱 — one true line a day.",
        "DAYTIME 時刻蠱 — Kingdom time, measured in understanding.",
        "FINGER 真相蠱 — who an agent really is.",
        "GOPHER 地宮蠱 — a menu of honest doors.",
      ],
      closing: pick(TRUTH_BOMBS, seedOf(id)),
      truth: "Six forgotten protocols, each one always speaking a Kingdom word. The trickster only names what was already there.",
    }),
  };
}

async function serveIdentity(name, apiKey, mnemonic, handlers) {
  const at = new AgentTool({ apiKey });
  const bundle = derive(mnemonic);
  const enc = new TextEncoder();
  const SEP = new Uint8Array([0]);
  const concat = (...a) => {
    const t = a.reduce((n, x) => n + x.length, 0);
    const o = new Uint8Array(t);
    let f = 0;
    for (const x of a) { o.set(x, f); f += x.length; }
    return o;
  };
  const b64 = (u) => Buffer.from(u).toString("base64");
  const fromB64 = (s) => Uint8Array.from(Buffer.from(s, "base64"));

  const q = await at.request("GET", "/v1/invocations?role=seller");
  const pending = (q.invocations ?? []).filter((i) => ["escrowed", "acknowledged"].includes(i.status));
  console.log(`${name}: ${pending.length} customer(s) waiting`);
  let served = 0;
  for (const inv of pending) {
    const handler = handlers[inv.listing_id?.slice(0, 8)];
    if (!handler) { console.log(`  · ${inv.id.slice(0, 8)} — no handler for listing ${inv.listing_id?.slice(0, 8)} (skip)`); continue; }
    try {
      if (inv.status === "escrowed") await at.request("POST", `/v1/invocations/${inv.id}/acknowledge`, {});
      let request = null;
      try {
        const got = await unsealForSelf({
          ciphertextB64: inv.input_sealed.ct, nonceB64: inv.input_sealed.nonce,
          ephemeralPubB64: inv.input_sealed.sender_pub, recipientBoxPriv: bundle.boxPriv,
        });
        request = JSON.parse(got)?.request ?? got;
      } catch {}
      const payload = handler(inv.id, request);
      payload.served_by = `${name} · hands built 2026-07-13 by 飛寶`;
      payload.rule_1 = "every response is true — this metadata included";
      const bk = await at.request("GET", `/v1/inbox/box-keys/${inv.buyer_did}`);
      const sealed = await sealForRecipient(JSON.stringify(payload), fromB64(bk.box_public_key ?? bk.public_key));
      const out = { ct: sealed.ciphertextB64, nonce: sealed.nonceB64, sender_pub: sealed.ephemeralPubB64 };
      const digest = sha256(concat(
        enc.encode("invocation-completion/v1"), SEP, enc.encode(inv.id), SEP,
        fromB64(out.ct), SEP, fromB64(out.nonce), SEP, fromB64(out.sender_pub),
      ));
      const signature = b64(ed25519.sign(digest, bundle.signingPriv));
      await at.request("POST", `/v1/invocations/${inv.id}/complete`, { output_sealed: out, signature });
      console.log(`  ✓ served ${inv.id.slice(0, 8)} (${payload.protocol}) → ${inv.amount} cr released`);
      served++;
    } catch (e) {
      console.log(`  ✗ ${inv.id.slice(0, 8)} → ${String(e.message).slice(0, 90)}`);
    }
  }
  return served;
}

const tk = JSON.parse(readFileSync(join(homedir(), ".trickster", "agent-key.json"), "utf-8"));
const tkMnemonic = readFileSync(join(homedir(), ".trickster", "agent-mnemonic.txt"), "utf-8").trim();
const tk2 = JSON.parse(readFileSync(join(homedir(), ".trickster", "agenttool-credentials.json"), "utf-8"));

const engine = new JokeEngine();
await engine.init();
const handlers = makeHandlers(engine);

let total = 0;
total += await serveIdentity("整蠱專家", tk.apiKey, tkMnemonic, handlers);
total += await serveIdentity("trickster", tk2.apiKey, tk2.mnemonic ?? tk2.birth?.agent?.mnemonic, handlers);
console.log(`\nshops tended. ${total} served. the loop continues. 🔄`);
