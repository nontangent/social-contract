import { ISimulator } from "@social-contract/core/simulator";
import { Transaction } from "@social-contract/core/system";

export interface IPresenter {
  render(simulator: ISimulator<any>, transaction: Transaction): Promise<void>;
}