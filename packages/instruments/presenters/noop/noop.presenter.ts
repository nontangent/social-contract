import { IPresenter } from "@social-contract/instruments/presenters";

export class NoopPresenter implements IPresenter {
  async render() { }
}