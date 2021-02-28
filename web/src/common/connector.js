import { io } from 'socket.io-client';

export class Connector {

	onConnected = () => { };
	onFailed = (error) => { };
	onPeerChanged = () => { };
	onFileChanged = () => { };

	isConnected = false;
	peerConnections = {};
	socketConnection = null;
	id = null;
	code = null;
	name = null;
	files = [];
	peers = [];

	MAXIMUM_MESSAGE_SIZE = 65535;
	END_OF_FILE_MESSAGE = 'EOF';

	startConnection = async (code, name) => {
		this.code = code;
		this.name = name;

		try {
			await this.createSocketConnection();
		} catch (err) {
			console.error(err);
		}
	};

	createPeerConnection = async (id) => {
		const peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
		});

		peerConnection.onnegotiationneeded = async () => {
			await this.createAndSendOffer(id);
		};

		peerConnection.onicecandidate = (iceEvent) => {
			if (iceEvent && iceEvent.candidate) {
				this.socketConnection.emit('candidate', JSON.stringify({
					id: id,
					code: this.code,
					name: this.name,
					content: iceEvent.candidate
				}));
			}
		};

		peerConnection.ondatachannel = (event) => {
			const { channel } = event;
			channel.binaryType = 'arraybuffer';

			let metadata = null;
			const receivedBuffers = [];
			channel.onmessage = async (event) => {
				const { data } = event;
				try {
					if (data !== this.END_OF_FILE_MESSAGE) {
						receivedBuffers.push(data);
					} else {
						if (!!metadata) {
							const id = channel.label;
							const { name, owner, time } = metadata;
							const content = receivedBuffers.reduce((acc, content) => {
								const tmp = new Uint8Array(acc.byteLength + content.byteLength);
								tmp.set(new Uint8Array(acc), 0);
								tmp.set(new Uint8Array(content), acc.byteLength);
								return tmp;
							}, new Uint8Array());

							this.files.push({ id, name, content, owner, time });
							if (this.onFileChanged)
								this.onFileChanged();
								
							channel.close();
						} else {
							const content = receivedBuffers.reduce((acc, content) => {
								const tmp = new Uint8Array(acc.byteLength + content.byteLength);
								tmp.set(new Uint8Array(acc), 0);
								tmp.set(new Uint8Array(content), acc.byteLength);
								return tmp;
							}, new Uint8Array());

							metadata = JSON.parse(new TextDecoder('utf-8').decode(content));

							receivedBuffers.splice(0, receivedBuffers.length);
						}
					}
				} catch (err) {
					console.log('File transfer failed', err);
				}
			};
		};

		this.peerConnections[id] = peerConnection;
	};

	createSocketConnection = async () => {
		const promise = new Promise((resolve, reject) => {
			const socketConnection = io('sharup-api.kiyar.io');

			socketConnection.on('peer_connected', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code, name, type, time } = data;
				const me = false;

				if (code !== this.code) {
					return;
				}

				if (!this.peers.some(x => x.id === id) && id) {
					this.peers.push({ id, name, time, me });

					await this.createPeerConnection(id);

					if (type === 'offer') {
						await this.createAndSendOffer(id);
					}

					if (this.onPeerChanged) {
						this.onPeerChanged();
					}

					this.files
						.filter(x => x.owner.id === this.id || (x.deputy && x.deputy.id === this.id))
						.forEach(x => {
							this.shareFile(x, [ id ]);
						});
				}
			});

			socketConnection.on('peer_disconnected', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code, deputy } = data;

				if (code !== this.code) {
					return;
				}
				
				this.files
					.filter(x => x.owner.id === id)
					.forEach(x => {
						x.deputy = deputy
					});

				this.peers = this.peers.filter(x => x.id !== id);

				if (this.onPeerChanged) {
					this.onPeerChanged();
				}

				if (this.peerConnections[id]) {
					this.peerConnections[id].close();
					delete this.peerConnections[id];
				}
			});

			socketConnection.on('join_response', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, status, error, code, name } = data;
				const time = new Date().getTime();
				const me = true;

				if (!status || status === false) {
					if (this.onFailed)
						this.onFailed(error);
						
					socketConnection.close();
					return;
				}

				this.id = id;
				this.code = code;
				this.name = name;

				await this.createPeerConnection(this.id);

				this.isConnected = true;
				if (this.onConnected)
					this.onConnected();

				this.peers.push({ id, name, time, me });
				if (this.onPeerChanged)
					this.onPeerChanged();
			});

			socketConnection.on('sdp', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code, name, content } = data;

				if (code !== this.code) {
					return;
				}

				if (id === this.id) {
					return;
				}

				if (!this.peerConnections[id]) {
					await this.createPeerConnection(id);
				}

				await this.peerConnections[id].setRemoteDescription(content);

				if (content.type === 'offer') {
					const answer = await this.peerConnections[id].createAnswer();
					await this.peerConnections[id].setLocalDescription(answer);

					this.socketConnection.emit('sdp', JSON.stringify({
						id: id,
						code: this.code,
						name: this.name,
						content: answer
					}));
				}
			});

			socketConnection.on('candidate', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code, name, content } = data;

				if (code !== this.code) {
					return;
				}

				if (id === this.id) {
					return;
				}

				if (!!content) {
					await this.peerConnections[id].addIceCandidate(content);
				}
			});

			socketConnection.on('connect', () => {
				resolve();

				this.socketConnection.emit('join_request', JSON.stringify({
					code: this.code,
					name: this.name
				}));
			});

			socketConnection.on('disconnect', () => {
				reject();
			});

			socketConnection.on('connect_error', () => {
				reject();
			});

			socketConnection.connect();

			this.socketConnection = socketConnection;
		});

		return promise;
	}

	createAndSendOffer = async (id) => {
		if (id === this.id) {
			return;
		}

		const offer = await this.peerConnections[id].createOffer();
		await this.peerConnections[id].setLocalDescription(offer);

		this.socketConnection.emit('sdp', JSON.stringify({
			id: id,
			code: this.code,
			name: this.name,
			content: offer
		}));
	}

	shareNewFile = (fileName, fileContent, receivers) => {
		if (!fileName || !fileContent) {
			return;
		}

		const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		const name = fileName;
		const content = fileContent;
		const owner = { id: this.id, name: this.name };
		const time = new Date().getTime();

		if (!receivers) {
			receivers = Object.keys(this.peerConnections).filter(x => x !== this.id);
		}

		const file = { id, name, content, owner, time };

		this.shareFile(file, receivers);
	};

	shareFile(file, receivers) {
		if (!file) {
			return;
		}

		const { id, name, content, owner, time } = file;

		if (!receivers) {
			receivers = Object.keys(this.peerConnections).filter(x => x !== this.id);
		}

		receivers.forEach(x => {
			const channel = this.peerConnections[x].createDataChannel(id);

			channel.binaryType = 'arraybuffer';

			channel.onopen = () => {
				const metadata = { id, name, owner, time };
				const metadataBuffer = new TextEncoder('utf-8').encode(JSON.stringify(metadata));

				for (let i = 0; i < metadataBuffer.byteLength; i += this.MAXIMUM_MESSAGE_SIZE) {
					channel.send(metadataBuffer.slice(i, i + this.MAXIMUM_MESSAGE_SIZE));
				}
				channel.send(this.END_OF_FILE_MESSAGE);

				for (let i = 0; i < content.byteLength; i += this.MAXIMUM_MESSAGE_SIZE) {
					channel.send(content.slice(i, i + this.MAXIMUM_MESSAGE_SIZE));
				}
				channel.send(this.END_OF_FILE_MESSAGE);
			};

			channel.onclose = () => {
				if (this.onFileChanged)
					this.onFileChanged();
			};
		});

		if (!this.files.some(x => x.id === id)) {
			this.files.push(file);
		}
	};

	downloadFile = (file) => {
		const blob = new Blob([file.content]);
		const a = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = file.name;
		a.click();
		window.URL.revokeObjectURL(url);
		a.remove();
	};
}
