import { Queue } from '@social-contract/core/helpers';
import { ISimulator } from '@social-contract/core/simulator';
import { ICommerceSystem, Result } from '@social-contract/core/system';
import { MessageType, IEthicalGamePlayer } from './player.interface';

export interface IEthicalGameSimulator extends ISimulator<MessageType> {
  players: IEthicalGamePlayer[];
  system: ICommerceSystem;

  reportedResults: Queue<Result>;
  trueResults: Queue<Result>;
}