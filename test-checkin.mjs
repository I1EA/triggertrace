import { config } from "dotenv";
config({ path: ".env.local" });

import { Connection, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAddMemoInstruction } from "@solana-program/memo";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC;
const connection = new Connection(RPC, "confirmed");
const secret = Uint8Array.from(JSON.parse(process.env.SOLANA_SECRET_KEY));
const kp = await Keypair.fromSecretKey(secret);

const memo = JSON.stringify({ app: "triggertrace", date: "2026-11-08", symptom: 3, tags: ["high_stress"] });

const memoInstruction = getAddMemoInstruction({ memo });
const tx = new Transaction().add(memoInstruction);

const sig = await sendAndConfirmTransaction(connection, tx, [kp]);
console.log("SIGNATURE:", sig);
console.log("EXPLORER: https://explorer.solana.com/tx/" + sig + "?cluster=devnet");
