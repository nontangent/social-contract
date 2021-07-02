import { PlayerId } from '../player';
import { Balances, Transaction } from './models';
import { State } from './state';
import { IStore } from './store';

export interface IReputationSystem {
  id: string;
  n: number;
  store: IStore<State>;
  combinations: [PlayerId, PlayerId][];

  getPlayerIds(excludes?: PlayerId[]): PlayerId[];

  getScores(t: number): Balances;
  getScore(playerId: PlayerId, t: number): number;

  getTransaction(t: number): Transaction | null;
  setTransaction(transaction: Transaction): void;

  getReportedSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId, role: 'seller' | 'buyer'): [number, number];
  getCombination(t: number): [PlayerId, PlayerId];
}