import { Secp256k1, Secp256k1Signature, sha256 } from "@cosmjs/crypto";
import {
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
  serializeSignDoc,
  StdSignDoc,
} from "@cosmjs/launchpad";
import { SignedToken } from "./types";

export async function verifyTokenSignature(
  signedToken: SignedToken,
  addrPrefix: string
): Promise<boolean> {
  const serialDoc = serializeSignDoc(
    makeADR36AminoSignDoc(
      signedToken.address,
      JSON.stringify(signedToken.token)
    )
  );
  const signature = Buffer.from(signedToken.signature, "base64");
  const pubkey = Buffer.from(signedToken.pubkey, "base64");
  return (
    pubkeyToAddress(encodeSecp256k1Pubkey(pubkey), addrPrefix) ===
      signedToken.address &&
    (await verifySignedDoc(serialDoc, signature, pubkey))
  );
}

/** below is mostly stolen from keplr **/

function verifySignedDoc(
  msg: Uint8Array,
  signature: Uint8Array,
  pubkey: Uint8Array
): Promise<boolean> {
  const hash = sha256(Buffer.from(msg));

  let r = signature.slice(0, 32);
  let s = signature.slice(32);
  const rIsNegative = r[0] >= 0x80;
  const sIsNegative = s[0] >= 0x80;
  if (rIsNegative) {
    r = new Uint8Array([0, ...r]);
  }
  if (sIsNegative) {
    s = new Uint8Array([0, ...s]);
  }

  // Der encoding
  const derData = new Uint8Array([0x02, r.length, ...r, 0x02, s.length, ...s]);
  return Secp256k1.verifySignature(
    Secp256k1Signature.fromDer(
      new Uint8Array([0x30, derData.length, ...derData])
    ),
    hash,
    pubkey
  );
}

export function makeADR36AminoSignDoc(
  signer: string,
  data: string | Uint8Array
): StdSignDoc {
  if (typeof data === "string") {
    data = Buffer.from(data).toString("base64");
  } else {
    data = Buffer.from(data).toString("base64");
  }

  return {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: {
      gas: "0",
      amount: [],
    },
    msgs: [
      {
        type: "sign/MsgSignData",
        value: {
          signer,
          data,
        },
      },
    ],
    memo: "",
  };
}
