import { BaseContractSimulator } from '@social-contract/instruments/simulators';
import { PlayerId, Result } from '@social-contract/libs/core';
import { DESCRIPTION, LABEL } from './meta'
import { BasePlayer } from './players';

export class Simulator extends BaseContractSimulator<BasePlayer> {
  label = LABEL;
  description = DESCRIPTION;

  get playersInfo(): Record<PlayerId, string> {
    return this.players.reduce((info, player) => ({...info, [player.id]: player.type}), {});
  }
  
  getTrueResult(seller: BasePlayer, buyer: BasePlayer) {
    return [1].includes(seller.strategy[0]) && [1, 2].includes(buyer.strategy[1]) ? Result.SUCCESS : Result.FAILED;
  }
}