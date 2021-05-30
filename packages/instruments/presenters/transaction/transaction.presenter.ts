import { Transaction } from "@social-contract/libs/core/system";
import { z2, z7 } from '@social-contract/libs/utils/helpers';

export class TransactionPresenter {
  buildStr({sellerId, buyerId, result, t}: Transaction): string {
    return `${z7(t)} (seller, buyer) = (${z2(sellerId)}, ${z2(buyerId)}) ${result}`;
  }
}