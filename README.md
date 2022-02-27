# cw-auth-js: cosmwasm off-chain auth

this library primarily provides two classes which serve as wrappers around
`CosmWasmSigningClient`, one of which is used client-side for users to 
create and sign auth tokens (with Keplr), and one of which is used server-side 
to validate the tokens and pass them into contracts which accept auth tokens
via [cw-auth](https://github.com/aswever/cw-auth).

## client usage

instantiate the user account by passing in Keplr along with the config object
(shown below). you can then use it to sign an auth token, passing in an object
with whatever metadata you would like to attach to the token

```ts
const userAccount = await UserAccount.create(keplr, config);
const signedToken = await account.signAuthToken({ username })
```

## server usage

for the server, you can instantiate the agent account with a wallet mnemonic
along with the AgentConfig. `validateToken` will simply validate the given
signed token and return the token itself; `executeWithAuth` will execute a
message on the contract with the signed auth token included.

```ts
const account = await AgentAccount.create(mnemonic, config);
const validToken = await account.validateToken(signedToken);
const response = await account.executeWithAuth(signedToken, message);
```

## config interfaces

```ts
export interface AuthConfig {
  rpcEndpoint: string; // "http://localhost:26657"
  gasPrice: string; // "0.025"
  coinDenom: string; // "ujunox"
  contractAddress: string; // "juno1..."
}

export interface AgentConfig extends AuthConfig {
  addrPrefix: string; // "juno"
}

export interface UserConfig extends AuthConfig {
  chainId: string; // "testing"
  agentAddress: string; // "juno1..." - this is the address used by the AgentAccount on the server
}
```
