import { Actor, ActorId } from '../actor';
import { History, IReputationSystem } from '../system';

export type SellerStrategy = 1 | 2;
export type BuyerStrategy = 1 | 2 | 3 | 4;
export type PlayerStrategy = [SellerStrategy, BuyerStrategy];

export type PlayerId = ActorId;

export type Reports = Record<PlayerId, History>;

export interface IPlayer<T> extends Actor<T> {
  t: number;
  id: PlayerId;
  name: string;
  type?: string;

  sendGoods(buyer: IPlayer<T>): any;
  receiveGoods(data: any, senderId: PlayerId): any;
}

export interface SystemOwner {
  system: IReputationSystem;
}