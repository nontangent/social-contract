import { PlayerId } from '../player';
import { Transaction, Result, History, Rewards, InitialState, Balances, ICommerceSystem } from './system.interface';

export abstract class BaseCommerceSystem implements ICommerceSystem {
  getRewards(sellerId: PlayerId, buyerId: PlayerId): Rewards {
    const [sellerW, buyerW] = this.getBurdenWeights(sellerId, buyerId);
    const E = this.getEscrowCost(sellerId, buyerId);

    return {
      seller: {
        success: this.price,
        failure: this.price - (sellerW * E * this.price),
      },
      buyer: {
        success: -1 * this.price,
        failure: this.price - (buyerW * E * this.price),
      }
    }
  }

  abstract getBurdenWeights(sellerId: PlayerId, buyerId: PlayerId): [number, number];
  abstract getEscrowCost(sellerId: PlayerId, buyerId: PlayerId): number;
  abstract getBalances(t: number): Balances;
  abstract getBalance(playerId: PlayerId, t: number): number;

  abstract get price(): number;
}

export class CommerceSystem extends BaseCommerceSystem {
  private history: History = {};

  constructor(public initialState: InitialState) {
    super();
  }
  
  get n(): number {
    return Object.keys(this.initialState).length;
  }

  get price() {
    return 1;
  }

  get t(): number {
    return Math.max(...Object.keys(this.history).map(k => parseInt(k)));
  }

  private get historyLength(): number {
    return Object.keys(this.history).length;
  }

  get playerIds(): PlayerId[] {
    return Object.keys(this.initialState.balances).map(k => parseInt(k, 10));
  }

  getBalances(t: number): Balances {
    return this.playerIds.reduce((pre, playerId: PlayerId) => ({
      ...pre, [playerId]: this.getBalance(playerId, t) 
    }), {} as Balances);
  }

  getBalance(playerId: PlayerId, t: number): number {
    // TODO: implements
    return this.initialState.balances?.[playerId] || 1;
  }

  getBurdenWeights(sellerId: PlayerId, buyerId: PlayerId): [number, number] {
    const sellerT = this.getTrust(sellerId, [buyerId]);
    const buyerT = this.getTrust(buyerId, [sellerId]);

    const unadjustedSellerBurdenWeight = this.burdenWeightFunction(sellerT);
    const unadjustedBuyerBurdenWeight = this.burdenWeightFunction(buyerT);

    return [
      unadjustedBuyerBurdenWeight / (unadjustedSellerBurdenWeight + unadjustedBuyerBurdenWeight),
      unadjustedSellerBurdenWeight / (unadjustedSellerBurdenWeight + unadjustedBuyerBurdenWeight),
    ];
  }

  getEscrowCost(sellerId: PlayerId, buyerId: PlayerId): number {
    const sellerT = this.getTrust(sellerId, [buyerId]);
    const buyerT = this.getTrust(buyerId, [sellerId]);

    const unadjustedSellerBurdenWeight = this.burdenWeightFunction(sellerT);
    const unadjustedBuyerBurdenWeight = this.burdenWeightFunction(buyerT);

    // MEMO: この計算式なんだっけ？
    const e = (unadjustedSellerBurdenWeight + unadjustedBuyerBurdenWeight) 
    / (Math.min(unadjustedBuyerBurdenWeight, unadjustedSellerBurdenWeight) * buyerT)
    return e;
  }

  private get allPlayerIds(): PlayerId[] {
    return Object.keys(this.initialState).map(id => parseInt(id));
  }

  private getTrust(playerId: PlayerId, excludeIds: PlayerId[]) {
    let t = this.getReputationWeight(playerId);
    const opportunityIds = new Set<PlayerId>();
    for (const record of Object.values(this.history)) {
      if (record.sellerId === playerId) {
        opportunityIds.add(record.buyerId)
      } else if (record.buyerId === playerId) {
        opportunityIds.add(record.sellerId)
      }
    }

    for (const opportunityId of opportunityIds) {
      if (excludeIds.includes(opportunityId)) continue;
      const [successRate, _] = this.getSuccessRate(playerId, opportunityId);
      t += this.getReputationWeight(opportunityId) * successRate;
    }

    return t;
  }

  private getTotalBalance(excludeIds: PlayerId[] = []): number {
    // TODO: implements
    return 1000;
  }

  private getReputationWeight(
    playerId: PlayerId, 
    allIds: PlayerId[] = this.allPlayerIds, 
    excludeIds: PlayerId[] = []
  ) {
    return this.getBalance(playerId, this.t) / this.getTotalBalance(allIds.filter(id => excludeIds.includes(id)));
  }

  calculateTotalBalance(playerIds: PlayerId[], excludeIds: PlayerId[] = []): number {
    const totalBalance = this.getTotalBalance(excludeIds);
    return totalBalance;
  }

  private getSuccessRate(playerId: PlayerId, opportunityId: PlayerId): [number, number] {
    const results: Result[] = [];
    for (const record of Object.values(this.history)) {
      if (record.sellerId === playerId && record.buyerId === opportunityId) {
        results.push(record.result);
      // MEMO: この条件式あってる？？
      } else if (record.buyerId === opportunityId || record.sellerId === playerId) {
        results.push(record.result);
      }
    }

    const count = results.length;
    const successRate: number = count 
      ? results.map(r => r === Result.SUCCESS ? 1 : 0).reduce((p, c) => p + c, 0 as number) / count
      : 0;
    
    return [successRate, count];
  }

  private get burdenWeightFunction(): (w: number) => number {
    return (w: number) => w;
  }

  getEscrowWeights(escrowIds: PlayerId[]): EscrowWeights {
    return escrowIds.reduce((p, id) => ({
      ...p,
      id: this.getReputationWeight(id, escrowIds)
    }), {} as EscrowWeights);
  }

  getRecord(t: number): Transaction {
    return this.history[t];
  }

  setRecord(record: Transaction) {
    this.history[record.t] = record;
  }
}

type EscrowWeights = Record<PlayerId, number>;