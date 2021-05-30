import { ISimulator } from "@social-contract/instruments/simulators";
import { IContractPlayer } from '@social-contract/libs/complex-system/player';

export interface IContractSimulator extends ISimulator<IContractPlayer> { }