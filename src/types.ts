import { Coin } from "@cosmjs/launchpad";

export interface ExecuteOptions {
  funds?: Coin[];
  memo?: string;
}

export interface AuthToken {
  user: string;
  agent: string;
  expires: number;
  meta: Record<string, unknown>;
}

export interface SignedToken {
  token: AuthToken;
  address: string;
  signature: string;
  pubkey: string;
}

export interface Authorization {
  document: string;
  signature: string;
  pubkey: string;
}

export interface MessageWithAuthorization {
  [key: string]: {
    [key: string]: unknown;
    authorization?: Authorization;
  };
}

export interface AuthConfig {
  rpcEndpoint: string;
  gasPrice: string;
  coinDenom: string;
  contractAddress: string;
}

export interface AgentConfig extends AuthConfig {
  addrPrefix: string;
}

export interface UserConfig extends AuthConfig {
  chainId: string;
  agentAddress: string;
}
