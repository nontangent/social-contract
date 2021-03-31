export enum CommerceResult {
  SUCCESS,
  FAILED,
}

export type PlayerId = number;

export interface CommerceRecord {
  t: number;
  sellerId: PlayerId;
  buyerId: PlayerId;
  reporterId?: PlayerId;
  result: CommerceResult;
}

export type History = Record<number, CommerceRecord>;

export type SellerStrategy = 1 | 2;
export type BuyerStrategy = 1 | 2 | 3 | 4;
export type PlayerStrategy = [SellerStrategy, BuyerStrategy];