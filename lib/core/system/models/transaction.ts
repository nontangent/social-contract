import { PlayerId } from "@social-contract/core/player";
import { Result } from "./result";

export interface Transaction {
  t: number;
  sellerId: PlayerId;
  buyerId: PlayerId;
  reporterId?: PlayerId;
  result: Result;
}