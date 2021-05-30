import { Transaction } from "@social-contract/libs/core/system";
import { ISimulator } from "@social-contract/instruments/simulators";

export interface IPresenter {
  render(simulator: ISimulator<any>, transaction: Transaction): Promise<void>;
}