import { Queue } from '@social-contract/core/helpers';
import { ISimulator } from '@social-contract/core/simulator';
import { ICommerceSystem, Result } from '@social-contract/core/system';
import { IEthicalGamePlayer } from './player.interface';

export interface IEthicalGameSimulator extends ISimulator<IEthicalGamePlayer> {
  players: IEthicalGamePlayer[];
  system: ICommerceSystem;

  reportedResults: Queue<Result>;
  trueResults: Queue<Result>;
}