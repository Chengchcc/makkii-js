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
const lib_hw_ledger_js_1 = require("lib-hw-ledger-js");
let wallet = {};
let isConnect = false;
const initWallet = (transport) => {
    transport.on('disconnect', () => {
        isConnect = false;
    });
    wallet = new lib_hw_ledger_js_1.AionApp(transport);
};
exports.initWallet = initWallet;
const getWalletStatus = () => isConnect;
exports.getWalletStatus = getWalletStatus;
const signByLedger = (index, sender, msg) => {
    msg = Buffer.isBuffer(msg) ? msg : Buffer.from(msg);
    return new Promise((resolve, reject) => {
        try {
            wallet.getAccount(parseInt(index)).then((account) => {
                if (account.address !== sender) {
                    reject(new Error('error.wrong_device'));
                }
                wallet.sign(parseInt(index), msg).then((res) => {
                    resolve({ signature: res, publicKey: account.pubKey });
                }, (err) => {
                    console.log(`sign tx error: ${err}`);
                    reject(new Error(err.code));
                });
            }, (error) => {
                console.log(`get account error: ${error}`);
                reject(new Error(error.code));
            });
        }
        catch (e) {
            reject(new Error('error.wrong_device'));
        }
    });
};
exports.signByLedger = signByLedger;
const getKeyByLedger = (index) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = yield wallet.getAccount(index);
    return { address, index };
});
exports.getKeyByLedger = getKeyByLedger;
//# sourceMappingURL=ledger.js.map