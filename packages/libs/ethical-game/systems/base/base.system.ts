import { 
  PlayerId, Balances, ICommerceSystem, InitialState, IStore, Result, Rewards, Transaction 
} from '@social-contract/libs/core';
import { Store } from '@social-contract/libs/ethical-game';
import { permutation, sum } from '@social-contract/libs/utils/helpers';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);

export type EscrowWeights = Record<PlayerId, number>;

export abstract class BaseCommerceSystem implements ICommerceSystem {
  public price = 1;
  store: IStore = new Store();

  constructor(initialState: InitialState, public id: string = 'system') {
    this.store.setInitialState(initialState)
  }

  getRewards(t: number, sellerId: PlayerId, buyerId: PlayerId): Rewards {
    // 時刻tのTransactionがなければエラー
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    // エスクローコスト(失敗が報告された場合に没収される合計金額)を決定する
    const E = this.getEscrowCost(t, sellerId, buyerId);
    logger.debug(`EscrowCost: ${E}`);

    // エスクローコストの負担割合を決定する
    const [sellerW, buyerW] = this.getNormalizedBurdenWeights(t, sellerId, buyerId);
    logger.debug(`sellerW: ${sellerW}, buyerW: ${buyerW}`);

    // 成功が報告された場合と失敗が報告された場合のsellerとbuyerのbalancesの変動値を決定する
    return {
      seller: {
        success: this.price,
        failure: this.price * (1 - sellerW * E),
      },
      buyer: {
        success: - this.price,
        failure: this.price * (- 1 - buyerW * E),
      }
    }
  }

  getTransaction(t: number): Transaction | null {
    return this.store.getTransaction(t);
  }

  setTransaction(transaction: Transaction): void {
    return this.store.setTransaction(transaction);
  }

  getBalances(t: number): Balances {

    // 時刻が0の場合は初期状態のbalancesを返す
    if (t === 0) return this.store.getInitialState()!.balances;

    // 時刻t-1のbalancesを取得する
    const balances = this.getBalances(t-1);
    
    // 時刻tの商取引を取得する
    const transaction = this.getTransaction(t);
    if (!transaction) throw new Error(`A transaction at time(${t}) is none.`);

    const {sellerId, buyerId, result} = transaction;

    // 商取引ゲームに伴うbalancesの変動の幅を取得する
    const rewards = this.getRewards(t, sellerId, buyerId);
    logger.debug('rewards:', rewards);

    // 失敗が報告された場合にsellerかbuyerのどちらかの残高が0以下になるならば、balancesを変動させずに返す
    if (
      balances[sellerId] + rewards.seller.success < 0 ||
      balances[sellerId] + rewards.seller.failure < 0 || 
      balances[buyerId] + rewards.buyer.success < 0 ||
      balances[buyerId] + rewards.buyer.failure < 0
    ) return balances;

    // 報告された結果に基づいてbalancesを変動させる
    balances[sellerId] += result === Result.SUCCESS ? rewards.seller.success : rewards.seller.failure;
    balances[buyerId] += result === Result.SUCCESS ? rewards.buyer.success : rewards.buyer.failure;
    logger.debug('result:', result);

    // 現在のbalancesの総量を取得する
    const currentAmount = Math.round(this.getTotalAmount(balances));
    logger.debug('currentAmount:', currentAmount);

    // 初期のbalancesの総量を取得する
    const initialAmount = Math.round(this.getTotalAmount(this.store.getInitialState()!.balances));
    logger.debug('initialAmount:', initialAmount);

    // 初期と現在のbalancesの総量の差を計算する
    const delta = initialAmount - currentAmount;
    logger.debug('delta:', delta);

    // 差分を各プレイヤーに分配する際に用いる重みを取得する
    // ここの引数に撮るbalancesはEscrowCostが引かれたあとのもの
    const escrowWeights = this.getEscrowWeights(balances, [sellerId, buyerId]);
    logger.debug('escrowWeights:', escrowWeights);

    // 差分を各プレイヤーに分配する
    Object.entries(escrowWeights).forEach(([id, w]) => {
      balances[parseInt(id, 10)] += delta * w;
    });
    return balances
  }

  getBalance(playerId: PlayerId, t: number): number {
    return this.getBalances(t)[playerId];
  }

  get n(): number {
    return Object.keys(this.store.getInitialState()!.balances).length;
  }

  private _combinations: [PlayerId, PlayerId][] | undefined;
  get combinations(): [PlayerId, PlayerId][] {
    if (!this._combinations) this._combinations = this.generateCombinations(this.getPlayerIds());
    return this._combinations;
  }

  protected generateCombinations(playerIds: PlayerId[]): [PlayerId, PlayerId][] {
    return permutation<PlayerId>(playerIds, 2) as [PlayerId, PlayerId][];
  }

  getCombination(t: number): [PlayerId, PlayerId] {
    const i = (t % this.combinations.length) || this.combinations.length;
    return this.combinations[i-1];
  }

  getPlayerIds(excludeIds: PlayerId[] = []): PlayerId[] {
    return Object.keys(this.store.getInitialState()!.balances)
      .map(id => parseInt(id, 10))
      .filter(id => !excludeIds.includes(id));
  }

  getTotalAmount(balances: Balances, excludeIds: PlayerId[] = []): number {
    const playerIds = this.getPlayerIds(excludeIds);
    return sum(playerIds.map(id => balances[id]));
  }

  // システムに失敗が報告された場合に没収される額を各プレイヤーに分配する重みを取得する
  private getEscrowWeights(balances: Balances, excludeIds: PlayerId[]): EscrowWeights {
    const escrowIds = this.getPlayerIds(excludeIds);
    const totalBalance = sum(escrowIds.map(id => balances[id]));

    // totalBalanceが0でなければ、プレイヤーの占める割合、0の場合は1をプレイヤー数で割った数
    return escrowIds.reduce((p, id) => ({
      ...p, 
      [id]: totalBalance !== 0 ? balances[id] / totalBalance : 1 / escrowIds.length
    }), {} as EscrowWeights);
  }
  

  abstract getNormalizedBurdenWeights(t: number, sellerId: PlayerId, buyerId: PlayerId): [number, number];
  abstract getEscrowCost(t: number, sellerId: PlayerId, buyerId: PlayerId): number;
  // abstract getEscrowWeights(t: number, balances: Balances, excludeIds: PlayerId[]): EscrowWeights;
  abstract getReportedSuccessRate(t: number, playerId: PlayerId, opportunityId: PlayerId, role: 'seller' | 'buyer'): [number, number];
}