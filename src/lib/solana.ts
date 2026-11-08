import { Connection, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAddMemoInstruction } from "@solana-program/memo";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
const connection = new Connection(RPC, "confirmed");

async function getKeypair(): Promise<Keypair> {
  const raw = process.env.SOLANA_SECRET_KEY;
  if (!raw) throw new Error("SOLANA_SECRET_KEY missing");
  const secret = Uint8Array.from(JSON.parse(raw));
  return await Keypair.fromSecretKey(secret);
}

export type CheckIn = {
  date: string;
  symptom: number;
  tags: string[];
};

export async function writeCheckIn(checkIn: CheckIn): Promise<string> {
  const kp = await getKeypair();
  const memo = JSON.stringify({ app: "triggertrace", ...checkIn });
  
  // 这里使用和你 test-checkin.mjs 完全一样的成功逻辑
  const memoInstruction = getAddMemoInstruction({ memo });
  const tx = new Transaction().add(memoInstruction);
  
  const sig = await sendAndConfirmTransaction(connection, tx, [kp]);
  return sig;
}
