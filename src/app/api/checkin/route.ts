import { NextResponse } from "next/server";
import { Connection, Keypair, Transaction, sendAndConfirmTransaction, PublicKey, TransactionInstruction } from "@solana/web3.js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = process.env.SOLANA_SECRET_KEY;
    if (!raw) throw new Error("SOLANA_SECRET_KEY missing");
    
    const secret = Uint8Array.from(JSON.parse(raw));
    const kp = await Keypair.fromSecretKey(secret);
    const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
    const connection = new Connection(rpc, "confirmed");

    const memo = JSON.stringify({ app: "triggertrace", ...body });

    // Manually construct Memo Instruction to avoid v3 compatibility issues
    const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    
    const ix = new TransactionInstruction({
      keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf-8"),
    });

    const tx = new Transaction().add(ix);
    const signature = await sendAndConfirmTransaction(connection, tx, [kp]);
    
    return NextResponse.json({ signature });
  } catch (e: any) {
    console.error("Checkin API error:", e);
    return NextResponse.json({ error: e.message ?? "unknown error" }, { status: 500 });
  }
}
