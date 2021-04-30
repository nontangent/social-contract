import { ISimulator } from '../simulator';
import { Transaction } from '../system';

export interface IPresenter {
  render(simulator: ISimulator<any>, transaction: Transaction): Promise<void>;
}