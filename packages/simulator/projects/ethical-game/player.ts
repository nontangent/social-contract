import { Action, Actor } from '@social-contract/core/actor';
import { PlayerId, PlayerStrategy } from '@social-contract/core/player';
import { Result } from '@social-contract/core/system';
import { EthicalGamePlayerType, IEthicalGamePlayer, MessageType } from './player.interface';

export class Player extends Actor<MessageType> implements IEthicalGamePlayer {
  t = 0;

  constructor (
    public id: PlayerId, 
    public type: EthicalGamePlayerType,
  ) {
    super(id);
  }

  get name(): string {
    return `Player(${this.id})`;
  }

  sendGoods(receiver: IEthicalGamePlayer): any {
    switch(this.strategy[0]) {
      case 1: return this.sendMessage(receiver, {type: MessageType.SEND_GOODS, data: true});
      case 2: return this.sendMessage(receiver, {type: MessageType.SEND_GOODS, data: false});
    }
  }

  @Action(MessageType.SEND_GOODS)
  receiveGoods(goods: boolean): Result {
    switch(this.strategy[1]) {
      case 1: return goods ? Result.SUCCESS : Result.FAILED;
      case 2: return goods ? Result.SUCCESS : Result.SUCCESS;
      case 3: return goods ? Result.FAILED : Result.SUCCESS;
      case 4: return goods ? Result.FAILED : Result.FAILED;
    }
  }

  get strategy(): PlayerStrategy {
    switch (this.type) {
      case 'A': return [1, 1];
      case 'B': return [1, 2];
      case 'C': return [1, 3];
      case 'D': return [1, 4];
      case 'E': return [2, 1];
      case 'F': return [2, 2];
      case 'G': return [2, 3];
      case 'H': return [2, 4];  
    }
  }
}
