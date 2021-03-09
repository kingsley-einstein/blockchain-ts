import _ from "lodash";
import crypto from "crypto-js";
import { Block, Blocks, Transaction, Transactions } from "./interfaces";
import { TransactionTypes } from "./enums";

export class BlockChain {
  public chain: Blocks = [];
  public transactionPool: Transactions = [];
  public address: string = "";

  public addBlock(block: Block): Block {
    this.chain = _.concat(this.chain, block);
    return block;
  }

  private deriveTxHash(tx: Transaction): Transaction {
    const derivedTx: Transaction = {
      ...tx,
      hash: crypto.SHA256(JSON.stringify(tx)).toString()
    };
    return derivedTx;
  }

  private deriveBlockHash(block: Block): Block {
    const derivedBlock: Block = {
      ...block,
      merkleRoot: _.head(
        this.deriveMerkleRoot(_.map(block.transactions, (tx) => tx.hash))
      )
    };

    return {
      ...derivedBlock,
      hash: crypto
        .SHA256(
          JSON.stringify({
            previousHash: derivedBlock.previousHash,
            timestamp: derivedBlock.timestamp,
            nonce: derivedBlock.nonce,
            transactions: derivedBlock.transactions,
            difficulty: derivedBlock.difficulty,
            merkleRoot: derivedBlock.merkleRoot
          })
        )
        .toString()
    };
  }

  private deriveMerkleRoot(hashes: Array<string>): Array<string> {
    if (hashes.length === 1) return hashes;

    if (hashes.length % 2 > 0)
      hashes = _.concat(hashes, hashes[hashes.length - 1]);

    let pairedHashes: Array<Array<string>> = [];

    for (let i = 0; i < hashes.length; i++)
      if (i % 2 === 0)
        pairedHashes = _.concat(pairedHashes, [hashes[i - 1], hashes[i]]);

    let derivedHashes: Array<string> = [];

    for (let i = 0; i < pairedHashes.length; i++)
      derivedHashes = _.concat(
        derivedHashes,
        crypto.SHA256(`${pairedHashes[i][0]}:${pairedHashes[i][1]}`).toString()
      );

    return this.deriveMerkleRoot(derivedHashes);
  }

  public addPendingTransaction(tx: Transaction): boolean {
    const coinBaseTransaction: Transaction = {
      sender: tx.sender,
      recipient: this.address,
      type: TransactionTypes.CRYPTO,
      amount: Buffer.from(JSON.stringify(tx)).byteLength * 0.05,
      coinbase: true,
      hash: ""
    };
    const hashedCoinBaseTransaction: Transaction = this.deriveTxHash(
      coinBaseTransaction
    );
    this.transactionPool = _.concat(
      this.transactionPool,
      hashedCoinBaseTransaction
    );
    this.transactionPool = _.concat(this.transactionPool, tx);
    return true;
  }

  public prepareBlock(): Block {
    const block: Block = {
      nonce: 0,
      difficulty: 1,
      merkleRoot: "0",
      previousHash: _.last(_.map(this.chain, (b) => b.hash)),
      hash: "",
      timestamp: Date.now(),
      transactions: this.transactionPool
    };
    return block;
  }
}
