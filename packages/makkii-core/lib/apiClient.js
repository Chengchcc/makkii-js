"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_common_util_js_1 = require("lib-common-util-js");
function isInstanceOfApiClient(client) {
    const map = [
        "getBlockByNumber",
        "getBlockNumber",
        "getTransactionStatus",
        "getTransactionExplorerUrl",
        "getBalance",
        "getNetwork",
        "getTransactionsByAddress",
        "validateBalanceSufficiency",
        "sendTransaction",
        "sameAddress",
    ];
    return !map.some(i => !(i in client));
}
class ApiClient {
    constructor() {
        this.coins = {};
        this.addCoin = (coinType, client) => {
            if (!isInstanceOfApiClient(client)) {
                throw new Error('not a api client!');
            }
            this.coins[coinType.toLowerCase()] = client;
        };
        this.removeCoin = (coinType) => {
            if (this.coins[coinType.toLowerCase()]) {
                delete this.coins[coinType.toLowerCase()];
                return true;
            }
            return false;
        };
        this.getCoin = (coinType) => {
            const coin = this.coins[coinType.toLowerCase()];
            if (!coin) {
                throw new Error(`coin: [${coinType}] is not init or unsupported.`);
            }
            return coin;
        };
        this.getBlockByNumber = (coinType, blockNumber) => {
            const coin = this.getCoin(coinType);
            return coin.getBlockByNumber(blockNumber);
        };
        this.getBlockNumber = (coinType) => {
            const coin = this.getCoin(coinType);
            return coin.getBlockNumber();
        };
        this.getTransactionStatus = (coinType, hash) => {
            const coin = this.getCoin(coinType);
            return coin.getTransactionStatus(hash);
        };
        this.getTransactionExplorerUrl = (coinType, hash) => {
            const coin = this.getCoin(coinType);
            return coin.getTransactionExplorerUrl(hash);
        };
        this.getBalance = (coinType, address) => {
            const coin = this.getCoin(coinType);
            return coin.getBalance(address);
        };
        this.getTransactionsByAddress = (coinType, address, page, size) => {
            const coin = this.getCoin(coinType);
            return coin.getTransactionsByAddress(address, page, size);
        };
        this.validateBalanceSufficiency = (coinType, account, amount, extraParams) => {
            const coin = this.getCoin(coinType);
            return coin.validateBalanceSufficiency(account, amount, extraParams);
        };
        this.sendTransaction = (coinType, account, to, value, data, extraParams, shouldBroadCast) => {
            const coin = this.getCoin(coinType);
            return coin.sendTransaction(account, to, value, extraParams, data, shouldBroadCast);
        };
        this.sameAddress = (coinType, address1, address2) => {
            const coin = this.getCoin(coinType);
            return coin.sameAddress(address1, address2);
        };
        this.getTokenIconUrl = (coinType, tokenSymbol, contractAddress) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.getTokenIconUrl(tokenSymbol, contractAddress);
            }
            throw new Error(`[${coinType}] getTokenIconUrl is not implemented.`);
        };
        this.getTokenDetail = (coinType, contractAddress) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.getTokenDetail(contractAddress);
            }
            throw new Error(`[${coinType}] getTokenDetail is not implemented.`);
        };
        this.getAccountTokenTransferHistory = (coinType, address, symbolAddress, page, size, timestamp) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.getAccountTokenTransferHistory(address, symbolAddress, page, size, timestamp);
            }
            throw new Error(`[${coinType}] getAccountTokenTransferHistory is not implemented.`);
        };
        this.getAccountTokens = (coinType, address) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.getAccountTokens(address);
            }
            throw new Error(`[${coinType}] getAccountTokens is not implemented.`);
        };
        this.getAccountTokenBalance = (coinType, contractAddress, address) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.getAccountTokenBalance(contractAddress, address);
            }
            throw new Error(`[${coinType}] getAccountTokenBalance is not implemented.`);
        };
        this.getTopTokens = (coinType, topN) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.getTopTokens(topN);
            }
            throw new Error(`[${coinType}] getTopTokens is not implemented.`);
        };
        this.searchTokens = (coinType, keyword) => {
            const coin = this.getCoin(coinType);
            if ('tokenSupport' in coin && !!coin.tokenSupport) {
                return coin.searchTokens(keyword);
            }
            throw new Error(`[${coinType}] searchTokens is not implemented.`);
        };
        this.getCoinPrices = (currency) => {
            const cryptos = Object.keys(this.coins).map(c => c.toUpperCase()).join(',');
            const url = `https://www.chaion.net/makkii/market/prices?cryptos=${cryptos}&fiat=${currency}`;
            return lib_common_util_js_1.HttpClient.get(url, false);
        };
    }
}
exports.default = ApiClient;
//# sourceMappingURL=apiClient.js.map