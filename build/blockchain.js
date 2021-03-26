"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var lodash_1 = __importDefault(require("lodash"));
var elliptic_1 = __importDefault(require("elliptic"));
var crypto_js_1 = __importDefault(require("crypto-js"));
var debug_1 = __importDefault(require("debug"));
var enums_1 = require("./enums");
var log = debug_1["default"]("chain");
var BlockChain = /** @class */ (function () {
    function BlockChain() {
        this.chain = [];
        this.transactionPool = [];
        this.address = "";
        this.chain = lodash_1["default"].concat(this.chain, this.genesis());
    }
    BlockChain.prototype.genesis = function () {
        var b = {
            timestamp: Date.now(),
            hash: "",
            transactions: [],
            nonce: 0,
            merkleRoot: "",
            previousHash: "0000",
            difficulty: 1
        };
        return this.deriveBlockHash(b);
    };
    BlockChain.prototype.generateKeys = function () {
        var EC = new elliptic_1["default"].ec("secp256k1");
        var keypair = EC.genKeyPair();
        var privateKey = keypair.getPrivate().toString("hex");
        var address = crypto_js_1["default"].MD5(privateKey).toString(crypto_js_1["default"].enc.Hex);
        return { address: address, privateKey: privateKey };
    };
    BlockChain.prototype.addBlock = function (block) {
        this.chain = lodash_1["default"].concat(this.chain, block);
        this.transactionPool = [];
        return block;
    };
    BlockChain.prototype.deriveTxHash = function (tx) {
        var derivedTx = __assign(__assign({}, tx), { hash: crypto_js_1["default"]
                .SHA256(JSON.stringify({
                sender: tx.sender,
                recipient: tx.recipient,
                coinbase: tx.coinbase,
                amount: tx.amount,
                type: tx.type,
                timestamp: tx.timestamp
            }))
                .toString() });
        return derivedTx;
    };
    BlockChain.prototype.deriveBlockHash = function (block) {
        var derivedBlock = __assign(__assign({}, block), { merkleRoot: lodash_1["default"].head(this.deriveMerkleRoot(lodash_1["default"].map(block.transactions, function (tx) { return tx.hash; }))) });
        return __assign(__assign({}, derivedBlock), { hash: crypto_js_1["default"]
                .SHA256(JSON.stringify({
                previousHash: derivedBlock.previousHash,
                timestamp: derivedBlock.timestamp,
                nonce: derivedBlock.nonce,
                transactions: derivedBlock.transactions,
                difficulty: derivedBlock.difficulty,
                merkleRoot: derivedBlock.merkleRoot
            }))
                .toString() });
    };
    BlockChain.prototype.deriveMerkleRoot = function (hashes) {
        log("Running merkle root derivation for tree ==> " + JSON.stringify(hashes));
        if (lodash_1["default"].isNull(hashes))
            return [""];
        if (lodash_1["default"].isEqual(hashes.length, 0))
            return [""];
        if (lodash_1["default"].isEqual(hashes.length, 1))
            return hashes;
        var root = [hashes];
        while (lodash_1["default"].gt(lodash_1["default"].head(root).length, 1)) {
            var temp = [];
            for (var i = 0; i < lodash_1["default"].head(root).length; i += 2) {
                if (i < lodash_1["default"].subtract(lodash_1["default"].head(root).length, 1) && lodash_1["default"].isEqual(i % 2, 0))
                    temp = lodash_1["default"].concat(temp, crypto_js_1["default"].SHA256(lodash_1["default"].head(root)[i] + lodash_1["default"].head(root)[i + 1]).toString());
                else
                    temp = lodash_1["default"].concat(temp, lodash_1["default"].head(root)[i]);
            }
            root.unshift(temp);
        }
        return lodash_1["default"].head(root);
    };
    BlockChain.prototype.addPendingTransaction = function (tx) {
        var coinBaseTransaction = {
            sender: tx.sender,
            recipient: this.address,
            type: enums_1.TransactionTypes.CRYPTO,
            amount: Buffer.from(JSON.stringify(tx)).byteLength * 0.05,
            coinbase: true,
            hash: "",
            timestamp: Date.now()
        };
        var hashedCoinBaseTransaction = this.deriveTxHash(coinBaseTransaction);
        var hashedTx = this.deriveTxHash(tx);
        this.transactionPool = lodash_1["default"].concat(this.transactionPool, hashedCoinBaseTransaction, hashedTx);
        return lodash_1["default"].filter(this.transactionPool, function (tx) {
            return lodash_1["default"].isEqual(tx.hash, hashedCoinBaseTransaction.hash) ||
                lodash_1["default"].isEqual(tx.hash, hashedTx.hash);
        });
    };
    BlockChain.prototype.prepareBlock = function (difficulty) {
        var block = {
            nonce: 0,
            difficulty: difficulty,
            merkleRoot: "0",
            previousHash: lodash_1["default"].last(lodash_1["default"].map(this.chain, function (b) { return b.hash; })),
            hash: "",
            timestamp: Date.now(),
            transactions: this.transactionPool
        };
        log("Preparing block ==> " + JSON.stringify(block, null, 2));
        return block;
    };
    BlockChain.prototype.proofOfTransaction = function (b) {
        log("Checking transaction integrity for block ==> " + lodash_1["default"].get(b, "hash"));
        return lodash_1["default"].isEqual(lodash_1["default"].head(this.deriveMerkleRoot(lodash_1["default"].map(b.transactions, function (tx) { return tx.hash; }))), b.merkleRoot);
    };
    BlockChain.prototype.mineBlock = function (difficulty) {
        var b = this.prepareBlock(difficulty);
        var mineableBlock = this.deriveBlockHash(b);
        var iteration = 0;
        while (!lodash_1["default"].isEqual(mineableBlock.hash.substring(0, difficulty), Array(difficulty + 1).join("0"))) {
            iteration = iteration + 1;
            mineableBlock.nonce = mineableBlock.nonce + 1;
            mineableBlock.timestamp = Date.now();
            mineableBlock = this.deriveBlockHash(mineableBlock);
            log("Iteration ==> " + iteration + " Derived hash ==> " + mineableBlock.hash);
        }
        return mineableBlock;
    };
    BlockChain.prototype.chainIsValid = function () {
        for (var i = 1; i < this.chain.length; i++) {
            var previousBlock = lodash_1["default"].get(this.chain, i - 1);
            var currentBlock = lodash_1["default"].get(this.chain, i);
            log("Checking validity for block ==> " + lodash_1["default"].get(currentBlock, "hash"));
            log("Current block ==> " + JSON.stringify(currentBlock));
            log("Previous block ==> " + JSON.stringify(previousBlock));
            if (!lodash_1["default"].isEqual(previousBlock.hash, currentBlock.previousHash))
                return false;
            if (!lodash_1["default"].isEqual(currentBlock, this.deriveBlockHash(currentBlock)))
                return false;
            if (!this.proofOfTransaction(currentBlock))
                return false;
        }
        return true;
    };
    BlockChain.prototype.getChain = function () {
        return this.chain;
    };
    return BlockChain;
}());
exports["default"] = BlockChain;
