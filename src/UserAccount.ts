import { Keplr } from "@keplr-wallet/types";
import { StdSignature } from "@cosmjs/launchpad";
import { UserConfig } from "./types";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AuthAccount } from "./AuthAccount";

export class UserAccount extends AuthAccount<UserConfig> {
  constructor(
    client: SigningCosmWasmClient,
    address: string,
    config: UserConfig,
    private keplr: Keplr
  ) {
    super(client, address, config);
  }

  async signAuthToken(meta: Record<string, unknown>) {
    const token = {
      user: this.address,
      agent: this.config.agentAddress,
      expires: Math.floor(Date.now() / 1000) + 60 * 60,
      meta,
    };

    const {
      signature,
      pub_key: { value: pubkey },
    } = await this.signMessage(JSON.stringify(token));

    return { token, address: this.address, signature, pubkey };
  }

  async signMessage(message: string): Promise<StdSignature> {
    return this.keplr.signArbitrary(this.config.chainId, this.address, message);
  }

  static async create(keplr: Keplr, config: UserConfig): Promise<UserAccount> {
    return super.fromSigner(
      this,
      keplr.getOfflineSigner(config.chainId),
      config,
      keplr
    );
  }
}
