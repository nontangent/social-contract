import { PlayerId } from "@social-contract/libs/core";

export interface ISimulation {
  id: string;
  initialState: string;
  description: string;
  playersInfo: Record<PlayerId, string>;
}

export interface ISystemResult {
  t: number;
  simulationId?: string;
  ownerId: string;
  reported: number | null;
  true: number | null;
}