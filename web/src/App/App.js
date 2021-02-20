import { Component, createRef } from 'react';
import { Connector } from '../common/connector';
import QRCode from '../common/qrcode';
import { Header } from './Header/Header';

import './App.css';

export default class App extends Component {

    state = { isConnected: false, code: '', name: '', peers: [], files: [] };
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

    shareFile = (file) => {
        if (!this.connector) return;

        this.connector.shareFile(file);
    };

    onCodeChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, code: value.toUpperCase() });
    };

    onNameChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, name: value.toUpperCase() });
    };

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
            background: "#363636",
            ecl: "H",
        }).svg();

        return (
            <div className="App">
                <Header />
                <div className="container">
                    <div style={{ float: 'left', marginLeft: 12.5, marginRight: 12.5 }}>
                        <div dangerouslySetInnerHTML={{ __html: svg }} />
                    </div>
                    <div style={{ float: 'left', marginLeft: 12.5, marginRight: 12.5 }}>
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
                            <br />
                            <span className="label">Name</span>
                            <input className="name" value={this.state.name} onChange={this.onNameChange} onKeyPress={(event) => { if (event.key === 'Enter') this.startConnection(); }} autoComplete="none" />
                            <div>
                                <button type="submit" className="start" disabled={!this.state.code || !this.state.name} onClick={this.startConnection}>Start</button>
                            </div>
                        </div>
                    </div>
                    <br />
                    <br />
                    <div style={{ display: 'table', clear: 'both', margin: 12.5, marginTop: 25 }}>
                        {
                            this.state.peers.length > 0 ? <div>Peers</div> : <></>
                        }
                        {
                            this.state.peers.map((value, index) => {
                                return (
                                    <div className="peer" key={index}>
                                        <div className="name">{value.name}</div>
                                    </div>
                                )
                            })
                        }
                        {
                            this.state.files.length > 0 ? <div>Files</div> : <></>
                        }
                        {
                            this.state.files.map((value, index) => {
                                return (
                                    <div className="file" key={index}>
                                        <div className="name">{value.name}</div>
                                        <div className="info">by <div className="owner">{value.owner}</div> at <div className="date">{
                                            ("0" + new Date(value.time).getDate()).slice(-2) + "." +
                                            ("0" + (new Date(value.time).getMonth() + 1)).slice(-2) + "." +
                                            ("000" + new Date(value.time).getFullYear()).slice(-4) + " " +
                                            ("0" + new Date(value.time).getHours()).slice(-2) + ":" +
                                            ("0" + new Date(value.time).getMinutes()).slice(-2) + ":" +
                                            ("0" + new Date(value.time).getSeconds()).slice(-2)
                                        }</div></div>
                                    </div>
                                )
                            })
                        }
                        {/* <pre>
                            {JSON.stringify(this.state, null, 2)}
                        </pre> */}
                    </div>
                </div>
            </div>
        );
    }
}