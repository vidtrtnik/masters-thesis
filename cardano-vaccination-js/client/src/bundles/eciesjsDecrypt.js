 
const ecies = require('eciesjs');
var Buffer = require('buffer/').Buffer

async function eciesjsDecrypt(privkeyhex, datahex)
{
    const data = Buffer.from(datahex, 'hex');
            const privateKey = Buffer.from(privkeyhex, 'hex');

    var decrypted = null;
    try {
        decrypted = ecies.decrypt(privateKey, data).toString();
    }
    catch(e) {
        console.log("ERROR: ", e);
    }
    return decrypted;
}
