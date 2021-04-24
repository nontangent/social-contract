import { Transaction } from '@social-contract/core/system';
import { IEthicalGameSimulator } from './simulator.interface';

export interface IEthicalPresenter {
  render(simulator: IEthicalGameSimulator, transaction: Transaction): void;
}
