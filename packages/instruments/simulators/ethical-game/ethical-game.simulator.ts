import { IReputationSystem, Result, Transaction } from '@social-contract/libs/core';
import { IEthicalGamePlayer } from '@social-contract/libs/ethical-game';
import { sleep } from '@social-contract/libs/utils/helpers';
import { IPresenter } from '@social-contract/instruments/presenters';
import { SuccessRateRecorder } from '@social-contract/instruments/recorders';
import { BaseSimulator, IEthicalGameSimulator } from '@social-contract/instruments/simulators';
import { EthicalGameLogger } from '@social-contract/instruments/loggers';

export abstract class BaseEthicalGameSimulator extends BaseSimulator<IEthicalGamePlayer> implements IEthicalGameSimulator {
  recorderMap = new Map().set('system', new SuccessRateRecorder(this.generateCombinations().length));

  constructor(
    public players: IEthicalGamePlayer[],
    public system: IReputationSystem,
    public presenter: IPresenter,
    public logger = new EthicalGameLogger(),
    ) {
    super(logger);
  }

  async run(laps: number = 10, interval: number = 10): Promise<void> {
    const combinations = this.generateCombinations();

    while (this.t < laps * combinations.length) {
      for (const [sellerId, buyerId] of combinations) {
        this.t += 1;
        
        // sellerとbuyerを取得して商取引ゲームを行う
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        const transaction = this.deal(seller, buyer);

        this.recordResult(this.system, transaction);

        // Presenterで描画するs
        await this.render(this, transaction);

        // 待機する
        await sleep(interval);
      }
    }

    // シミュレーションの結果を保存する
    await this.log();
  }

  deal(seller: IEthicalGamePlayer, buyer: IEthicalGamePlayer): Transaction {
    // 商取引ゲームの結果を取得する
    const result: Result = seller.sendGoods(buyer);

    // 商取引ゲームの記録する
    const transaction: Transaction = {t: this.t, sellerId: seller.id, buyerId: buyer.id, result};

    // 商取引システムに商取引ゲームの記録を保存する
    this.system.setTransaction(transaction);

    return transaction;
  }

  getTrueResult(seller: IEthicalGamePlayer, buyer: IEthicalGamePlayer): Result {
    const condition = [1].includes(seller.strategy[0]) && [1, 2].includes(buyer.strategy[1]);
    return condition ? Result.SUCCESS : Result.FAILED;
  }

  getRecorderKey(system: IReputationSystem): IEthicalGamePlayer | string {
    return system.id;
  }

  async render(simulator: BaseEthicalGameSimulator, transaction: Transaction): Promise<void> {
    await this.presenter.render(simulator, transaction);
  }

  async log(): Promise<void> {
    await this.logger.setup();
    await this.logger.log(this);
    await this.logger.close();
  }
}
