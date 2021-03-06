import { IHardware } from "@makkii/makkii-core/src/interfaces/hardware";
import { AionApp } from "lib-hw-ledger-js";
import { hexutil } from "lib-common-util-js";
import { AionUnsignedTx } from "../../type";
import { process_unsignedTx } from "../../lib_keystore/transaction";

const rlp = require("aion-rlp");

/**
 * Aion ledger client, implements IHardware interface.
 *
 * User should call getHardwareStatus() first to check ledger and app status,
 * then decide whether to call other functions.
 * @category Hardware
 */
export default class AionLedger implements IHardware {
    private hardware: any = {};

    /**
     * Get aion account from ledger app
     *
     * @param index index path in hd wallet
     * @returns account, exmaple: { address: "0xa0...", index: 1 }
     */
    getAccount = async (index: number) => {
        const { address } = await this.hardware.getAccount(index);
        return { address, index };
    };

    getHardwareStatus = async () => {
        try {
            const res = await this.getAccount(0);
            return !!res;
        } catch (e) {
            return false;
        }
    };

    /**
     * Sign transaction
     *
     * @param tx AionUnsignedTx transaction object to sign
     * @param params parameters object, example: { derivationIndex: 1 }
     * @return Promise of transaction hash string
     */
    signTransaction = async (
        tx: AionUnsignedTx,
        params: { derivationIndex: number }
    ): Promise<string> => {
        const { derivationIndex } = params;
        const rlpEncoded = process_unsignedTx(tx);
        const account = await this.hardware.getAccount(derivationIndex);
        const signature = await this.hardware.sign(derivationIndex, rlpEncoded);
        const fullSignature = Buffer.concat([
            Buffer.from(hexutil.stripZeroXHexString(account.pubKey), "hex"),
            Buffer.from(hexutil.stripZeroXHexString(signature), "hex")
        ]);
        const rawTx = rlp.decode(rlpEncoded).concat(fullSignature);

        // re-encode with signature included
        const rawTransaction = rlp.encode(rawTx);
        return `0x${rawTransaction.toString("hex")}`;
    };

    /**
     * Set ledger transport.
     *
     * @param transport. valid ledger transport implementation,
     * refer to ledger [hw-transport](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport)
     */
    setLedgerTransport = (transport: any) => {
        this.hardware = new AionApp(transport);
        return this;
    };
}
