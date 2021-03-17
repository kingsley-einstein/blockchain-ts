import _ from "lodash";
import elliptic from "elliptic";
import crypto from "crypto-js";
import debug from "debug";
import { Block, Blocks, Transaction, Transactions } from "./interfaces";
import { TransactionTypes } from "./enums";

const log = debug("chain");

export default class BlockChain {
  public chain: Blocks = [];
  public transactionPool: Transactions = [];
  public address: string = "";

  constructor() {
    this.chain = _.concat(this.chain, this.genesis());
  }

  private genesis(): Block {
    const b: Block = {
      timestamp: Date.now(),
      hash: "",
      transactions: [],
      nonce: 0,
      merkleRoot: "",
      previousHash: "0000",
      difficulty: 1
    };
    return this.deriveBlockHash(b);
  }

  public generateKeys(): { address: string; privateKey: string } {
    const EC = new elliptic.ec("secp256k1");
    const keypair = EC.genKeyPair();
    const privateKey = keypair.getPrivate().toString("hex");
    const address = crypto.MD5(privateKey).toString(crypto.enc.Hex);
    return { address, privateKey };
  }

  public addBlock(block: Block): Block {
    this.chain = _.concat(this.chain, block);
    this.transactionPool = [];
    return block;
  }

  private deriveTxHash(tx: Transaction): Transaction {
    const derivedTx: Transaction = {
      ...tx,
      hash: crypto
        .SHA256(
          JSON.stringify({
            sender: tx.sender,
            recipient: tx.recipient,
            coinbase: tx.coinbase,
            amount: tx.amount,
            type: tx.type,
            timestamp: tx.timestamp
          })
        )
        .toString()
    };
    return derivedTx;
  }

  private deriveBlockHash(block: Block): Block {
    const derivedBlock: Block = {
      ...block,
      merkleRoot: _.head(
        this.deriveMerkleRoot(_.map(block.transactions, tx => tx.hash))
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
    log(
      `Running merkle root derivation for tree ==> ${JSON.stringify(hashes)}`
    );

    if (_.isNull(hashes)) return [""];

    if (_.isEqual(hashes.length, 0)) return [""];

    if (_.isEqual(hashes.length, 1)) return hashes;

    const root = [hashes];

    while (_.gt(_.head(root).length, 1)) {
      let temp: Array<string> = [];

      for (let i = 0; i < _.head(root).length; i += 2) {
        if (i < _.subtract(_.head(root).length, 1) && _.isEqual(i % 2, 0))
          temp = _.concat(
            temp,
            crypto.SHA256(_.head(root)[i] + _.head(root)[i + 1]).toString()
          );
        else temp = _.concat(temp, _.head(root)[i]);
      }
      root.unshift(temp);
    }
    return _.head(root);
  }

  public addPendingTransaction(tx: Transaction): Transactions {
    const coinBaseTransaction: Transaction = {
      sender: tx.sender,
      recipient: this.address,
      type: TransactionTypes.CRYPTO,
      amount: Buffer.from(JSON.stringify(tx)).byteLength * 0.05,
      coinbase: true,
      hash: "",
      timestamp: Date.now()
    };
    const hashedCoinBaseTransaction: Transaction = this.deriveTxHash(
      coinBaseTransaction
    );
    const hashedTx: Transaction = this.deriveTxHash(tx);
    this.transactionPool = _.concat(
      this.transactionPool,
      hashedCoinBaseTransaction,
      hashedTx
    );
    return _.filter(
      this.transactionPool,
      tx =>
        _.isEqual(tx.hash, hashedCoinBaseTransaction.hash) ||
        _.isEqual(tx.hash, hashedTx.hash)
    );
  }

  private prepareBlock(difficulty: number): Block {
    const block: Block = {
      nonce: 0,
      difficulty,
      merkleRoot: "0",
      previousHash: _.last(_.map(this.chain, b => b.hash)),
      hash: "",
      timestamp: Date.now(),
      transactions: this.transactionPool
    };

    log(`Preparing block ==> ${JSON.stringify(block, null, 2)}`);

    return block;
  }

  private proofOfTransaction(b: Block) {
    log(`Checking transaction integrity for block ==> ${_.get(b, "hash")}`);

    return _.isEqual(
      _.head(this.deriveMerkleRoot(_.map(b.transactions, tx => tx.hash))),
      b.merkleRoot
    );
  }

  public mineBlock(difficulty: number) {
    const b = this.prepareBlock(difficulty);
    let mineableBlock: Block = this.deriveBlockHash(b);

    let iteration = 0;

    while (
      !_.isEqual(
        mineableBlock.hash.substring(0, difficulty),
        Array(difficulty + 1).join("0")
      )
    ) {
      iteration = iteration + 1;

      mineableBlock.nonce = mineableBlock.nonce + 1;
      mineableBlock.timestamp = Date.now();
      mineableBlock = this.deriveBlockHash(mineableBlock);

      log(`Iteration ==> ${iteration} Derived hash ==> ${mineableBlock.hash}`);
    }

    return mineableBlock;
  }

  public chainIsValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const previousBlock = _.get(this.chain, i - 1);
      const currentBlock = _.get(this.chain, i);

      log(`Checking validity for block ==> ${_.get(currentBlock, "hash")}`);
      log(`Current block ==> ${JSON.stringify(currentBlock)}`);
      log(`Previous block ==> ${JSON.stringify(previousBlock)}`);

      if (!_.isEqual(previousBlock.hash, currentBlock.previousHash))
        return false;

      if (!_.isEqual(currentBlock, this.deriveBlockHash(currentBlock)))
        return false;

      if (!this.proofOfTransaction(currentBlock)) return false;
    }

    return true;
  }

  public getChain(): Blocks {
    return this.chain;
  }
}
