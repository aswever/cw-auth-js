import {
  ExecuteResult,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice, OfflineSigner } from "@cosmjs/launchpad";
import { ExecuteOptions } from ".";
import { AuthConfig } from "./types";

export class AuthAccount<C extends AuthConfig> {
  constructor(
    protected client: SigningCosmWasmClient,
    protected address: string,
    protected config: C
  ) {}

  static async fromSigner<A extends AuthAccount<C>, C extends AuthConfig, R>(
    constructor: new (
      client: SigningCosmWasmClient,
      address: string,
      config: C,
      ...rest: R[]
    ) => A,
    signer: OfflineSigner,
    config: C,
    ...rest: R[]
  ): Promise<A> {
    const client = await SigningCosmWasmClient.connectWithSigner(
      config.rpcEndpoint,
      signer,
      {
        gasPrice: GasPrice.fromString(`${config.gasPrice}${config.coinDenom}`),
      }
    );

    const [{ address }] = await signer.getAccounts();

    return new constructor(client, address, config, ...rest);
  }

  async execute(
    message: Record<string, unknown>,
    { funds, memo }: ExecuteOptions = {}
  ): Promise<ExecuteResult> {
    return this.client.execute(
      this.address,
      this.config.contractAddress,
      message,
      "auto",
      memo,
      funds
    );
  }
}
