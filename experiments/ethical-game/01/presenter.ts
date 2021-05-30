import { ICommerceSystem, Transaction } from '@social-contract/libs/core';
import { IEthicalGameSimulator } from '@social-contract/instruments/simulators';
import { IPresenter, SystemPresenter, HistoryPresenter, TransactionPresenter } from '@social-contract/instruments/presenters';

import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/ethical-game/presenter');

export class EthicalGamePresenter implements IPresenter {
  systemPresenter = new SystemPresenter();
  transactionPresenter = new TransactionPresenter();
  historyPresenter = new HistoryPresenter();
  // successRatePresenter = new SuccessRatePresenter();

  async render(simulator: IEthicalGameSimulator, transaction: Transaction): Promise<void> {
    const { t, n, system, recorderMap } = simulator;
    const systemMap = new Map().set('system', system);
    const transactionStr = this.transactionPresenter.buildStr(transaction);

    const historyTable = this.historyPresenter.buildHistoryString(systemMap, t, {maxSize: 16, padding: 2});
    const balanceTable = this.systemPresenter.buildSystemString(systemMap, recorderMap, t, n);
    // const successRateTable = this.successRatePresenter.buildSuccessRateString(recorderMap);

    console.clear();
    logger.info(transactionStr);
    logger.info(historyTable);
    logger.info(balanceTable);
    // logger.info(successRateTable);
  }

}
