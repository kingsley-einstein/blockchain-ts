import test from "ava";
import _ from "lodash";
import debug from "debug";
import Blockchain from "../blockchain";
import { TransactionTypes } from "../enums";

const chain = new Blockchain();
const log = debug("test");

test("it should create keys", t => {
  const keys = chain.generateKeys();

  log(`Generated keys ==> ${JSON.stringify(keys, null, 2)}`);

  t.assert(_.isObject(keys));
  t.assert(_.hasIn(keys, "address"));
  t.assert(_.hasIn(keys, "privateKey"));
});

test("it should add pending transaction, return an array with length of 2 and be truthy for special cases", t => {
  const subject = chain.addPendingTransaction({
    sender: "0x0",
    recipient: "0x1",
    amount: 9,
    coinbase: false,
    hash: "",
    type: TransactionTypes.CRYPTO,
    timestamp: Date.now()
  });

  log(
    `Txn Hash tree ==> ${JSON.stringify(
      _.map(subject, tx => tx.hash),
      null,
      2
    )}`
  );

  t.deepEqual(subject.length, 2);
  t.is(_.get(_.head(subject), "coinbase"), true);
  t.is(_.get(_.head(subject), "type"), TransactionTypes.CRYPTO);
});

test("should mine block", t => {
  const block = chain.addBlock(chain.mineBlock(3));

  log(`New block ==> ${JSON.stringify(block, null, 2)}`);

  t.true(block.difficulty === 3);
});

test("chain is valid", t => t.true(chain.chainIsValid()));
