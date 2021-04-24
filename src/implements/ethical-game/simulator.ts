import { Balances, ICommerceSystem, Result, Transaction } from '@social-contract/core/system';
import { permutation, Queue } from '@social-contract/core/helpers';
import { PlayerId } from '@social-contract/core/player';
import { IEthicalGamePlayer } from './player.interface';
import { IEthicalGameSimulator } from './simulator.interface';
import { IEthicalPresenter } from './presenter.interface';

export class Simulator implements IEthicalGameSimulator {
  t = 0;

  constructor(
    public players: IEthicalGamePlayer[],
    public system: ICommerceSystem,
    public presenter: IEthicalPresenter,
  ) { }

  reportedResults = new Queue<Result>(100);
  trueResults = new Queue<Result>(100);

  run(maxT: number = 10) {
    const combinations = this.generateCombinations();

    while (this.t < maxT * combinations.length) {
      for (const [sellerId, buyerId] of combinations) {
        this.t += 1;
        
        // sellerとbuyerを取得して商取引ゲームを行う
        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        const transaction = this.deal(seller, buyer);

        // 商取引ゲームが行われた場合(バランスに変化があった場合)、真の結果と報告された結果を記録する
        const balances = this.system.getBalances(this.t);
        if (!this.isSameWithPreBalances(balances)) {
          this.reportedResults.put(transaction.result);
          const trueResult = this.getTrueResult(seller, buyer);
          this.trueResults.put(trueResult);
        }

        // 表示
        this.presenter.render(this, transaction);
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

  getPlayer(playerId: PlayerId): IEthicalGamePlayer {
    return this.players.find(p => p.id === playerId)!
  }

  // playersから商取引ゲームの順番を決める。
  private generateCombinations(): [number, number][] {
    const playerIds = this.players.map(p => p.id);
    return permutation<number>(playerIds, 2) as [number, number][];
  }

  get n() {
    return this.players.length;
  }

  private preBalances?: Balances;

  isSameWithPreBalances(balances: Balances): boolean {
    const res = JSON.stringify(this.preBalances) === JSON.stringify(balances);
    this.preBalances = balances;
    return res;
  }

  getTrueResult(seller: IEthicalGamePlayer, buyer: IEthicalGamePlayer): Result {
    if([1].includes(seller.strategy[0]) && [1, 2].includes(buyer.strategy[1])) {
      return Result.SUCCESS
    } else {
      return Result.FAILED;
    }
  }

}
