import { Actor, ActorId, Message as _Message } from '../actor';
import { Transaction, History } from '../system';

export type SellerStrategy = 1 | 2;
export type BuyerStrategy = 1 | 2 | 3 | 4;
export type PlayerStrategy = [SellerStrategy, BuyerStrategy];

export type PlayerId = ActorId;

export enum MessageType {
  GOODS = 'GOODS',
  RESULT = 'RESULT',
}

export type Message<K> = _Message<MessageType, K>;
export type Reports = Record<PlayerId, History>;

export interface IPlayer<T> extends Actor<T> {
  t: number;
  id: PlayerId,

  sendGoods(buyer: IPlayer<T>): Message<Transaction[]>;
  reportResult(seller: IPlayer<T>, escrows: IPlayer<T>[]): Message<Transaction>;
  receiveGoods(records: Transaction[], senderId: PlayerId): Record<number, History>;
  receiveResult(record: Transaction, senderId: PlayerId): any;
}