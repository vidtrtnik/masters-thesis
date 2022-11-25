const ipfsClient = require('ipfs-http-client');
const canvas = require('canvas');
const fs = require('fs');

require('dotenv').config();
const ipfsServer = process.env.IPFS_SERVER;

async function ipfsAdd(contents) {
    const ipfs = await ipfsClient.create(new URL(ipfsServer));
    const add = await ipfs.add(Buffer.from(JSON.stringify(contents)), { pin: true })

    return add;
}

async function ipfsAddBuf(buffer) {
    const ipfs = await ipfsClient.create(new URL(ipfsServer));
    const add = await ipfs.add(buffer, { pin: true })

    return add;
}

function randomHexColor() {
    let result = "#";
    let hex = "ABCDEF0123456789";
    for (var i = 0; i < 6; i++) {
        result += hex.charAt(Math.floor(Math.random() * hex.length));
    }

    return result;
}

async function generateImage() {
    const imageCanvas = canvas.createCanvas(256, 256);
    const context = imageCanvas.getContext('2d');
    context.fillStyle = await randomHexColor();
    context.fillRect(0, 0, 256, 256);

    fs.writeFileSync(
        `test.png`,
        imageCanvas.toBuffer('image/png'),
    );
    var imageBuffer = imageCanvas.toBuffer('image/png')
    return imageBuffer
}

module.exports = {
    ipfsAdd,
    ipfsAddBuf,
    generateImage
}
