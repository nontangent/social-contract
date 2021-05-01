import { History, InitialState, Transaction } from './models';
import { State } from './state';

export interface IStore<S extends State = State> {
  state: S;

  getHistory(): History;

  setTransaction(transaction: Transaction): void;
  getTransaction(t: number): Transaction | null;

  setInitialState(initialState: InitialState): void;
  getInitialState(): InitialState | null;
  
}