export type ActorId = number;

export interface Message<T, K> {
  senderId?: ActorId,
  receiverId?: ActorId,
  type: T;
  data: K;
}

export interface IActor<MessageType> {
  id: ActorId;
  addressBook: Map<ActorId, IActor<MessageType>>;
  messageHandlers: Map<MessageType, Function>;

  sendMessage<K>(receiver: IActor<MessageType>, message: Message<MessageType, K>): any;
  receiveMessage<K>(message: Message<MessageType, K>): any;
}
