import BigNumber from "bignumber.js";
import Contract from 'aion-web3-eth-contract';
import { CONTRACT_ABI } from "./constants";
import { getTransactionReceipt, getTransactionCount, sendSignedTransaction } from './jsonrpc';
import {HttpClient} from "lib-common-util-js";
import keystore from '../keystore';
function sendNativeTx(account, to, value, gasPrice, gasLimit, data, network) {
    const { type, derivationIndex, private_key: privateKey } = account;
    return new Promise((resolve, reject) => {
        value = BigNumber.isBigNumber(value)? value: BigNumber(value);
        getTransactionCount(account.address, 'pending', network)
            .then(count => {
                let extra_params = { type: type};
                if (type === '[ledger]'){
                    extra_params = {
                        ...extra_params,
                        derivationIndex,
                        sender: account.address,
                    }
                }
                let tx = {
                    nonce: count,
                    to,
                    amount: value.shiftedBy(18),
                    timestamp: new Date().getTime() * 1000,
                    type: 1,
                    gasPrice,
                    gas: gasLimit,
                    extra_params,
                    private_key: privateKey
                };
                if (data !== undefined) {
                    tx = { ...tx, data };
                }

                keystore.signTransaction(tx)
                    .then(({encoded}) => {
                        sendSignedTransaction(encoded, network)
                            .then(hash => {
                                const pendingTx = {
                                    hash,
                                    timestamp: tx.timestamp/ 1000,
                                    from: account.address,
                                    to,
                                    value,
                                    status: 'PENDING',
                                    gasPrice
                                };
                                resolve({ pendingTx, pendingTokenTx: undefined });
                            })
                            .catch(err => {
                                console.log('keystore send signed tx error:', err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.log('keystore sign tx error:', err);
                        reject(err);
                    });
            })
            .catch(err => {
                console.log('keystore get transaction count error: ', err);
                reject(err);
            });
    });
}

function sendTransaction(account, symbol, to, value, extraParams, data, network = 'mainnet') {
    const { gasPrice } = extraParams;
    const { gasLimit } = extraParams;
    if (account.symbol === symbol) {
        return sendNativeTx(account, to, value, gasPrice, gasLimit, data, network);
    }
    return sendTokenTx(account, symbol, to, value, gasPrice, gasLimit, network);
}

function sendTokenTx(account, symbol, to, value, gasPrice, gasLimit, network = 'mainnet') {
    const { tokens } = account;
    const { contractAddr, tokenDecimal } = tokens[symbol];
    console.log('tokenDecimal=>', tokenDecimal);
    const tokenContract = new Contract(CONTRACT_ABI, contractAddr);
    const methodsData = tokenContract.methods
        .send(
            to,
            value
                .shiftedBy(tokenDecimal - 0)
                .toFixed(0)
                .toString(),
            '',
        )
        .encodeABI();

    return new Promise((resolve, reject) => {
        sendNativeTx(
            account,
            contractAddr,
            new BigNumber(0),
            gasPrice,
            gasLimit,
            methodsData,
            network,
        )
            .then(res => {
                const { pendingTx } = res;
                const pendingTokenTx = {
                    hash: pendingTx.hash,
                    timestamp: pendingTx.timestamp,
                    from: pendingTx.from,
                    to,
                    value,
                    status: 'PENDING',
                };

                resolve({ pendingTx, pendingTokenTx });
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTransactionsByAddress(address, page = 0, size = 25, network = 'mainnet') {
    const url = `https://${network}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address.toLowerCase()}&page=${page}&size=${size}`;
    console.log(`[aion req] get aion transactions by address: ${url}`);
    return new Promise((resolve, reject) => {
        HttpClient.get(url, false)
            .then(res => {
                console.log('[keystore resp] res:', res.data);
                const { content } = res.data;
                const txs = {};
                content.forEach(t => {
                    const tx = {};
                    const timestamp = `${t.transactionTimestamp}`;
                    tx.hash = `0x${t.transactionHash}`;
                    tx.timestamp =
                        timestamp.length === 16
                            ? timestamp / 1000
                            : timestamp.length === 13
                            ? timestamp * 1
                            : timestamp.length === 10
                                ? timestamp * 1000
                                : null;
                    console.log('timestamp=>', tx.timestamp);
                    tx.from = `0x${t.fromAddr}`;
                    tx.to = `0x${t.toAddr}`;
                    tx.value = new BigNumber(t.value, 10).toNumber();
                    tx.status = t.txError === '' ? 'CONFIRMED' : 'FAILED';
                    tx.blockNumber = t.blockNumber;
                    tx.fee = t.nrgConsumed * t.nrgPrice * 10**-18;
                    txs[tx.hash] = tx;
                });
                resolve(txs);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTransactionUrlInExplorer(txHash, network = 'mainnet') {
    return `https://${network}.aion.network/#/transaction/${txHash}`;
}

function getTransactionStatus(txHash, network = 'mainnet') {
    return new Promise((resolve, reject) => {
        getTransactionReceipt(txHash, network)
            .then(receipt => {
                if (receipt !== null) {
                    resolve({
                        status: parseInt(receipt.status, 16) === 1,
                        blockNumber: parseInt(receipt.blockNumber, 16),
                        gasUsed: parseInt(receipt.gasUsed, 16),
                    });
                } else {
                    resolve(null);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

export{
    sendTransaction,
    getTransactionsByAddress,
    getTransactionUrlInExplorer,
    getTransactionStatus
}