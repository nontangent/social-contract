import { Message } from '@social-contract/core/actor';
import { IPlayer } from '@social-contract/core/player';
import { ICommerceSystem } from '@social-contract/core/system';

export enum MessageType {
  GOODS = 'GOODS',
  RESULT = 'RESULT',
}

export type ContractMessage<K> = Message<MessageType, K>;

export interface IContractPlayer extends IPlayer<MessageType> {
  system: ICommerceSystem;

  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): void; 
}