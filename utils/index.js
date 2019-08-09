const optional = require('optional');
const crypto =   global.platform && global.platform === 'mobile'? optional('react-native-crypto'): require('crypto-browserify');
import bs58check from 'bs58check';

function hmacSha512(key, str) {
    const hmac = crypto.createHmac('sha512', new Buffer(key, 'utf-8'));
    return hmac.update(new Buffer(str,'utf-8')).digest();
}

const longToByteArray =  (long) => {
    // we want to represent the input as a 8-bytes array
    let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let index = 0; index < byteArray.length; index++) {
        let byte = long & 0xff;
        byteArray[ index ] = byte;
        long = (long - byte) / 256
    }

    return byteArray
};

function base58check2HexString(str) {
    return bs58check.decode(str).toString('hex');
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

export {
    hmacSha512,
    longToByteArray,
    base58check2HexString,
    crypto,
    ab2str
};