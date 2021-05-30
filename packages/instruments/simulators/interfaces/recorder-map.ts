import { IPlayer as _IPlayer } from '@social-contract/libs/core/player';
import { SuccessRateRecorder } from '@social-contract/instruments/recorders';

export type MapKey<IPlayer extends _IPlayer<any>> = IPlayer | string;
export type RecorderMap<IPlayer extends _IPlayer<any>> = Map<MapKey<IPlayer>, SuccessRateRecorder>;
