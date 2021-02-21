import { io } from 'socket.io-client';

export class Connector {

	onConnected = () => { };
	onPeerChanged = () => { };
	onFileChanged = () => { };

	isConnected = false;
	peerConnection = null;
	socketConnection = null;
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

			await this.createPeerConnection();

			await this.createAndSendOffer();

			this.isConnected = true;
			if (this.onConnected)
				this.onConnected();

		} catch (err) {
			console.error(err);
		}
	};

	createPeerConnection = async () => {
		const peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
		});

		peerConnection.onnegotiationneeded = async () => {
			await this.createAndSendOffer();
		};

		peerConnection.onicecandidate = (iceEvent) => {
			if (iceEvent && iceEvent.candidate) {
				this.socketConnection.emit('candidate', JSON.stringify({
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
							const arrayBuffer = receivedBuffers.reduce((acc, arrayBuffer) => {
								const tmp = new Uint8Array(acc.byteLength + arrayBuffer.byteLength);
								tmp.set(new Uint8Array(acc), 0);
								tmp.set(new Uint8Array(arrayBuffer), acc.byteLength);
								return tmp;
							}, new Uint8Array());
							this.files.push({ name: channel.label, buffer: arrayBuffer, owner: metadata.owner, time: metadata.time });
							if (this.onFileChanged)
								this.onFileChanged();
							channel.close();
						} else {
							const arrayBuffer = receivedBuffers.reduce((acc, arrayBuffer) => {
								const tmp = new Uint8Array(acc.byteLength + arrayBuffer.byteLength);
								tmp.set(new Uint8Array(acc), 0);
								tmp.set(new Uint8Array(arrayBuffer), acc.byteLength);
								return tmp;
							}, new Uint8Array());

							metadata = JSON.parse(new TextDecoder("utf-8").decode(arrayBuffer));

							receivedBuffers.splice(0, receivedBuffers.length);
						}
					}
				} catch (err) {
					console.log('File transfer failed', err);
				}
			};
		};

		this.peerConnection = peerConnection;
	};

	createSocketConnection = async () => {
		const promise = new Promise((resolve, reject) => {
			const socketConnection = io('sharup-api.kiyar.io');

			socketConnection.on('peer_connected', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code, name, time } = data;

				if (code !== this.code) {
					return;
				}

				if (!this.peers.some(x => x.id === id) && id) {
					this.peers.push({ id, name, time });
				}

				if (this.onPeerChanged) {
					this.onPeerChanged();
				}
			});

			socketConnection.on('peer_disconnected', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code } = data;

				if (code !== this.code) {
					return;
				}

				this.peers = this.peers.filter(x => x.id !== id);

				if (this.onPeerChanged) {
					this.onPeerChanged();
				}
			});

			socketConnection.on('join_response', (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { id, code, name } = data;

				this.code = code;
				this.name = name;
				if (this.onConnected)
					this.onConnected();
			});

			socketConnection.on('sdp', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { code, name, content } = data;

				if (code !== this.code) {
					return;
				}

				if (content.type === 'offer') {
					await this.peerConnection.setRemoteDescription(content);
					const answer = await this.peerConnection.createAnswer();
					await this.peerConnection.setLocalDescription(answer);
					this.socketConnection.emit('sdp', JSON.stringify({
						code: this.code,
						name: this.name,
						content: answer
					}));
				} else if (content.type === 'answer') {
					await this.peerConnection.setRemoteDescription(content);
				} else {
					console.log('Unsupported SDP type.');
				}
			});

			socketConnection.on('candidate', async (message) => {
				const data = JSON.parse(message);

				if (!data) {
					return;
				}

				const { code, name, content } = data;

				if (code !== this.code) {
					return;
				}

				if (!!content) {
					await this.peerConnection.addIceCandidate(content);
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

	createAndSendOffer = async () => {
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);

		this.socketConnection.emit('sdp', JSON.stringify({
			code: this.code,
			name: this.name,
			content: offer
		}));
	}

	shareFile = async (file) => {
		if (file) {
			const time = new Date().getTime();
			const channelLabel = file.name;
			const channel = this.peerConnection.createDataChannel(channelLabel);
			channel.binaryType = 'arraybuffer';

			const arrayBuffer = await file.arrayBuffer();

			channel.onopen = async () => {
				const metadata = { owner: this.name, time: time };
				const metadataBuffer = new TextEncoder("utf-8").encode(JSON.stringify(metadata));
				for (let i = 0; i < metadataBuffer.byteLength; i += this.MAXIMUM_MESSAGE_SIZE) {
					channel.send(metadataBuffer.slice(i, i + this.MAXIMUM_MESSAGE_SIZE));
				}
				channel.send(this.END_OF_FILE_MESSAGE);

				for (let i = 0; i < arrayBuffer.byteLength; i += this.MAXIMUM_MESSAGE_SIZE) {
					channel.send(arrayBuffer.slice(i, i + this.MAXIMUM_MESSAGE_SIZE));
				}
				channel.send(this.END_OF_FILE_MESSAGE);
			};

			channel.onclose = () => {
				this.files.push({ name: channelLabel, buffer: arrayBuffer, owner: this.name, time: time });
				if (this.onFileChanged)
					this.onFileChanged();
			};
		}
	};

	downloadFile = (file) => {
		const blob = new Blob([file.buffer]);
		const a = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = file.name;
		a.click();
		window.URL.revokeObjectURL(url);
		a.remove();
	};
}
