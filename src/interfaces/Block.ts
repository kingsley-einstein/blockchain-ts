import { Transactions } from "./Transaction";

export default interface Block {
  previousHash: string;
  hash: string;
  transactions: Transactions;
  timestamp: number;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
}

export type Blocks = Array<Block>;
