import { TransactionTypes } from "../enums";

export default interface Transaction {
  sender: string;
  recipient: string;
  type: TransactionTypes;
  amount: number;
  coinbase: boolean;
  hash: string;
}

export type Transactions = Array<Transaction>;
