import { PlayerId } from '@social-contract/core/player';
import { Balances, ICommerceSystem, IStore, Transaction } from "@social-contract/core/system";
import { getLogger } from 'log4js';
const logger = getLogger(__filename);

export class CompareSystem implements ICommerceSystem {
  constructor(
    private systems: ICommerceSystem[] = [], 
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

  private compare<T = any>(func: (system: ICommerceSystem) => T) {
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

  getBalances(t: number): Balances {
    return this.compare(system => system.getBalances(t));
  }

  getBalance(playerId: number, t: number): number {
    return this.compare(system => system.getBalance(playerId, t));
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

  getSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId): [number, number] {
    return this.compare(system => system.getSuccessRate(t, playerId, opportunityId));
  }

}