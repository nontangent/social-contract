import { IPlayer, ICommerceSystem, Transaction } from '@social-contract/libs/core';
import { sleep, z2, z7 } from '@social-contract/libs/utils/helpers';
import { IPresenter, SystemPresenter, HistoryPresenter } from '@social-contract/instruments/presenters';
import { IContractSimulator } from '@social-contract/instruments/simulators';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);

type MapKey = IPlayer<any> | string;
type SystemMap = Map<MapKey, ICommerceSystem>;

export class Presenter implements IPresenter {

  private systemPresenter = new SystemPresenter();
  historyPresenter = new HistoryPresenter();

  async render(simulator: IContractSimulator, transaction: Transaction, sleepTime: number = 0): Promise<void> {
    const { t, n, recorderMap } = simulator; 
    let determinedT = t - 2 * n * (n - 1);
    determinedT = determinedT < 0 ? 0 : determinedT;

    const systems = simulator.players.reduce((c, p) => c.set(p, p.system), new Map() as SystemMap);
    const padding = - n * (n-1) - 2;
    const historyTable = this.historyPresenter.buildHistoryString(systems, t, {maxSize: 16, padding});
    const balancesTable = this.systemPresenter.buildSystemString(systems, recorderMap, determinedT, n);

    console.clear();
    logger.info('==============================================================');
    logger.info(`At the time(${z7(transaction.t)}), seller(${z2(transaction.sellerId)}) and buyer(${z2(transaction.buyerId)}) deal. The result is ${transaction.result}`);
    logger.info(`\n`);
    logger.info(`=== History === `);
    logger.info(historyTable);
    logger.info(`\n`);
    logger.info(`=== Balances and Success Rate (t=${Math.max(t - 2 * n * (n - 1), 0)}) ===`);
    logger.info(balancesTable);
    logger.info('==============================================================');

    await sleep(sleepTime);
  }
}