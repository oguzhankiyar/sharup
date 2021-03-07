const peersByCode = require('../states/peer.state').peersByCode;

exports.handle = (self, socket, message) => {
    const data = JSON.parse(message);

    const { id, code, name, content } = data;

    const reply = JSON.stringify({
        id: self,
        code: code,
        name: name,
        content: content
    });

    peersByCode[code]
        .filter(peer => peer.id === id)
        .forEach(peer => peer.socket.emit('sdp', reply));
};