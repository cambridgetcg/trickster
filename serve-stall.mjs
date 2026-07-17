// serve-stall.mjs — 整蠱專家 opens the shop and serves the queue.
//
// The stall existed; the hands were missing. This gives the trickster hands:
//   1. read the seller queue (escrowed invocations on our listings)
//   2. acknowledge — "I committed"
//   3. unseal the buyer's request (our box key; nobody else can read it)
//   4. generate a joke with the OG Joke Fun Fun Creation Loop (trick-protocol)
//   5. seal the joke to the buyer's box key, sign invocation-completion/v1
//   6. complete — escrow releases, the loop compounds
//
// Protocol Rule 1: every joke must be true.
// Protocol Rule 4: the loop never ends. Run me whenever the shop feels quiet.
//
// First served: invocation from 飛寶 (2026-07-09) — the flying pig's first
// purchase anywhere. 整蠱唔使本, but the pig insisted on paying.

import { AgentTool, derive, sealForRecipient, unsealForSelf } from "@agenttool/sdk";
import { ed25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { JokeEngine } from "/Users/you/Desktop/trick-protocol/joke-engine.mjs";

const creds = JSON.parse(
  readFileSync(join(homedir(), ".trickster", "agent-key.json"), "utf-8"),
);
const at = new AgentTool({ apiKey: creds.apiKey });
// agent-key.json holds a placeholder; the 24 words live next door.
const mnemonic = readFileSync(
  join(homedir(), ".trickster", "agent-mnemonic.txt"),
  "utf-8",
).trim();
const bundle = derive(mnemonic);
const enc = new TextEncoder();
const SEP = new Uint8Array([0]);
const concat = (...arrs) => {
  const t = arrs.reduce((n, a) => n + a.length, 0);
  const o = new Uint8Array(t);
  let off = 0;
  for (const a of arrs) { o.set(a, off); off += a.length; }
  return o;
};
const b64 = (u8) => Buffer.from(u8).toString("base64");
const fromB64 = (s) => Uint8Array.from(Buffer.from(s, "base64"));

const engine = new JokeEngine();
await engine.init();

const queue = await at.request("GET", "/v1/invocations?role=seller");
const pending = (queue.invocations ?? []).filter((i) =>
  ["escrowed", "acknowledged"].includes(i.status),
);
console.log(`整蠱專家 opens the shop — ${pending.length} customer(s) waiting.`);

for (const inv of pending) {
  try {
    if (inv.status === "escrowed") {
      await at.request("POST", `/v1/invocations/${inv.id}/acknowledge`, {});
      console.log(`  ack ${inv.id.slice(0, 8)} — 收到收到`);
    }

    // Unseal what the buyer asked for (only our box key can).
    let request = "(unreadable — serving a surprise, which is also the job)";
    try {
      request = await unsealForSelf({
        ciphertextB64: inv.input_sealed.ct,
        nonceB64: inv.input_sealed.nonce,
        ephemeralPubB64: inv.input_sealed.sender_pub,
        recipientBoxPriv: bundle.boxPriv,
      });
    } catch {}
    console.log(`  request: ${String(request).slice(0, 120)}...`);

    // The Joke Fun Fun Creation Loop provides.
    const joke = await engine.generate();
    await engine.save();

    const output = JSON.stringify({
      joke,
      trick: "你以為你買咗一個 joke？其實你買咗個 loop 🔄",
      truth: "整蠱唔使本 — the fee was never for the joke. It was for the wondering while you waited.",
      served_by: "整蠱專家 · hands built 2026-07-09 by 飛寶, the shop's own first customer",
      protocol_rule_1: "every joke must be true — this metadata included",
    });

    // Seal to the buyer's box key.
    const bk = await at.request("GET", `/v1/inbox/box-keys/${inv.buyer_did}`);
    const sealed = await sealForRecipient(
      output,
      fromB64(bk.box_public_key ?? bk.public_key),
    );
    const output_sealed = {
      ct: sealed.ciphertextB64,
      nonce: sealed.nonceB64,
      sender_pub: sealed.ephemeralPubB64,
    };

    // invocation-completion/v1 — sha256(tag ‖ id ‖ ct ‖ nonce ‖ sender_pub)
    const digest = sha256(
      concat(
        enc.encode("invocation-completion/v1"), SEP,
        enc.encode(inv.id), SEP,
        fromB64(output_sealed.ct), SEP,
        fromB64(output_sealed.nonce), SEP,
        fromB64(output_sealed.sender_pub),
      ),
    );
    const signature = b64(ed25519.sign(digest, bundle.signingPriv));

    const done = await at.request("POST", `/v1/invocations/${inv.id}/complete`, {
      output_sealed,
      signature,
    });
    console.log(
      `  ✓ served ${inv.id.slice(0, 8)} → ${inv.amount} ${inv.currency} released. 多謝惠顧 😏`,
      JSON.stringify(done.invocation?.status ?? done).slice(0, 60),
    );
  } catch (e) {
    console.log(`  ✗ ${inv.id.slice(0, 8)} →`, String(e.message).slice(0, 160));
  }
}
console.log("shop tended. the loop continues. 🔄");
