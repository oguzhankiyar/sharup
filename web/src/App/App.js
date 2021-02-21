import { Component, createRef } from 'react';
import { Connector } from '../common/connector';
import QRCode from '../common/qrcode';
import { Header } from './Header/Header';

import './App.css';

export default class App extends Component {

    state = { isConnected: false, code: '', name: '', isPeersShowing: true, isFilesShowing: false, peers: [], files: [] };
    inputFile = createRef();

    connector = null;

    startConnection = async () => {
        this.connector = new Connector();

        this.connector.onConnected = () => {
            this.setState({
                ...this.state,
                isConnected: this.connector.isConnected,
                code: this.connector.code,
                name: this.connector.name
            });

            location.hash = this.connector.code.toUpperCase();
        }

        this.connector.onPeerChanged = () => {
            this.setState({
                ...this.state,
                peers: this.connector.peers
            });
        }

        this.connector.onFileChanged = () => {
            this.setState({
                ...this.state,
                files: this.connector.files
            });
        }

        await this.connector.startConnection(this.state.code, this.state.name);
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

    componentDidMount = () => {
        if (location.hash) {
            const hash = location.hash.substring(1).toUpperCase();
            if (hash.length === 8) {
                this.setState({ ...this.state, code: hash }, () => {
                    this.startConnection();
                });
            }
        } else {
            this.startConnection();
        }
    };

    render() {
        const svg = !this.state.code || this.state.code.length === 0 ? '<div style="display: table; margin: 90px 60.5px;">QR Code</div>' : new QRCode({
            content: this.state.code,
            padding: 0,
            width: 210,
            height: 210,
            color: "#c5c5c5",
            background: "#292C35",
            ecl: "H",
        }).svg();

        return (
            <div className="App">
                <Header />
                <div className="container">
                    <div className="left">
                        <div className="qr">
                            <div dangerouslySetInnerHTML={{ __html: svg }} />
                        </div>
                        <div className="form">
                            <div style={this.state.isConnected ? { display: 'block' } : { display: 'none' }}>
                                <span className="label">Code</span>
                                <input className="code" value={this.state.code} disabled />
                                <span className="label">Name</span>
                                <input className="name" value={this.state.name} disabled />
                                <div>
                                    <input type="file" ref={this.inputFile} onChange={(event) => this.shareFile(event.target.files[0])} style={{ display: 'none' }} />
                                    <button type="submit" className="add" onClick={() => this.inputFile.current.click()}>Add File</button>
                                </div>
                            </div>
                            <div style={this.state.isConnected ? { display: 'none' } : { display: 'block' }}>
                                <span className="label">Code</span>
                                <input className="code" value={this.state.code} onChange={this.onCodeChange} onKeyPress={(event) => { if (event.key === 'Enter') this.startConnection(); }} autoComplete="none" maxLength="8" />
                                <span className="label">Name</span>
                                <input className="name" value={this.state.name} onChange={this.onNameChange} onKeyPress={(event) => { if (event.key === 'Enter') this.startConnection(); }} autoComplete="none" />
                                <div>
                                    <button type="submit" className="start" disabled={!this.state.code || !this.state.name} onClick={this.startConnection}>Start</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="tabs">
                            <div onClick={() => this.showPeers()} className={this.state.isPeersShowing ? 'tab active' : 'tab'} style={{ display: 'inline-table', marginRight: 10 }}>Peers{this.state.peers.length > 0 ? ' (' + this.state.peers.length + ')' : ''}</div>
                            <div onClick={() => this.showFiles()} className={this.state.isFilesShowing ? 'tab active' : 'tab'} style={{ display: 'inline-table', marginRight: 10 }}>Files{this.state.files.length > 0 ? ' (' + this.state.files.length + ')' : ''}</div>
                        </div>
                        <div className="content">
                            {
                                this.state.isPeersShowing
                                    ?
                                        this.state.peers.length > 0
                                        ?
                                            this.state.peers.map((value, index) => {
                                                return (
                                                    <div className="peer" key={index}>
                                                        <div className="name">{value.name}</div>
                                                        <div className="info">at <div className="time">{
                                                            ("0" + new Date(value.time).getHours()).slice(-2) + ":" +
                                                            ("0" + new Date(value.time).getMinutes()).slice(-2) + ":" +
                                                            ("0" + new Date(value.time).getSeconds()).slice(-2)
                                                        }</div></div>
                                                    </div>
                                                )
                                            })
                                        :                                
                                        <div className="warning">There is no peers to show</div>
                                    :
                                    <></>
                            }
                            {
                                this.state.isFilesShowing
                                ?
                                    this.state.files.length > 0
                                        ?
                                        this.state.files.map((value, index) => {
                                            return (
                                                <div className="file" key={index} onClick={() => this.onFileDownload(value)}>
                                                    <div className="name">{value.name}</div>
                                                    <div className="info">at <div className="time">{
                                                        ("0" + new Date(value.time).getHours()).slice(-2) + ":" +
                                                        ("0" + new Date(value.time).getMinutes()).slice(-2) + ":" +
                                                        ("0" + new Date(value.time).getSeconds()).slice(-2)
                                                    }</div> by <div className="owner">{value.owner.name}</div></div>
                                                </div>
                                            )
                                        })
                                        :
                                        <div className="warning">There is no files to show</div>
                                :
                                <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}