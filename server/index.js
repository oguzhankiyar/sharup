console.log('Sharup Server');

const names = require('./names');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
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

const peersByCode = {};

io.on('connection', (socket) => {
	const self = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	socket.on('disconnect', () => {
		const code = Object.keys(peersByCode).filter(x => peersByCode[x].some(y => y.id === self))[0];
		const peer = peersByCode[code].filter(x => x.id === self)[0];

		peersByCode[code] = peersByCode[code].filter(x => x.id !== self);

		peersByCode[code]
			.forEach(x => x.socket.emit('peer_disconnected', JSON.stringify({
				id: peer.id,
				code: code,
				name: peer.name
			})));
	});

	socket.on('sdp', message => {
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
	});

	socket.on('candidate', message => {
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
			.forEach(peer => peer.socket.emit('candidate', reply));
	});

	socket.on('join_request', message => {
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
				name = names.list[Math.floor(Math.random() * names.list.length)];
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
	});
});