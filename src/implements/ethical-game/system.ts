import { PlayerId } from '@social-contract/core/player';
import { sum } from '@social-contract/core/helpers';
import { Balances, History, ICommerceSystem, InitialState, Result, Rewards, Transaction } from "@social-contract/core/system";

export type EscrowWeights = Record<PlayerId, number>;

export abstract class BaseCommerceSystem implements ICommerceSystem {
  protected history: History = {};
  public price = 1;
  totalBalances!: number;

  constructor(public initialState: InitialState) {
    this.totalBalances = sum(Object.values(this.initialState.balances));
  }

  getRewards(t: number, sellerId: PlayerId, buyerId: PlayerId): Rewards {
    const [sellerW, buyerW] = this.getBurdenWeights(t, sellerId, buyerId);
    const E = this.getEscrowCost(t, sellerId, buyerId);

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

  getTransaction(t: number): Transaction {
    return this.history[t];
  }

  setTransaction(transaction: Transaction) {
    this.history[transaction.t] = transaction;
  }

  getBalances(t: number): Balances {
    console.debug('t:', t);
    if (t === 0) return this.initialState.balances;

    const balances = this.getBalances(t-1);
    const transaction = this.history?.[t] || null;

    if (!transaction) return balances;

    const {sellerId, buyerId, result} = transaction;
    const rewards = this.getRewards(t, sellerId, buyerId);
    balances[sellerId] += result === Result.SUCCESS ? rewards.seller.success : rewards.seller.failure;
    balances[buyerId] += result === Result.SUCCESS ? rewards.buyer.success : rewards.buyer.failure;

    //　失敗の場合、エスクローに分配する。
    const current = sum(Object.values(balances));
    const delta = this.totalBalances - current;

    for(const [id, w] of Object.keys(balances).map(s => parseInt(s, 10)).map(id => [id, balances[id] / current])) {
      balances[id] += delta * w;
    }

    return balances
  }

  getBalance(playerId: PlayerId, t: number): number {
    return this.getBalances(t)[playerId];
  }

  get n(): number {
    return Object.keys(this.initialState).length;
  }

  get historyLength(): number {
    return Object.keys(this.history).length;
  }

  get playerIds(): PlayerId[] {
    return Object.keys(this.initialState.balances).map(k => parseInt(k, 10));
  }

  protected get allPlayerIds(): PlayerId[] {
    return Object.keys(this.initialState).map(
      id => parseInt(id, 10
      ));
  }

  protected getTotalBalance(t: number, excludeIds: PlayerId[] = []): number {
    const balances = this.getBalances(t);
    return sum(excludeIds.map(id => balances[id]));
  }

  abstract getBurdenWeights(t: number, sellerId: PlayerId, buyerId: PlayerId): [number, number];
  abstract getEscrowCost(t: number, sellerId: PlayerId, buyerId: PlayerId): number;

}

export class CommerceSystem extends BaseCommerceSystem {

  getBurdenWeights(t: number, sellerId: PlayerId, buyerId: PlayerId): [number, number] {
    const sellerT = this.getTrust(t, sellerId, [buyerId]);
    const buyerT = this.getTrust(t, buyerId, [sellerId]);

    const unadjustedSellerBurdenWeight = this.burdenWeightFunction(sellerT);
    const unadjustedBuyerBurdenWeight = this.burdenWeightFunction(buyerT);

    return [
      unadjustedBuyerBurdenWeight / (unadjustedSellerBurdenWeight + unadjustedBuyerBurdenWeight),
      unadjustedSellerBurdenWeight / (unadjustedSellerBurdenWeight + unadjustedBuyerBurdenWeight),
    ];
  }

  getEscrowCost(t: number, sellerId: PlayerId, buyerId: PlayerId): number {
    const sellerT = this.getTrust(t, sellerId, [buyerId]);
    const buyerT = this.getTrust(t, buyerId, [sellerId]);

    const unadjustedSellerBurdenWeight = this.burdenWeightFunction(sellerT);
    const unadjustedBuyerBurdenWeight = this.burdenWeightFunction(buyerT);

    // MEMO: この計算式なんだっけ？
    const e = (unadjustedSellerBurdenWeight + unadjustedBuyerBurdenWeight) 
    / (Math.min(unadjustedBuyerBurdenWeight, unadjustedSellerBurdenWeight) * buyerT)
    return e;
  }

  private getEscrowWeights(t: number, escrowIds: PlayerId[]): EscrowWeights {
    return escrowIds.reduce((p, id) => ({...p, id: this.getReputationWeight(t, id, escrowIds)}), {} as EscrowWeights);
  }

  private getTrust(t: number, playerId: PlayerId, excludeIds: PlayerId[]) {
    let trust = this.getReputationWeight(t, playerId);
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
      trust += this.getReputationWeight(t, opportunityId) * successRate;
    }

    return trust;
  }

  private getReputationWeight(
    t: number,
    playerId: PlayerId, 
    allIds: PlayerId[] = this.allPlayerIds, 
    excludeIds: PlayerId[] = []
  ) {
    return this.getBalance(playerId, t) / this.getTotalBalance(t, allIds.filter(id => excludeIds.includes(id)));
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
    const successRate = count 
      ? results.map(r => r === Result.SUCCESS ? 1 : 0).reduce((p, c) => p + c, 0 as number) / count
      : 0;
    
    return [successRate, count];
  }

  private get burdenWeightFunction(): (w: number) => number {
    return (w: number) => w;
  }

}