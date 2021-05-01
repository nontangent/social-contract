import { History, InitialState } from './models';

export interface State {
  initialState?: InitialState;
  history: History;
}