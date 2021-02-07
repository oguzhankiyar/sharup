console.log('Sharup Server');

const names = require('./names');

const http = require('http');
const server = require('websocket').server;

const LISTEN_PORT = 2805;

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
  const name = names.list[Math.floor(Math.random() * names.list.length)];

  connection.on('message', message => {
    const data = JSON.parse(message.utf8Data);
    if (!peersByCode[data.code]) {
      peersByCode[data.code] = [{ connection, id, name }];
    } else if (!peersByCode[data.code].find(peer => peer.id === id)) {
      peersByCode[data.code].push({ connection, id, name });
    }

    const reply = JSON.stringify({
      message_type: data.message_type,
      content: data.content,
      code: data.code,
      name: name
    });

    peersByCode[data.code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.connection.send(reply));
  });
});