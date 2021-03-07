const names = require('../constants/name.constant').list;
const peersByCode = require('../states/peer.state').peersByCode;

exports.handle = (self, socket, message) => {
    const data = JSON.parse(message);
    const time = new Date().getTime();

    let { code, name } = data;

    if (!code) {
        let result = '';

        do {
            result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < 8; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            result = result.toUpperCase();
        } while (peersByCode[result]);

        code = result;
    } else if (!peersByCode[code]) {
        socket.emit('join_response', JSON.stringify({
            id: self,
            status: false,
            error: 'Wrong Code!'
        }));
    }

    if (!peersByCode[code]) {
        peersByCode[code] = [];
    }

    if (!name) {
        do {
            name = names[Math.floor(Math.random() * names.length)];
        } while (peersByCode[code].some(x => x.name === name));
    }

    peersByCode[code].push({ socket, id: self, name, time });

    socket.emit('join_response', JSON.stringify({
        id: self,
        status: true,
        code: code,
        name: name
    }));

    peersByCode[code]
        .filter(peer => peer.id !== self)
        .forEach(peer => {
            peer.socket.emit('peer_connected', JSON.stringify({
                id: self,
                code: code,
                name: name,
                type: 'offer',
                time: time
            }));

            socket.emit('peer_connected', JSON.stringify({
                id: peer.id,
                code: code,
                name: peer.name,
                type: 'answer',
                time: peer.time
            }));
        });
};