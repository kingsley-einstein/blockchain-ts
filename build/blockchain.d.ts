import { Block, Blocks, Transaction, Transactions } from "./interfaces";
export default class BlockChain {
  chain: Blocks;
  transactionPool: Transactions;
  address: string;
  constructor();
  private genesis;
  addBlock(block: Block): Block;
  private deriveTxHash;
  private deriveBlockHash;
  private deriveMerkleRoot;
  addPendingTransaction(tx: Transaction): Transactions;
  private prepareBlock;
  private proofOfTransaction;
  mineBlock(difficulty: number): Block;
  chainIsValid(): boolean;
  getChain(): Blocks;
}
