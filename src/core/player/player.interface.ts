import { Actor, ActorId, Message as _Message } from '../actor';
import { Transaction, History, ICommerceSystem } from '../system';

export type SellerStrategy = 1 | 2;
export type BuyerStrategy = 1 | 2 | 3 | 4;
export type PlayerStrategy = [SellerStrategy, BuyerStrategy];

export type PlayerId = ActorId;

export enum MessageType { GOODS, RESULT }
export type Message<K> = _Message<MessageType, K>;

export type Reports = Record<PlayerId, History>;

export interface IPlayer<T> extends Actor<T> {
  t: number;
  id: PlayerId,

  sendGoods(buyer: IPlayer<T>): any;
  receiveGoods(data: any, senderId: PlayerId): any;
}

export interface SystemOwner {
  system: ICommerceSystem;
}