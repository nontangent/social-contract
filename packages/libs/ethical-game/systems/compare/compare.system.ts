import { PlayerId } from '@social-contract/libs/core/player';
import { Balances, IReputationSystem, IStore, Transaction } from "@social-contract/libs/core/system";

import { getLogger } from 'log4js';
const logger = getLogger(__filename);

export class CompareSystem implements IReputationSystem {
  constructor(
    private systems: IReputationSystem[] = [], 
    public id: string = 'system'
  ) { }

  get n(): number {
    return this.compare<number>(system => system.n);
  }

  get store(): IStore {
    return this.compare<IStore>(system => system.store);
  }

  get combinations(): [PlayerId, PlayerId][] {
    return this.compare<[PlayerId, PlayerId][]>(system => system.combinations);
  }

  private compare<T = any>(func: (system: IReputationSystem) => T) {
    let same!: T;
    this.systems.map(func).forEach((res: T) => {
      if (!same || JSON.stringify(same) === JSON.stringify(res)) {
        same = res;
      } else {
        console.error('A:', same);
        console.error('B:', res);
        throw new Error('Compared Systems does not return as same');
      }
    });
    return same;
  }

  getPlayerIds(excludes?: PlayerId[]): PlayerId[] {
    return this.compare(system => system.getPlayerIds(excludes));
  }

  getScores(t: number): Balances {
    return this.compare(system => system.getScores(t));
  }

  getScore(playerId: number, t: number): number {
    return this.compare(system => system.getScore(playerId, t));
  }

  getCombination(t: number): [PlayerId, PlayerId] {
    return this.compare(system => system.getCombination(t));
  }

  getTransaction(t: number): Transaction | null {
    return this.compare(system => system.getTransaction(t));
  }
  
  setTransaction(transaction: Transaction): void {
    return this.compare(system => system.setTransaction(transaction));
  }

  getReportedSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId, role: 'seller' | 'buyer'): [number, number] {
    return this.compare(system => system.getReportedSuccessRate(t, playerId, opportunityId, role));
  }

}