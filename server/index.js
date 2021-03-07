console.log('Sharup Server');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
	cors: {
		origin: '*'
	}
});

app.get('/', (_, res) => {
	res.send({ status: 200 });
});

const LISTEN_PORT = process.env.PORT || 2805;

http.listen(LISTEN_PORT, () => {
	console.log('Server listening at port ' + LISTEN_PORT);
});

io.on('connection', (socket) => {
	const self = require('./helpers/id.helper').generate();

	socket.on('disconnect', () => require('./handlers/disconnect.handler').handle(self, socket));
	socket.on('sdp', data => require('./handlers/sdp.handler').handle(self, socket, data));
	socket.on('candidate', data => require('./handlers/candidate.handler').handle(self, socket, data));
	socket.on('join_request', data => require('./handlers/join.handler').handle(self, socket, data));
});