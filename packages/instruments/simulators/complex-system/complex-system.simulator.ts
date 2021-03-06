import { IReputationSystem, Transaction } from '@social-contract/libs/core/system';
import { IContractPlayer } from '@social-contract/libs/complex-system/player';
import { Queue, sleep } from '@social-contract/libs/utils/helpers';
import { BaseSimulator } from '@social-contract/instruments/simulators/base';
import { IPresenter } from '@social-contract/instruments/presenters';
import { SuccessRateRecorder } from '@social-contract/instruments/recorders';
import { IContractSimulator, RecorderMap } from '@social-contract/instruments/simulators';
import { ComplexSystemLogger } from '@social-contract/instruments/loggers';
import { PlayerId } from '@social-contract/libs/core';

export type RecorderParams = {system: IReputationSystem, transaction: Transaction};
export type RecorderQueueMap = Map<IContractPlayer | string, Queue<RecorderParams>>;

export abstract class BaseContractSimulator<IPlayer extends IContractPlayer> extends BaseSimulator<IPlayer> implements IContractSimulator {
  recorderMap: RecorderMap<IPlayer>;
  private recorderQueueMap;

  constructor(
    public players: IPlayer[] = [],
    public presenter: IPresenter,
    public logger = new ComplexSystemLogger(),
  ) {
    super(logger);
    this.recorderMap = this.buildRecorderMap(players, this.generateCombinations().length);
    this.recorderQueueMap = this.buildRecorderQueueMap(players);
    const addressBook = this.players.reduce((book, p) => book.set(p.id, p), new Map<PlayerId, IPlayer>());
    players.forEach(player => player.addressBook = addressBook);
  }

  async run(maxT: number = 10, interval: number = 0) {
    // sellerとbuyerの一周の順番を決める(n * (n-1))。
    const combinations = this.generateCombinations();

    while (this.t < combinations.length * maxT) {
      for (const [sellerId, buyerId] of combinations) {
        // 時刻を進める
        this.t += 1;
        for (const player of this.players) player.t = this.t;

        // seller,buyer,escrowsを取得
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        const escrows = this.players;

        // sellerは商品である過去の履歴を渡す
        seller.sendGoods(buyer);

        // buyerはエスクローに結果を報告する
        const result = buyer.reportResult(seller, escrows);

        // 各プレイヤーは報告からその時刻の結果を決定する
        for (const player of this.players) player.commitRecord();

        // 取引を定義する
        const transaction = {t: this.t, sellerId, buyerId, result};

        // Recorderに真の結果と報告された結果を記録する
        for (const player of this.players) this.recordResult(player.system, transaction);

        // Presenterで描画する
        await this.render(this, transaction);

        // 待機する
        await sleep(interval);
      }
    }

    // シミュレーションの結果を保存する
    await this.log();
  }

  async render(simulator: BaseSimulator<IPlayer>, transaction: Transaction): Promise<void> {
    await this.presenter.render(simulator, transaction);
  }

  buildRecorderMap(players: IPlayer[], maxSize: number): RecorderMap<IPlayer> {
    return players.reduce((pre, player) => pre.set(player, new SuccessRateRecorder(maxSize)), new Map() as RecorderMap<IPlayer>);
  }

  buildRecorderQueueMap(players: IPlayer[]): RecorderQueueMap {
    return players.reduce((pre, player) => pre.set(player, new Queue<RecorderParams>(1)), new Map() as RecorderQueueMap);
  }

  recordResult(system: IReputationSystem, transaction: Transaction): void {
    const player = this.players.find(p => p.system.id === system.id)!;
    const params = this.recorderQueueMap.get(player)!.put({system, transaction});
    if (params) super.recordResult(params.system, params.transaction);
  }

  getRecorderKey(system: IReputationSystem): IPlayer {
    return this.players.find(player => player.system.id === system.id)!;
  }

  async log(): Promise<void> {
    await this.logger.setup();
    await this.logger.log(this);
    await this.logger.close();
  }
}