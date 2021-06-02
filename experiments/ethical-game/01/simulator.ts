import { BaseEthicalGameSimulator } from '@social-contract/instruments/simulators';
import { PlayerId } from '@social-contract/libs/core';
import { DESCRIPTION, LABEL } from './meta';

export class Simulator extends BaseEthicalGameSimulator {
  label = LABEL;
  description = DESCRIPTION;

  get playersInfo(): Record<PlayerId, string> {
    return this.players.reduce((record, player) => ({
      ...record,
      [player.id]: player.type
    }), {});
  }
}