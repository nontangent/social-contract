import { InitialState, PlayerId } from "@social-contract/libs/core";

export interface ISimulation {
  id: string;
  label: string;
  initialState: InitialState;
  description: string;
  playersInfo: Record<PlayerId, string>;
  results?:  ISystemResult[];
}

export interface ISystemResult {
  t: number;
  simulationId?: string;
  ownerId: string;
  reported: number | null;
  true: number | null;
}