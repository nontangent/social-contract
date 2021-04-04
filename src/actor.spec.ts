import { Action, Actor, Message } from './actor';

enum MessageType {
  TEST = 'TEST',
}

describe('actor.tsのテスト', () => {

  it('Actor Class のデコレーターテスト', () => {
    class TestActor extends Actor<MessageType> {
      @Action(MessageType.TEST)
      receiveRecords(data: number) {
        return data;
      }
    }

    const sender = new TestActor(0);
    const receiver = new TestActor(1);
    const message: Message<MessageType, number> = {
      type: MessageType.TEST,
      data: 0
    }
    const res = sender.sendMessage(receiver, message);
    expect(res).toBe(0);
  });

});