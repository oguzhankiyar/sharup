console.log('Sharup Server');

const names = require('./names');

const http = require('http');
const server = require('websocket').server;

const LISTEN_PORT = 2805;
const MESSAGE_TYPE = { SDP: 'SDP', CANDIDATE: 'CANDIDATE', JOIN_REQ: 'JOIN_REQ', JOIN_RES: 'JOIN_RES' };

const httpServer = http.createServer(() => { });
httpServer.listen(LISTEN_PORT, () => {
  console.log('Server listening at port ' + LISTEN_PORT);
});

const wsServer = new server({
  httpServer,
});

const peersByCode = {};

wsServer.on('request', request => {
  const connection = request.accept();
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const join = (message) => {
    let code = message.code;
    let name = message.name;

    if (!code) {
      var result = '';

      do {
        result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 8; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        result = result.toUpperCase();
      } while (peersByCode[result]);

      code = result;
    }

    if (!peersByCode[code]) {
      peersByCode[code] = [];
    }

    if (!name) {
      do {
        name = names.list[Math.floor(Math.random() * names.list.length)];
      } while (peersByCode[code].some(x => x.name === name));
    }

    peersByCode[code].push({ connection, id, name });

    connection.send(JSON.stringify({
      message_type: MESSAGE_TYPE.JOIN_RES,
      content: {
        id: id,
        code: code,
        name: name
      }
    }));
  };

  const sdp = (message) => {
    const { code, name, content, message_type } = message;
    if (!peersByCode[code]) {
      peersByCode[code] = [{ connection, id, name }];
    } else if (!peersByCode[code].find(peer => peer.id === id)) {
      peersByCode[code].push({ connection, id, name });
    }

    const reply = JSON.stringify({
      message_type: message_type,
      content: content,
      code: code,
      name: name
    });

    peersByCode[code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.connection.send(reply));
  };

  const candidate = (message) => {
    const { code, name, content, message_type } = message;
    if (!peersByCode[code]) {
      peersByCode[code] = [{ connection, id, name }];
    } else if (!peersByCode[code].find(peer => peer.id === id)) {
      peersByCode[code].push({ connection, id, name });
    }

    const reply = JSON.stringify({
      message_type: message_type,
      content: content,
      code: code,
      name: name
    });

    peersByCode[code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.connection.send(reply));
  };

  const actions = {
    SDP: sdp,
    CANDIDATE: candidate,
    JOIN_REQ: join
  };

  connection.on('message', message => {
    const { code, name, content, message_type } = JSON.parse(message.utf8Data);
    const action = actions[message_type];
    if (action)
      action({ code, name, content, message_type });
  });
});