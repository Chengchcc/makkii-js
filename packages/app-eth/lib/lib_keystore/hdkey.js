"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bip39 = require("bip39");
const keypair_1 = require("./keypair");
const hdKey = require("hdkey");
function getAccountFromMnemonic(mnemonic, index) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const path = `m/44'/60'/0'/0/${index}`;
            const seed = yield bip39.mnemonicToSeed(mnemonic);
            const node = hdKey.fromMasterSeed(seed);
            const keyPairBIP44 = node.derive(path);
            const key = keypair_1.keyPair(keyPairBIP44.privateKey);
            return {
                private_key: key.privateKey,
                public_key: key.publicKey,
                address: key.address,
                index
            };
        }
        catch (e) {
            throw new Error(`get Key ETH failed: ${e}`);
        }
    });
}
exports.getAccountFromMnemonic = getAccountFromMnemonic;
//# sourceMappingURL=hdkey.js.map