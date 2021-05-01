import { IPresenter } from "./presenter.interface";

export class NoopPresenter implements IPresenter {
  async render() { }
}