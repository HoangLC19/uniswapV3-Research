import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";

export enum TransactionState {
  Failed = "Failed",
  New = "New",
  Rejected = "Rejected",
  Sending = "Sending",
  Sent = "Sent",
}

export const sendTransactionViaWallet = async (
  wallet: Wallet,
  transaction: any
) => {
  if (transaction.value) {
    transaction.value = BigNumber.from(transaction.value);
  }
  const txRes = await wallet.sendTransaction(transaction);

  let receipt = null;
  const provider = ethers.provider;
  if (!provider) {
    return TransactionState.Failed;
  }

  
  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash);

      if (receipt === null) {
        continue;
      }
    } catch (e) {
      return TransactionState.Failed;
    }
  }

  if (receipt.status === 0) {
    return TransactionState.Failed;
  }

  return TransactionState.Sent;
};
