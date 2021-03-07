const peersByCode = require('../states/peer.state').peersByCode;

exports.handle = (self, socket) => {
    const code = Object.keys(peersByCode).filter(x => peersByCode[x].some(y => y.id === self))[0];
    const peer = peersByCode[code].filter(x => x.id === self)[0];

    peersByCode[code] = peersByCode[code].filter(x => x.id !== self);

    const deputy = peersByCode[code][Math.floor(Math.random() * peersByCode[code].length)];

    peersByCode[code]
        .forEach(x => x.socket.emit('peer_disconnected', JSON.stringify({
            id: peer.id,
            code: code,
            name: peer.name,
            deputy: { id: deputy.id, name: deputy.name }
        })));
};