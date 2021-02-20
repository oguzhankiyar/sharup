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

    MESSAGE_TYPE = { SDP: 'SDP', CANDIDATE: 'CANDIDATE', JOIN_REQ: 'JOIN_REQ', JOIN_RES: 'JOIN_RES' };
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
                this.sendMessage({
                    message_type: this.MESSAGE_TYPE.CANDIDATE,
                    content: iceEvent.candidate,
                });
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

                const { id, code, name } = data;

                if (code !== this.code) {
                    return;
                }

                if (!this.peers.some(x => x.name === name) && name) {
                    this.peers.push({ name, time: new Date() });
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

                const { id, code, name } = data;

                if (code !== this.code) {
                    return;
                }

                this.peers = this.peers.filter(x => x.name !== name);

                if (this.onPeerChanged) {
                    this.onPeerChanged();
                }
            });

            socketConnection.on('message', async (message) => {
                const data = JSON.parse(message);

                if (!data) {
                    return;
                }

                const { message_type, content, name } = data;
                try {
                    if (message_type === this.MESSAGE_TYPE.JOIN_RES && content) {
                        const { id, code, name } = content;
                        this.code = code;
                        this.name = name;
                        if (this.onConnected)
                            this.onConnected();
                    } else if (message_type === this.MESSAGE_TYPE.CANDIDATE && content) {
                        await this.peerConnection.addIceCandidate(content);
                    } else if (message_type === this.MESSAGE_TYPE.SDP) {
                        if (content.type === 'offer') {
                            await this.peerConnection.setRemoteDescription(content);
                            const answer = await this.peerConnection.createAnswer();
                            await this.peerConnection.setLocalDescription(answer);
                            this.sendMessage({
                                message_type: this.MESSAGE_TYPE.SDP,
                                content: answer,
                            });
                        } else if (content.type === 'answer') {
                            await this.peerConnection.setRemoteDescription(content);
                        } else {
                            console.log('Unsupported SDP type.');
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            socketConnection.on('connect', () => {
                resolve();
                this.sendMessage({
                    message_type: this.MESSAGE_TYPE.JOIN_REQ,
                    content: {}
                })
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

    sendMessage = (message) => {
        this.socketConnection.emit('message', JSON.stringify({
            ...message,
            code: this.code,
            name: this.name
        }));
    }

    createAndSendOffer = async () => {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.sendMessage({
            message_type: this.MESSAGE_TYPE.SDP,
            content: offer,
        });
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
