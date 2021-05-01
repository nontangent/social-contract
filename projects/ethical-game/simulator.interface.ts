import { ISimulator } from '@social-contract/core/simulator';
import { ICommerceSystem } from '@social-contract/core/system';
import { IEthicalGamePlayer } from './player.interface';

export interface IEthicalGameSimulator extends ISimulator<IEthicalGamePlayer> {
  players: IEthicalGamePlayer[];
  system: ICommerceSystem;
}