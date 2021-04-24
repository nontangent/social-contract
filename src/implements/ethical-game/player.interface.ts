import { IPlayer, PlayerStrategy } from "@social-contract/core/player";

export enum MessageType { SEND_GOODS };
export type EthicalGamePlayerType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export interface IEthicalGamePlayer extends IPlayer<MessageType> {
  type: EthicalGamePlayerType;
  strategy: PlayerStrategy;
}