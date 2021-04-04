import { CommerceRecord, CommerceResult, History, PlayerId } from './models';

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

export abstract class BaseCommerceSystem {
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

  private get historyLength(): number {
    return Object.keys(this.history).length;
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

  getBalance(playerId: PlayerId): number {
    return 0;
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
    // TODO: implements
    return [];
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
    return this.getBalance(playerId) / this.getTotalBalance(allIds.filter(id => excludeIds.includes(id)));
  }

  calculateTotalBalance(playerIds: PlayerId[], excludeIds: PlayerId[] = []): number {
    const totalBalance = this.getTotalBalance(excludeIds);
    return totalBalance;
  }

  private getSuccessRate(playerId: PlayerId, opportunityId: PlayerId): [number, number] {
    const results: CommerceResult[] = [];
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
      ? results.map(r => r === CommerceResult.SUCCESS ? 1 : 0).reduce((p, c) => p + c, 0 as number) / count
      : 0;
    
    return [successRate, count];
  }

  private get burdenWeightFunction(): (w: number) => number {
    return (w: number) => w;
  }

  getEscrowWeights(escrowIds: PlayerId[]): Record<PlayerId, number> {
    return escrowIds.reduce((p, id) => ({
      ...p,
      id: this.getReputationWeight(id, escrowIds)
    }), {} as Record<PlayerId, number>);
  }

  getRecord(t: number): CommerceRecord {
    return this.history[t];
  }

  setRecord(record: CommerceRecord) {
    this.history[record.t] = record;
  }
}