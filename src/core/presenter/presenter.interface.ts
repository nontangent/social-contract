import { ISimulator } from '../simulator';

export interface IPresenter {
  render(simulator: ISimulator<any>): void;
}