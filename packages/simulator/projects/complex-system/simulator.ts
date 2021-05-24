import { Queue, sleep } from '@social-contract/utils/helpers';
import { IPresenter } from '@social-contract/presenters';
import { BaseSimulator } from '@social-contract/core/simulator';
import { ICommerceSystem, Result, Transaction } from '@social-contract/core/system';
import { SuccessRateRecorder } from '@social-contract/core/recorder';

import { IContractPlayer } from './player.interface';
import { IContractSimulator } from './simulator.interface';

import { getLogger } from 'log4js';
import { Player } from './player';
const logger = getLogger(__filename);

export type RecorderMap = Map<IContractPlayer | string, SuccessRateRecorder>;
export type RecorderParams = {system: ICommerceSystem, transaction: Transaction};
export type RecorderQueueMap = Map<IContractPlayer | string, Queue<RecorderParams>>;

export class Simulator extends BaseSimulator<IContractPlayer> implements IContractSimulator {
  recorderMap: RecorderMap;
  private recorderQueueMap;

  constructor(
    public players: IContractPlayer[] = [],
    public presenter: IPresenter,
  ) {
    super();
    this.recorderMap = this.buildRecorderMap(players);
    this.recorderQueueMap = this.buildRecorderQueueMap(players);
  }

  async run(maxT: number = 10, interval: number = 0) {
    // sellerとbuyerの一周の順番を決める(n * (n-1))。
    const combinations = this.generateCombinations();
    logger.info('combinations:', combinations);

    while (this.t < combinations.length * maxT) {
      for (const [sellerId, buyerId] of combinations) {
        // 時刻を進める
        this.t += 1;
        for (const player of this.players) player.t = this.t;

        // seller,buyer,escrowsを取得
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        // const escrows = this.players.filter(player => ![sellerId, buyerId].includes(player.id));
        const escrows = this.players;

        // sellerは商品である過去の履歴を渡す
        seller.sendGoods(buyer);

        // buyerはエスクローに結果を報告する
        const result = buyer.reportResult(seller, escrows);

        // 取引を定義する
        const transaction = {t: this.t, sellerId, buyerId, result};

        // Recorderに真の結果と報告された結果を記録
        for (const player of this.players) this.recordResult(player.system, transaction);

        // console.debug('this.recorderMap:', this.recorderMap);

        // Presenterで描画する
        await this.presenter.render(this, transaction);

        // 待機する
        await sleep(interval);
      }
    }
  }

  getTrueResult(): Result {
    return Result.SUCCESS;
  }

  buildRecorderMap(players: IContractPlayer[]): RecorderMap {
    return players.reduce((pre, player) => pre.set(player, new SuccessRateRecorder()), new Map() as RecorderMap);
  }

  buildRecorderQueueMap(players: IContractPlayer[]): RecorderQueueMap {
    return players.reduce((pre, player) => pre.set(
      player, new Queue<RecorderParams>(2 * this.n * (this.n - 1))
    ), new Map() as RecorderQueueMap);
  }

  recordResult(system: ICommerceSystem, transaction: Transaction): void {
    const player = this.players.find(p => p.system.id === system.id)!;
    const params = this.recorderQueueMap.get(player)!.put({system, transaction});
    if (params) super.recordResult(params.system, params.transaction);
  }

  getRecorderKey(system: ICommerceSystem): IContractPlayer {
    return this.players.find(player => player.system.id === system.id)!;
  }

}