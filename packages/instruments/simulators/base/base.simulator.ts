import { permutation } from '@social-contract/libs/utils/helpers';
import { PlayerId } from '@social-contract/libs/core/player';
import { IReputationSystem, Result, Transaction } from '@social-contract/libs/core/system';
import { SuccessRateRecorder } from '@social-contract/instruments/recorders';
import { ISimulator } from '@social-contract/instruments/simulators';
import { ISimulatorLogger } from '@social-contract/instruments/loggers';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseSimulator<IPlayer extends {id: PlayerId}> implements ISimulator<IPlayer> {
  id: string = uuidv4();  
  t = 0;

  constructor(protected logger: ISimulatorLogger<ISimulator<IPlayer>>) { }

  get n() {
    return this.players.length;
  }

  getPlayer(playerId: PlayerId): IPlayer {
    return this.players.find(p => p.id === playerId)!;
  }

  recordResult(system: IReputationSystem, transaction: Transaction): void {
    // 商取引ゲームが行われた場合(バランスに変化があった場合)、真の結果と報告された結果を記録する
    const balances = system.getScores(transaction.t);
    const key = this.getRecorderKey(system);
    const recorder = this.recorderMap.get(key)!;
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

  abstract label: string;
  abstract description: string;
  abstract playersInfo: Record<PlayerId, string>;
  abstract players: IPlayer[];
  abstract recorderMap: Map<IPlayer | string, SuccessRateRecorder>;
  
  abstract run(): Promise<void>;
  
  abstract getTrueResult(seller: IPlayer, buyer: IPlayer): Result;
  abstract getRecorderKey(system: IReputationSystem): IPlayer | string;

  abstract render(simulator: BaseSimulator<IPlayer>, transaction: Transaction): Promise<void>;
  abstract log(): Promise<void>;
}