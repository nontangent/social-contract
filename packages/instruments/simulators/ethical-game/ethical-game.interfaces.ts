import { IReputationSystem } from '@social-contract/libs/core/system';
import { IEthicalGamePlayer } from '@social-contract/libs/ethical-game';
import { ISimulator } from '@social-contract/instruments/simulators';

export interface IEthicalGameSimulator extends ISimulator<IEthicalGamePlayer> {
  players: IEthicalGamePlayer[];
  system: IReputationSystem;
}