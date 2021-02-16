console.log('Sharup Server');

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

  connection.on('message', message => {
    const { code, name, content, message_type } = JSON.parse(message.utf8Data);
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
  });
});