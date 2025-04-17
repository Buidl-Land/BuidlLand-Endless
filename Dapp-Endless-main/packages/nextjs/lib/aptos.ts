import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const config = new AptosConfig({
  network: Network.DEVNET,
  fullnode: 'https://fullnode.devnet.aptoslabs.com',
  faucet: 'https://faucet.devnet.aptoslabs.com'
});
