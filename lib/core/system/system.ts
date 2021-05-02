import { PlayerId } from '../player';
import { Balances, Transaction } from './models';
import { State } from './state';
import { IStore } from './store';

export interface ICommerceSystem {
  id: string;
  n: number;
  store: IStore<State>;

  getPlayerIds(excludes?: PlayerId[]): PlayerId[];

  getBalances(t: number): Balances;
  getBalance(playerId: PlayerId, t: number): number;

  getTransaction(t: number): Transaction | null;
  setTransaction(transaction: Transaction): void;
}