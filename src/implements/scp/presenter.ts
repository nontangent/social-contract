import { IPresenter } from "@social-contract/core/presenter";
import { IContractPlayer } from "./player.interface";
import { IContractSimulator } from "./simulator.interface";

import { getLogger } from 'log4js';
const logger = getLogger('@social-contract/implements/scp/presenter');

const AsciiTable = require('ascii-table');

export class Presenter implements IPresenter {

  render(simulator: IContractSimulator) {
    const table = this.buildTable(simulator);
    console.clear();
    console.log(table.toString());
  }

  buildTable(simulator: IContractSimulator) {
    const table = new AsciiTable();
    table.setHeading(...this.buildHeading(simulator));
    for (const player of simulator.players) {
      table.addRow(...this.buildRow(player as IContractPlayer, simulator.n, simulator.t));
    }
    return table
  }

  buildHeading(simulator: IContractSimulator) {
    return [`${simulator.t}`, ...[...Array(simulator.n)].map((_, i) => `${i}`)];
  }

  buildRow(player: IContractPlayer, n: number, t: number) {
    logger.debug(player.system.history);
    
    const balances = player.system.getBalances(t);
    logger.debug('Flag 6');
    const arr = [...Array(n)].map((_, i) => balances[i]);
    return [`${player.id}`, ...arr];
  }
}

export class NoopPresenter implements IPresenter {
  render() { }
}