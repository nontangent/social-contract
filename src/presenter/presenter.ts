import { IPlayer } from '../player';
import { ISimulator } from "../simulator";
import { IPresenter } from './presenter.interface';

const AsciiTable = require('ascii-table');

export class Presenter implements IPresenter {

  render(simulator: ISimulator<any>) {
    const table = this.buildTable(simulator);
    console.clear();
    console.log(table.toString());
  }

  buildTable(simulator: ISimulator<any>) {
    const table = new AsciiTable();
    table.setHeading(...this.buildHeading(simulator));
    for (const player of simulator.players) {
      table.addRow(...this.buildRow(player, simulator.n));
    }
    return table
  }

  buildHeading(simulator: ISimulator<any>) {
    return [`${simulator.t}`, ...[...Array(simulator.n)].map((_, i) => `${i}`)]
  }

  buildRow(player: IPlayer<any>, n: number) {
    const balances = player.getBalances();
    return [`${player.id}`, ...[...Array(n)].map((_, i) => i)]
  }
}
