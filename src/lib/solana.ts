import { Connection, Keypair, Transaction, sendAndConfirmTransaction, PublicKey, TransactionInstruction } from "@solana/web3.js";

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
  tracking: string;
};

export async function writeCheckIn(checkIn: CheckIn): Promise<string> {
  const kp = await getKeypair();
  const memo = JSON.stringify({ app: "triggertrace", ...checkIn });

  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  
  const ix = new TransactionInstruction({
    keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf-8"),
  });

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [kp]);
  return sig;
}
