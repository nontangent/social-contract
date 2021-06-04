export interface ISimulatorLogger<ISimulator> {
  close(): Promise<void>;
  setup(): Promise<void>;
  log(simulator: ISimulator): Promise<void>;
}