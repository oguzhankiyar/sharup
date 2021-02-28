import { Component } from 'react';
import { Connector } from '../common/connector';

import { Header } from './Header/Header';
import { Home } from './Home/Home';
import { QRImage } from './QRImage/QRImage';
import { PeerList } from './PeerList/PeerList';
import { FileList } from './FileList/FileList';
import { FileButton } from './FileButton/FileButton';

import './App.css';

export default class App extends Component {

    state = { isConnected: false, code: '', name: '', isPeersShowing: true, isFilesShowing: false, peers: [], files: [] };

    connector = null;

    startConnection = async (code, name) => {
        this.connector = new Connector();

        this.connector.onConnected = () => {
            this.setState({
                ...this.state,
                isConnected: this.connector.isConnected,
                code: this.connector.code,
                name: this.connector.name
            });

            location.hash = this.connector.code.toUpperCase();
        };

        this.connector.onFailed = (error) => {
            alert(error);
            this.setState({ ...this.state, isConnected: false });
            location.hash = '';
        }

        this.connector.onPeerChanged = () => {
            this.setState({
                ...this.state,
                peers: this.connector.peers
            });
        };

        this.connector.onFileChanged = () => {
            this.setState({
                ...this.state,
                files: this.connector.files
            });
        };

        await this.connector.startConnection(code, name);
    };

    shareFile = async (file) => {
        if (!this.connector) {
            return;
        }

        const name = file.name;
        const content = await file.arrayBuffer();

        this.connector.shareFile(name, content);
    };

    onCodeChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, code: value.toUpperCase() });
    };

    onNameChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, name: value.toUpperCase() });
    };

    onFileDownload = (file) => {
        this.connector.downloadFile(file);
    }

    showPeers() {
        this.setState({ ...this.state, isPeersShowing: true, isFilesShowing: false });
    }

    showFiles() {
        this.setState({ ...this.state, isPeersShowing: false, isFilesShowing: true });
    }

    onCreate = () => {
        this.startConnection('', '');
    };

    onJoin = (code) => {
        this.startConnection(code, '');
    };

    componentDidMount = () => {
        if (location.hash) {
            const hash = location.hash.substring(1).toUpperCase();
            if (hash.length === 8) {
                setTimeout(() => {
                    this.startConnection(hash, '');
                }, 500);
            } else {
                location.hash = '';
            }
        }
    };

    render = () => {
        if (!this.state.isConnected) {
            return (
                <div className="App">
                    <Header />
                    <div className="container">
                        <Home
                            onCreate={() => this.onCreate()}
                            onJoin={(code) => this.onJoin(code)} />
                    </div>
                </div>
            );
        }

        return (
            <div className="App">
                <Header />
                <div className="container">
                    <div className="left">
                        <div className="qr">
                            <QRImage code={this.state.code} />
                        </div>
                        <div className="form">
                            <div>
                                <span className="label">Code</span>
                                <input className="code" value={this.state.code} disabled />
                                <span className="label">Name</span>
                                <input className="name" value={this.state.name} disabled />
                                <FileButton onSelect={(file => this.shareFile(file))} />
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="tabs">
                            <div
                                className={this.state.isPeersShowing ? 'tab active' : 'tab'}
                                onClick={() => this.showPeers()}>
                                Peers
                                    {
                                    this.state.peers.length > 0 ? <span className="label">{this.state.peers.length}</span> : <></>
                                }
                            </div>
                            <div
                                className={this.state.isFilesShowing ? 'tab active' : 'tab'}
                                onClick={() => this.showFiles()}>
                                Files
                                    {
                                    this.state.files.length > 0 ? <span className="label">{this.state.files.length}</span> : <></>
                                }
                            </div>
                        </div>
                        <div className="content">
                            <PeerList
                                items={this.state.peers}
                                show={this.state.isPeersShowing} />
                            <FileList
                                items={this.state.files}
                                show={this.state.isFilesShowing}
                                onDownload={file => this.onFileDownload(file)} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}