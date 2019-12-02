import BigNumber from 'bignumber.js';
import { HttpClient } from 'lib-common-util-js';


export const processRequest = (methodName, params) => {
  const requestData = {
    method: methodName,
    params,
    id: 42,
    jsonrpc: '2.0',
  };

  return JSON.stringify(requestData);
};

export default (config) => {
  const checkBlockTag = (blockTag) => {
    if (blockTag == null) {
      return 'latest';
    }

    if (blockTag === 'earliest') {
      return '0x0';
    }

    if (blockTag === 'latest' || blockTag === 'pending') {
      return blockTag;
    }

    if (typeof blockTag === 'number') {
      return `0x${new BigNumber(blockTag).toString(16)}`;
    }

    throw new Error('invalid blockTag');
  };


  const getBlockByNumber = async (blockNumber /* hex string */, fullTxs = false) => {
    const requestData = processRequest('eth_getBlockByNumber', [blockNumber, fullTxs]);
    const res = await HttpClient.post(config.jsonrpc, requestData, true, {
      'Content-Type': 'application/json',
    });
    console.log(`[aion http req] eth_getBlockByNumber[${blockNumber},${fullTxs}]`);
    console.log('[aion http resp] eth_getBlockByNumber', res.data);
    if (res.data.error) throw new Error(res.data.error);
    return res.data.result;
  }

  const blockNumber = async () => {
    const requestData = processRequest('eth_blockNumber', []);
    const res = await HttpClient.post(config.jsonrpc, requestData, true, {
      'Content-Type': 'application/json',
    });
    console.log('[aion http req] eth_blockNumber[]');
    console.log('[aion http resp] eth_blockNumber', res.data);
    if (res.data.error) throw new Error(res.data.error);
    return res.data.result;
  }

  const getBalance = async (address) => {
    const params = [address.toLowerCase(), 'latest'];
    const requestData = processRequest('eth_getBalance', params);
    const res = await HttpClient.post(config.jsonrpc, requestData, true, {
      'Content-Type': 'application/json',
    });
    console.log(`[aion http req] eth_getBalance[${address}, 'latest']`);
    console.log('[aion http resp] eth_getBalance', res.data);
    if (res.data.error) throw new Error(res.data.error);
    return new BigNumber(res.data.result).shiftedBy(-18);
  }

  const getTransactionCount = async (address, blockTag) => {
    const params = [address.toLowerCase(), checkBlockTag(blockTag)];
    const requestData = processRequest('eth_getTransactionCount', params);
    const res = await HttpClient.post(config.jsonrpc, requestData, true, {
      'Content-Type': 'application/json',
    });
    console.log(`[aion http req] eth_getTransactionCount[${address}, ${blockTag}]`);
    console.log('[aion http resp] eth_getTransactionCount', res.data);
    if (res.data.error) throw new Error(res.data.error);
    return res.data.result;
  };

  const sendSignedTransaction = async (signedTx) => {
    const params = [signedTx];
    const requestData = processRequest('eth_sendRawTransaction', params);
    const res = await HttpClient.post(config.jsonrpc, requestData, true, {
      'Content-Type': 'application/json',
    });
    console.log(`[aion http req] eth_sendRawTransaction[${signedTx}]`);
    console.log('[aion http resp] eth_sendRawTransaction', res.data);
    if (res.data.error) throw new Error(res.data.error);
    return res.data.result;
  };

  const getTransactionReceipt = async (hash) => {
    const params = [hash];
    const requestData = processRequest('eth_getTransactionReceipt', params);
    const res = await HttpClient.post(config.jsonrpc, requestData, true, {
      'Content-Type': 'application/json',
    });
    console.log(`[aion http req] eth_getTransactionReceipt[${hash}]`);
    console.log('[aion http resp] eth_getTransactionReceipt', res.data);
    if (res.data.error) throw new Error(res.data.error);
    return res.data.result;
  };

  return {
    blockNumber,
    getBalance,
    getBlockByNumber,
    getTransactionCount,
    getTransactionReceipt,
    sendSignedTransaction,
    processRequest,
  };
}