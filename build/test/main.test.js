"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ava_1 = __importDefault(require("ava"));
var lodash_1 = __importDefault(require("lodash"));
var debug_1 = __importDefault(require("debug"));
var blockchain_1 = __importDefault(require("../blockchain"));
var enums_1 = require("../enums");
var chain = new blockchain_1["default"]();
var log = debug_1["default"]("test");
ava_1["default"]("it should create keys", function (t) {
    var keys = chain.generateKeys();
    log("Generated keys ==> " + JSON.stringify(keys, null, 2));
    t.assert(lodash_1["default"].isObject(keys));
    t.assert(lodash_1["default"].hasIn(keys, "address"));
    t.assert(lodash_1["default"].hasIn(keys, "privateKey"));
});
ava_1["default"]("it should add pending transaction, return an array with length of 2 and be truthy for special cases", function (t) {
    var subject = chain.addPendingTransaction({
        sender: "0x0",
        recipient: "0x1",
        amount: 9,
        coinbase: false,
        hash: "",
        type: enums_1.TransactionTypes.CRYPTO,
        timestamp: Date.now()
    });
    log("Txn Hash tree ==> " + JSON.stringify(lodash_1["default"].map(subject, function (tx) { return tx.hash; }), null, 2));
    t.deepEqual(subject.length, 2);
    t.is(lodash_1["default"].get(lodash_1["default"].head(subject), "coinbase"), true);
    t.is(lodash_1["default"].get(lodash_1["default"].head(subject), "type"), enums_1.TransactionTypes.CRYPTO);
});
ava_1["default"]("should mine block", function (t) {
    var block = chain.addBlock(chain.mineBlock(3));
    log("New block ==> " + JSON.stringify(block, null, 2));
    t["true"](block.difficulty === 3);
});
ava_1["default"]("chain is valid", function (t) { return t["true"](chain.chainIsValid()); });
