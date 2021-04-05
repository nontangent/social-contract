import { IPlayer } from '../player';
import { ISimulator } from '../simulator';

export interface IPresenter {
  render(simulator: ISimulator<any>): void;
  buildTable(simulator: ISimulator<any>): any;
  buildHeading(simulator: ISimulator<any>): any[];
  buildRow(player: IPlayer<any>, n: number): any[];
}