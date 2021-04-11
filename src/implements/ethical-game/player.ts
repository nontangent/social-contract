import { Action, Actor } from '@social-contract/core/actor';
import { IPlayer as _IPlayer, PlayerId, PlayerStrategy } from '@social-contract/core/player';
import { ICommerceSystem, Result } from '@social-contract/core/system';

export enum MessageType { SEND_GOODS };
export type IPlayer = _IPlayer<MessageType>;

export class Player extends Actor<MessageType> implements IPlayer {
  t = 0;

  constructor (
    public id: PlayerId,
    public strategy: PlayerStrategy
  ) {
    super(id);
  }

  @Action(MessageType.SEND_GOODS)
  receiveGoods(goods: boolean): Result {
    switch(this.strategy[1]) {
      case 1: return goods ? Result.FAILED : Result.SUCCESS;
      case 2: return goods ? Result.FAILED : Result.SUCCESS;
      case 3: return goods ? Result.FAILED : Result.SUCCESS;
      case 4: return goods ? Result.FAILED : Result.SUCCESS;
    }
  }

  sendGoods(receiver: IPlayer): any {
    switch(this.strategy[0]) {
      case 1: return this.sendMessage(receiver, {type: MessageType.SEND_GOODS, data: true});
      case 2: return this.sendMessage(receiver, {type: MessageType.SEND_GOODS, data: false});
    }
  }

}
