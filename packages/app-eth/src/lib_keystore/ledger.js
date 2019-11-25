import Eth from '@ledgerhq/hw-app-eth';

// eslint-disable-next-line import/no-mutable-exports
let wallet = {};

const initWallet = transport => {
    wallet = new Eth(transport);
};

const getWalletStatus = async () =>{
    try{
        await getAccountByLedger(0);
        return true;
    }catch(e){
        return false;
    }
};


const signByLedger = (index, sender, msg) => {
    msg = Buffer.isBuffer(msg) ? msg : Buffer.from(msg);
    const path = `44'/60'/0'/0/${index}`;
    return new Promise((resolve, reject) => {
        try {
            wallet.getAddress(path).then(
                account => {
                    if (account.address !== sender) {
                        reject(new Error('error.wrong_device'));
                    }
                    wallet.signPersonalMessage(path, msg.toString('hex')).then(
                        result => {
                            let v = result.v - 27;
                            v = v.toString(16);
                            if (v.length < 2) {
                                v = `0${v}`;
                            }
                            const signature = result.r + result.s + v;
                            resolve({ signature, publicKey: account.publicKey })
                        },
                        err => {
                            console.log(`sign tx error: ${err}`);
                            reject(new Error(err.code));
                        },
                    );
                },
                error => {
                    console.log(`get account error: ${error}`);
                    reject(new Error(error.code));
                },
            );
        } catch (e) {
            reject(new Error('error.wrong_device'));
        }
    });
};


const getAccountByLedger = async (index) => {
    const path = `44'/60'/0'/0/${index}`;
    const { address, publicKey } = await wallet.getAddress(path, false);
    return { address, index, publicKey };

};

export {
    wallet,
    signByLedger,
    getAccountByLedger,
    initWallet,
    getWalletStatus
}