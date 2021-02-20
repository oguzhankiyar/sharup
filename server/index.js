console.log('Sharup Server');

const names = require('./names');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  path: process.env.SOCKET_PATH || '',
  cors: {
    origin: '*'
  }
});

app.get('/', (req, res) => {
  res.send({ status: 200 });
});

const LISTEN_PORT = process.env.PORT || 2805;

http.listen(LISTEN_PORT, () => {
  console.log('Server listening at port ' + LISTEN_PORT);
});

const MESSAGE_TYPE = { SDP: 'SDP', CANDIDATE: 'CANDIDATE', JOIN_REQ: 'JOIN_REQ', JOIN_RES: 'JOIN_RES' };

const peersByCode = {};

io.on('connection', (socket) => {
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

    peersByCode[code].push({ socket, id, name });

    socket.emit('message', JSON.stringify({
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
      peersByCode[code] = [{ socket, id, name }];
    } else if (!peersByCode[code].find(peer => peer.id === id)) {
      peersByCode[code].push({ socket, id, name });
    }

    const reply = JSON.stringify({
      message_type: message_type,
      content: content,
      code: code,
      name: name
    });

    peersByCode[code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.socket.emit('message', reply));
  };

  const candidate = (message) => {
    const { code, name, content, message_type } = message;
    if (!peersByCode[code]) {
      peersByCode[code] = [{ socket, id, name }];
    } else if (!peersByCode[code].find(peer => peer.id === id)) {
      peersByCode[code].push({ socket, id, name });
    }

    const reply = JSON.stringify({
      message_type: message_type,
      content: content,
      code: code,
      name: name
    });

    peersByCode[code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.socket.emit('message', reply));
  };

  const actions = {
    SDP: sdp,
    CANDIDATE: candidate,
    JOIN_REQ: join
  };

  socket.on('message', message => {
    const { code, name, content, message_type } = JSON.parse(message);
    const action = actions[message_type];
    if (action)
      action({ code, name, content, message_type });
  });
});