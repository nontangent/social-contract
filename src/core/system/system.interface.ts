import { PlayerId } from '../player';

export enum Result { SUCCESS, FAILED }

export interface Transaction {
  t: number;
  sellerId: PlayerId;
  buyerId: PlayerId;
  reporterId?: PlayerId;
  result: Result;
}

export type History = Record<number, Transaction>;

export type Balances = Record<PlayerId, number>;

export interface InitialState {
  balances: Balances;
}

export interface Rewards {
  seller: {
    success: number,
    failure: number,
  },
  buyer: {
    success: number,
    failure: number,
  },
}

export interface ICommerceSystem {
  price: number;
  getRewards(t: number, sellerId: PlayerId, buyerId: PlayerId): Rewards;
  getBurdenWeights(t: number, sellerId: PlayerId, buyerId: PlayerId): [number, number];
  getEscrowCost(t: number, sellerId: PlayerId, buyerId: PlayerId): number;

  getBalances(t: number): Balances;
  getBalance(platerId: PlayerId, t: number): number;

  getTransaction(t: number): Transaction;
  setTransaction(transaction: Transaction): void;

}