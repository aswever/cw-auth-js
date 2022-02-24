import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Secp256k1HdWallet, serializeSignDoc } from "@cosmjs/launchpad";
import { makeADR36AminoSignDoc, verifyTokenSignature } from "./crypto";
import { AuthAccount } from "./AuthAccount";
import {
  AuthToken,
  AgentConfig,
  ExecuteOptions,
  MessageWithAuthorization,
  SignedToken,
} from "./types";

export class AgentAccount extends AuthAccount<AgentConfig> {
  static async create(
    walletMnemonic: string,
    config: AgentConfig
  ): Promise<AgentAccount> {
    const wallet = await Secp256k1HdWallet.fromMnemonic(walletMnemonic, {
      prefix: config.addrPrefix,
    });

    return super.fromSigner(this, wallet, config);
  }

  async validateToken(signedToken: SignedToken): Promise<AuthToken> {
    const authToken: AuthToken = signedToken.token;

    const valid =
      (await verifyTokenSignature(signedToken, this.config.addrPrefix)) &&
      authToken.user === signedToken.address &&
      authToken.agent === this.address;

    if (!valid) {
      throw new Error("Invalid auth token");
    }

    return authToken;
  }

  prepareAuthorization(signedToken: SignedToken) {
    const document = Buffer.from(
      serializeSignDoc(
        makeADR36AminoSignDoc(
          signedToken.address,
          JSON.stringify(signedToken.token)
        )
      )
    ).toString("base64");

    return {
      document,
      signature: signedToken.signature,
      pubkey: signedToken.pubkey,
    };
  }

  async executeWithAuth(
    signedToken: SignedToken,
    message: MessageWithAuthorization,
    options: ExecuteOptions = {}
  ): Promise<ExecuteResult> {
    await this.validateToken(signedToken);
    const authorization = this.prepareAuthorization(signedToken);
    const [rootKey] = Object.keys(message);
    message[rootKey].authorization = authorization;
    return this.execute(message, options);
  }
}
