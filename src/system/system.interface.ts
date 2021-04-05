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

export interface InitialState {
  balances: Record<PlayerId, number>;
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