import keystore from "../keystore";
import {
    getTransactionById,
    getTransactionInfoById,
    getLatestBlock,
    broadcastTransaction,
} from './jsonrpc';
import {base58check2HexString} from "../../../utils";
import {HttpClient} from "lib-common-util-js";
import BigNumber from "bignumber.js";

function sendTransaction(account, symbol, to, value, extraParams, data, network = 'mainnet') {
    return new Promise((resolve, reject) => {
        value = BigNumber.isBigNumber(value)? value: BigNumber(value);
        getLatestBlock(network)
            .then(block => {
                console.log('get latest block =>', block);
                // eslint-disable-next-line camelcase
                const latest_block = {
                    hash: block.blockID,
                    number: block.block_header.raw_data.number,
                };
                const now = new Date().getTime();
                const expire = now + 10 * 60 * 60 * 1000;
                const tx = {
                    timestamp: now,
                    expiration: expire,
                    to_address: to,
                    amount: value.shiftedBy(6).toNumber(),
                    owner_address: account.address,
                    private_key: account.private_key,
                    latest_block,
                };
                keystore.signTransaction(tx)
                    .then(signRes => {
                        console.log('sign result =>', signRes);
                        const signedTx = {
                            signature: signRes.signature,
                            txID: signRes.txID,
                            raw_data: {
                                contract: [
                                    {
                                        parameter: {
                                            value: {
                                                amount: tx.amount,
                                                owner_address: base58check2HexString(
                                                    tx.owner_address,
                                                ),
                                                to_address: base58check2HexString(tx.to_address),
                                            },
                                            type_url:
                                                'type.googleapis.com/protocol.TransferContract',
                                        },
                                        type: 'TransferContract',
                                    },
                                ],
                                ref_block_bytes: signRes.ref_block_bytes,
                                ref_block_hash: signRes.ref_block_hash,
                                expiration: tx.expiration,
                                timestamp: tx.timestamp,
                            },
                        };
                        broadcastTransaction(signedTx, network)
                            .then(broadcastRes => {
                                if (broadcastRes.result) {
                                    const pendingTx = {
                                        hash: `0x${signedTx.txID}`,
                                        timestamp: now,
                                        from: account.address,
                                        to,
                                        value,
                                        status: 'PENDING',
                                    };
                                    resolve({ pendingTx, pendingTokenTx: undefined });
                                } else {
                                    reject(res);
                                }
                            })
                            .catch(err => {
                                console.log('keystore broadcast tx failed', err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.log('keystore sign tx failed', err);
                        reject(err);
                    });
            })
            .catch(err => {
                console.log('keystore get latest block failed.', err);
                reject(err);
            });
    });
}

function getTransactionStatus(txHash, network = 'mainnet') {
    return new Promise((resolve, reject) => {
        getTransactionInfoById(txHash, network)
            .then(res => {
                const { blockNumber } = res;
                getTransactionById(txHash, network)
                    .then(tx => {
                        if (
                            tx.ret !== undefined &&
                            tx.ret instanceof Array &&
                            tx.ret.length > 0 &&
                            tx.ret[0].contractRet !== undefined
                        ) {
                            resolve({
                                blockNumber,
                                status: tx.ret[0].contractRet === 'SUCCESS',
                            });
                            return;
                        }
                        resolve(undefined);
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTransactionsByAddress(address, page = 0, size = 25, network = 'mainnet') {
    let url;
    if (network === 'mainnet') {
        url = `https://apilist.tronscan.org/api/transfer?sort=-timestamp&limit=${size}&start=${page}&address=${address}`;
    } else {
        url = `https://api.shasta.tronscan.org/api/transfer?sort=-timestamp&limit=${size}&start=${page}&address=${address}`;
    }
    console.log(`[tron req] get tron txs by address: ${url}`);
    return new Promise((resolve, reject) => {
        HttpClient.get(url, false)
            .then(res => {
                const { data } = res.data;
                const txs = {};
                data.forEach(t => {
                    const tx = {};
                    tx.hash = `0x${t.transactionHash}`;
                    tx.timestamp = t.timestamp;
                    tx.from = t.transferFromAddress;
                    tx.to = t.transferToAddress;
                    tx.value = new BigNumber(t.amount, 10).shiftedBy(-6).toNumber();
                    tx.blockNumber = t.block;
                    tx.status = t.confirmed ? 'CONFIRMED' : 'FAILED';
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
    if (network === 'mainnet') {
        return `https://tronscan.org/#/transaction/${txHash}`;
    }
    return `https://${network}.tronscan.org/#/transaction/${txHash}`;
}

export {
    sendTransaction,
    getTransactionStatus,
    getTransactionUrlInExplorer,
    getTransactionsByAddress
}