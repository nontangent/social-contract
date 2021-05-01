import { Result, Transaction } from '@social-contract/core/system';
import { PlayerId } from '@social-contract/core/player';
import { sum, zeroPad2 as z2, zeroPad3 as z3, zeroPad7 as z7 } from '@social-contract/utils/helpers';
import { IEthicalGameSimulator } from '@social-contract/ethical-game/simulator.interface';
import { SystemPresenter } from '@social-contract/presenters';

import { getLogger } from 'log4js';
import { HistoryPresenter } from '@social-contract/presenters/history.presenter';
import { IPresenter } from '@social-contract/presenters';
const logger = getLogger('@social-contract/implements/ethical-game/presenter');

export class TransactionPresenter {
  buildStr({sellerId, buyerId, result, t}: Transaction): string {
    return `${z7(t)} (seller, buyer) = (${z2(sellerId)}, ${z2(buyerId)}) ${result}`;
  }
}

export class EthicalGamePresenter implements IPresenter {
  systemPresenter = new SystemPresenter();
  transactionPresenter = new TransactionPresenter();
  historyPresenter = new HistoryPresenter();

  async render(simulator: IEthicalGameSimulator, transaction: Transaction): Promise<void> {
    const { t, n } = simulator;
    const systemMap = {['system']: simulator.system}
    const transactionStr = this.transactionPresenter.buildStr(transaction);
    const balancesMap = this.systemPresenter.buildBalancesData(systemMap, t, n);
    const balancesStr = this.systemPresenter.buildBalancesString(balancesMap);

    const historyData = this.historyPresenter.buildHistoryData(systemMap, t, {maxSize: 16, padding: 2});
    const historyTable = this.historyPresenter.buildHistoryString(historyData);

    console.clear();
    logger.info(transactionStr);
    logger.info(balancesStr);
    logger.info(historyTable);
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
}