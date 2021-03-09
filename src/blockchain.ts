import _ from "lodash";
import crypto from "crypto-js";
import { Block, Blocks, Transaction, Transactions } from "./interfaces";

export class BlockChain {
  public chain: Blocks = [];
  public transactionPool: Transactions = [];

  public addBlock(block: Block): Block {
    this.chain = _.concat(this.chain, block);
    return block;
  }

  public deriveHash(block: Block): Block {
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
}
