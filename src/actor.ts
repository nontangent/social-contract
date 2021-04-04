export type ActorId = number;

export interface Message<T, K> {
  senderId?: ActorId,
  receiverId?: ActorId,
  type: T;
  data: K;
}

export class Actor<MessageType> {
  messageHandlers!: Map<MessageType, Function>;

  constructor(public id: ActorId) { }

  sendMessage<K>(receiver: Actor<MessageType>, message: Message<MessageType, K>) {
    return receiver.receiveMessage<K>({
      ...message,
      senderId: this.id,
      receiverId: receiver.id,
    });
  }

  receiveMessage<K>(message: Message<MessageType, K>) {
    for (const [messageType, method] of this.messageHandlers.entries()){
      if (messageType === message.type) 
        return method.apply(this, [message.data, message.senderId, message.receiverId]);
    }
  }
}
 
export function Action<MessageType>(messageType: MessageType) {
  return function (target: Actor<MessageType>, _: any, descriptor: PropertyDescriptor) {
    target.messageHandlers = target?.messageHandlers || new Map();
    target.messageHandlers.set(messageType, descriptor.value);
  }
}