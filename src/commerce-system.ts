import { CommerceRecord, History } from './models';

export class CommerceSystem {
  initialState = {}
  private history: History = {};
  
  get n(): number {
    return 0;
  }

  getReputationScore(playerId: number): number {
    return 0;
  }

  getRecord(t: number): CommerceRecord {
    return this.history[t];
  }

  setRecord(record: CommerceRecord) {
    this.history[record.t] = record;
  }
}