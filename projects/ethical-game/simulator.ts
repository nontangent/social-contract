import { ICommerceSystem, Result, Transaction } from '@social-contract/core/system';
import { sleep } from '@social-contract/utils/helpers';
import { SuccessRateRecorder } from '@social-contract/core/recorder';
import { IPresenter } from '@social-contract/presenters';
import { BaseSimulator } from '@social-contract/core/simulator';

import { IEthicalGamePlayer } from './player.interface';
import { IEthicalGameSimulator } from './simulator.interface';

export class Simulator extends BaseSimulator<IEthicalGamePlayer> implements IEthicalGameSimulator {
  recorderMap = {system: new SuccessRateRecorder()};

  constructor(
    public players: IEthicalGamePlayer[],
    public system: ICommerceSystem,
    public presenter: IPresenter,
  ) {
    super();
  }

  async run(maxT: number = 10, interval: number = 10): Promise<void> {
    const combinations = this.generateCombinations();

    while (this.t < maxT * combinations.length) {
      for (const [sellerId, buyerId] of combinations) {
        this.t += 1;
        
        // sellerとbuyerを取得して商取引ゲームを行う
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        const transaction = this.deal(seller, buyer);

        this.recordResult(this.system, transaction);

        // 表示
        await this.presenter.render(this, transaction);

        // 
        await sleep(interval);
      }
    }
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

}
