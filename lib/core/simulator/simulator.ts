import { permutation } from '@social-contract/utils/helpers';
import { PlayerId } from '../player';
import { SuccessRateRecorder } from '../recorder';
import { ICommerceSystem, Result, Transaction } from '../system';
import { ISimulator } from './simulator.interface';

export abstract class BaseSimulator<IPlayer extends {id: PlayerId}> implements ISimulator<IPlayer> {
  t = 0;
  get n() { return this.players.length; }
  abstract players: IPlayer[];
  abstract recorderMap: {[key: string]: SuccessRateRecorder};


  abstract run(): Promise<void>;
  abstract getTrueResult(seller: IPlayer, buyer: IPlayer): Result;

  getPlayer(playerId: PlayerId): IPlayer {
    return this.players.find(p => p.id === playerId)!
  }

  recordResult(key: string, system: ICommerceSystem, transaction: Transaction): void {
    // 商取引ゲームが行われた場合(バランスに変化があった場合)、真の結果と報告された結果を記録する
    const balances = system.getBalances(this.t);

    // 
    const recorder = this.recorderMap[key];
    if (!recorder.isSameWithPreBalances(balances)) {
      const seller = this.getPlayer(transaction.sellerId);
      const buyer = this.getPlayer(transaction.buyerId);
      recorder.addReportedResult(transaction.result);
      const trueResult = this.getTrueResult(seller, buyer);
      recorder.addTrueResult(trueResult);
    }
  }

  // playersから商取引ゲームの順番を決める。
  protected generateCombinations(): [number, number][] {
    const playerIds = this.players.map(p => p.id);
    return permutation<number>(playerIds, 2) as [number, number][];
  }

}