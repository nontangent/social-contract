import { BaseContractSimulator } from '@social-contract/instruments/simulators';
import { PlayerId, Result } from '@social-contract/libs/core';
import { DESCRIPTION, LABEL } from './meta';
import { BasePlayer } from './players';

export class Simulator extends BaseContractSimulator<BasePlayer> {
  label = LABEL;
  description = DESCRIPTION;

  get playersInfo(): Record<PlayerId, string> {
    return this.players.reduce((info, player) => ({...info, [player.id]: player.type}), {});
  }

  getTrueResult(seller: BasePlayer, buyer: BasePlayer): Result {
    return seller.type === 'A' && buyer.type === 'A' ? Result.SUCCESS : Result.FAILED;
  }
}
