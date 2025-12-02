import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, signTransaction, getAddress } from '@stellar/freighter-api';

const { Contract, TransactionBuilder, Networks, rpc } = StellarSdk;

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID as string;
const RPC_URL = import.meta.env.VITE_RPC_URL as string;

export const server = new rpc.Server(RPC_URL);

export async function invoke({ method, args = [], signAndSend = false }: { method: string, args?: any[], signAndSend?: boolean }) {
  const connectedResponse = await isConnected();
  if (!connectedResponse.isConnected) {
    throw new Error("Freighter not connected");
  }

  const addressResponse = await getAddress();
  const publicKey = addressResponse.address;
  const sourceAccount = await server.getAccount(publicKey);

  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  if (signAndSend) {
    const signResponse = await signTransaction(tx.toXDR(), {
      networkPassphrase: Networks.TESTNET,
    });

    const signedTx = TransactionBuilder.fromXDR(signResponse.signedTxXdr, Networks.TESTNET);
    const response = await server.sendTransaction(signedTx);

    // Wait for confirmation
    if (response.status === 'PENDING') {
      let getResponse = await server.getTransaction(response.hash);
      while (getResponse.status === 'NOT_FOUND') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        getResponse = await server.getTransaction(response.hash);
      }
      return getResponse;
    }
    return response;
  }

  return server.simulateTransaction(tx);
}
