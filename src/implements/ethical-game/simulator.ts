import { ISimulator } from '@social-contract/core/simulator';
import { ICommerceSystem, Result } from '@social-contract/core/system';
import { permutation } from '@social-contract/core/helpers';
import { getLogger } from '@social-contract/core/logging';
import { PlayerId } from '@social-contract/core/player';
import { IPlayer, MessageType } from './player';

const logger = getLogger('@social-contract/experiments/01');

export class Simulator implements ISimulator<MessageType> {
  t = 0;

  constructor(
    public players: IPlayer[],
    public system: ICommerceSystem,
  ) { }

  run(maxT: number = 10) {
    const combinations = this.generateCombinations();

    logger.debug('combinations:', combinations);

    while (this.t < maxT * combinations.length) {
      for (const [sellerId, buyerId] of combinations) {
        this.t += 1;
        

        const seller = this.getPlayer(sellerId);
        const buyer = this.getPlayer(buyerId);
        const result = this.deal(seller, buyer);

        const sellerB = this.system.getBalance(sellerId, this.t);
        const buyerB = this.system.getBalance(buyerId, this.t);
        logger.info(`t: ${this.t}, seller: ${sellerId}(${sellerB}), buyer: ${buyerId}(${buyerB}), result: ${result}`);

        const balances = this.system.getBalances(this.t);
        logger.info(`balances(${this.t})`, balances);
        logger.debug('===================================')
        // if (this.t === 13) process.exit(); 
      }
    }
  }

  deal(seller: IPlayer, buyer: IPlayer): Result {
    // 商取引ゲームの結果を取得
    const result = seller.sendGoods(buyer);

    // 商取引システムに結果を記録
    this.system.setTransaction({t: this.t, sellerId: seller.id, buyerId: buyer.id, result});

    return result;
  }

  getPlayer(playerId: PlayerId): IPlayer {
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

}