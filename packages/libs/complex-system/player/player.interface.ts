import { Message } from '@social-contract/libs/core/actor';
import { IPlayer } from '@social-contract/libs/core/player';
import { IReputationSystem, Result } from '@social-contract/libs/core/system';

export enum MessageType {
  GOODS = 'GOODS',
  RESULT = 'RESULT',
}

export type ContractMessage<K> = Message<MessageType, K>;

export interface IContractPlayer extends IPlayer<MessageType> {
  system: IReputationSystem;

  reportResult(seller: IContractPlayer, escrows: IContractPlayer[]): Result; 
  commitRecord(): void;
}