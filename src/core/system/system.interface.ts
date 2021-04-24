import { PlayerId } from '../player';

export enum Result {
  SUCCESS = 'SUCCESS',
  FAILED='FAILED',
}

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
  n: number;
  initialState: InitialState;
  history: History;

  getPlayerIds(excludes?: PlayerId[]): PlayerId[];

  getBalances(t: number): Balances;
  getBalance(playerId: PlayerId, t: number): number;

  getTransaction(t: number): Transaction;
  setTransaction(transaction: Transaction): void;

}