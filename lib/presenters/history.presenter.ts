import { ISimulator } from "@social-contract/core/simulator";
import { ICommerceSystem, Result, Transaction } from "@social-contract/core/system";
import { b4, range } from "@social-contract/utils/helpers";
import { IPresenter } from "./presenter.interface";

const AsciiTable = require('ascii-table');

export interface HistoryData {
  timeRange: number[];
  historyMap: { [key: string]: string[] };
};

export interface HistoryPresenterOptions {
  maxSize: number,
  padding: number,
}

export class HistoryPresenter implements IPresenter {
  async render(simulator: ISimulator<any>, transaction: Transaction): Promise<void> {

  }

  buildHistoryString(...args: [any, any, any]): string {
    const data = this.buildHistoryData(...args);
    return this.formatHistoryData(data);
  }

  buildHistoryData(
    systemMap: {[key: string]: ICommerceSystem}, 
    t: number, 
    options: HistoryPresenterOptions = {maxSize: 24, padding: -4}
  ) : HistoryData {
    const timeRange = range(
      Math.max(t + options.padding - options.maxSize + 1, 1), 
      Math.max(t + options.padding, options.maxSize)
    );
    const data: HistoryData = { timeRange, historyMap: {} };


    for (const [key, system] of Object.entries(systemMap)) {
      data.historyMap[key] = timeRange
        .map(j => system.store.getTransaction(j))
        .map(transaction => transaction ? transaction.result === Result.SUCCESS ? 'S' : 'F' : ' ');
    }

    return data;
  }

  formatHistoryData(data: HistoryData): string {
    const table = new AsciiTable();
    table.setHeading(`Player \\ Time`, ...data.timeRange.map(i => b4(`${i}`)));
    for (const [key, transactions] of Object.entries(data.historyMap)) {
      const results = transactions;
      table.addRow(`${key}`, ...results.map(i => b4(`${i}`)));
    }
    return table.toString();
  }
}