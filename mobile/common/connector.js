import { RTCPeerConnection } from 'react-native-webrtc';

export class Connector {

    onFileReceived = () => { };
    onFileSent = () => { };
    onConnected = () => { };

    isConnected = false;
    code = null;
    peerConnection = null;
    socketConnection = null;
    sentFiles = [];
    receivedFiles = [];

    MESSAGE_TYPE = { SDP: 'SDP', CANDIDATE: 'CANDIDATE' };
    MAXIMUM_MESSAGE_SIZE = 65535;
    END_OF_FILE_MESSAGE = 'EOF';

    startConnection = async (code) => {
        this.code = code;

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

            const receivedBuffers = [];
            channel.onmessage = async (event) => {
                const { data } = event;
                try {
                    if (data !== this.END_OF_FILE_MESSAGE) {
                        receivedBuffers.push(data);
                    } else {
                        const arrayBuffer = receivedBuffers.reduce((acc, arrayBuffer) => {
                            const tmp = new Uint8Array(acc.byteLength + arrayBuffer.byteLength);
                            tmp.set(new Uint8Array(acc), 0);
                            tmp.set(new Uint8Array(arrayBuffer), acc.byteLength);
                            return tmp;
                        }, new Uint8Array());
                        const blob = new Blob([arrayBuffer]);
                        this.downloadFile(blob, channel.label);
                        this.receivedFiles.push(channel.label);
                        if (this.onFileReceived)
                            this.onFileReceived();
                        channel.close();
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
            const socketConnection = new WebSocket('ws://127.0.0.1:2805');

            socketConnection.onmessage = async (message) => {
                const data = JSON.parse(message.data);

                if (!data) {
                    return;
                }

                const { message_type, content } = data;
                try {
                    if (message_type === this.MESSAGE_TYPE.CANDIDATE && content) {
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
            };

            socketConnection.onopen = () => {
                resolve();
            };

            socketConnection.onerror = () => {
                reject();
            };

            this.socketConnection = socketConnection;
        });

        return promise;
    }

    sendMessage = (message) => {
        if (this.code) {
            this.socketConnection.send(JSON.stringify({
                ...message,
                code: this.code,
            }));
        }
    }

    createAndSendOffer = async () => {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.sendMessage({
            message_type: this.MESSAGE_TYPE.SDP,
            content: offer,
        });
    }

    shareFile = (file) => {
        if (file) {
            const channelLabel = file.name;
            const channel = this.peerConnection.createDataChannel(channelLabel);
            channel.binaryType = 'arraybuffer';

            channel.onopen = async () => {
                const arrayBuffer = await file.arrayBuffer();
                for (let i = 0; i < arrayBuffer.byteLength; i += this.MAXIMUM_MESSAGE_SIZE) {
                    channel.send(arrayBuffer.slice(i, i + this.MAXIMUM_MESSAGE_SIZE));
                }
                channel.send(this.END_OF_FILE_MESSAGE);
            };

            channel.onclose = () => {
                this.sentFiles.push(channelLabel);
                if (this.onFileSent)
                    this.onFileSent();
            };
        }
    };

    downloadFile = (blob, fileName) => {
        // const a = document.createElement('a');
        // const url = window.URL.createObjectURL(blob);
        // a.href = url;
        // a.download = fileName;
        // a.click();
        // window.URL.revokeObjectURL(url);
        // a.remove()
    };
}
