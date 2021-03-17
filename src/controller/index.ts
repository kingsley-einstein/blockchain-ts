import express from "express";
import BlockChain from "../blockchain";
import { TransactionTypes } from "../enums";
import { Block, Transaction } from "../interfaces";

const chain = new BlockChain();

export default class Controller {
  static async createKeys(req: express.Request, res: express.Response) {
    try {
      const keys = chain.generateKeys();
      return res.status(201).json({ ...keys });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  static async addNewTx(req: express.Request, res: express.Response) {
    try {
      const body = req.body;
      const newTx: Transaction = {
        type: TransactionTypes.CRYPTO,
        coinbase: false,
        sender: body.sender,
        recipient: body.recipient,
        amount: body.amount,
        hash: "",
        timestamp: Date.now()
      };
      return res.status(201).json(chain.addPendingTransaction(newTx));
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  static async mineBlock(req: express.Request, res: express.Response) {
    try {
      const block: Block = chain.mineBlock(
        parseInt(req.query.difficulty.toString() || "3")
      );
      return res.status(201).json(chain.addBlock(block));
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  static async validateChain(req: express.Request, res: express.Response) {
    try {
      const isValid = chain.chainIsValid();
      return res.status(200).json(isValid);
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  static async getChain(req: express.Request, res: express.Response) {
    try {
      return res.status(200).json(chain.getChain());
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }
}
