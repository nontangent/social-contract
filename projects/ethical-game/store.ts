import { clone } from '@social-contract/utils/helpers';
import { History, InitialState, State, Transaction, IStore } from "@social-contract/core/system";

export class Store<T extends State> implements IStore<T> {
  state: T = { history: {} } as T;

  getHistory(): History {
    return this.state.history;
  }

  setTransaction(transaction: Transaction): void {
    if (this.state.history?.[transaction.t]) throw new Error('Transaction already exists.');
    this.state.history[transaction.t] = clone(transaction);
  }

  getTransaction(t: number): Transaction | null {
    const transaction = this.state.history?.[t];
    return transaction ? clone(transaction) : null;
  }

  setInitialState(initialState: InitialState): void {
    if (this.state.initialState) throw new Error('Initial State already exists');
    this.state.initialState = clone(initialState);
  }

  getInitialState(): InitialState | null {
    return this.state.initialState ? clone(this.state.initialState) : null;
  }
}

