import { Result, Transaction } from '@social-contract/core/system';
import { PlayerId } from '@social-contract/core/player';
import { sum, zeroPad2 as z2, zeroPad3 as z3, zeroPad7 as z7 } from '@social-contract/core/helpers';
import { IEthicalGameSimulator } from './simulator.interface';
import { IEthicalPresenter } from './presenter.interface';

import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/ethical-game/presenter');

export class Presenter implements IEthicalPresenter {
  render(simulator: IEthicalGameSimulator, transaction: Transaction) {
    const balances = simulator.system.getBalances(simulator.t);
    const trueSuccessRate = this.calcTrueSuccessRate(simulator);
    const reportedSuccessRate = this.calcReportedSuccessRate(simulator);
    const data: DisplayData = {
      ...transaction,
      players: simulator.players.map((player) => ({
        id: player.id,
        type: player.type,
        balance: balances[player.id]
      })),
    };

    console.clear();
    logger.info(
      `SuccessRate(True, Reported) => ` + 
      `(${z3(Math.round(trueSuccessRate * 100))}% / ${z3(Math.round(reportedSuccessRate * 100))}%)`
    );
    logger.info(`${z7(data.t)} (seller, buyer) = (${z2(data.sellerId)}, ${z2(data.buyerId)}) ${data.result}`);
    for (const player of data.players) {
      logger.info(`Player${z2(player.id)} (${player.type}) | ${player.balance}`);
    }
  }

  findPlayer(simulator: IEthicalGameSimulator, playerId: PlayerId) {
    return simulator.players.find(player => player.id === playerId);
  }

  calcTrueSuccessRate(simulator: IEthicalGameSimulator): number {
    const results = simulator.trueResults.readAll();
    return this.calcSuccessRate(results);
  }

  calcReportedSuccessRate(simulator: IEthicalGameSimulator): number {
    const results = simulator.reportedResults.readAll();
    return this.calcSuccessRate(results);
  }

  private calcSuccessRate(results: Result[]): number {
    return sum(results.map(r => r === Result.SUCCESS ? 1 : 0)) / results.length;
  }
}

export interface DisplayData {
  t: number;
  sellerId: PlayerId;
  buyerId: PlayerId;
  result: Result;
  players: Array<{
    id: PlayerId;
    type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
    balance: number;
  }>;
}