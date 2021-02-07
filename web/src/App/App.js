import { Component, createRef } from 'react';
import { Connector } from '../common/connector';
import QRCode from '../common/qrcode';

import './App.css';

export default class App extends Component {

    state = { isConnected: false, code: '', sentFiles: [], receivedFiles: [] };
    inputFile = createRef();

    connector = null;

    startConnection = async () => {
        if (!this.state.code || this.state.code.length !== 8) {
            return;
        }

        this.connector = new Connector();

        this.connector.onConnected = () => {
            this.setState({
                ...this.state,
                isConnected: this.connector.isConnected
            });
        }

        this.connector.onFileReceived = () => {
            this.setState({
                ...this.state,
                receivedFiles: this.connector.receivedFiles
            });
        }
        
        this.connector.onFileSent = () => {
            this.setState({
                ...this.state,
                sentFiles: this.connector.sentFiles
            });
        }

        await this.connector.startConnection(this.state.code);
        
        location.hash = this.state.code;
    };

    shareFile = (file) => {
        if (!this.connector) return;
        
        this.connector.shareFile(file);
    };

    identify = () => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        result = result.toUpperCase();

        this.setState({ ...this.state, code: result });
        location.hash = result;
    };

    onCodeChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, code: value.toUpperCase() });
        location.hash = value.toUpperCase();
    };

    componentDidMount = () => {
        if (location.hash) {
            const hash = location.hash.substring(1).toUpperCase();
            if (hash.length === 8) {
                this.setState({ ...this.state, code: hash });
            }
        } else {
            this.identify();
        }
    };

    render() {
        const svg = !this.state.code || this.state.code.length === 0 ? '' : new QRCode({
            content: this.state.code,
            width: 300,
            height: 300,
            color: "#f5f5f5",
            background: "#363636",
            ecl: "H",
        }).svg();

        return (
            <div className="App">
                SharUp!
                <br />
                {
                    !this.state.code
                        ? <></>
                        : <div dangerouslySetInnerHTML={{ __html: svg }} />
                }

                <div style={this.state.isConnected ? { display: 'block' } : { display: 'none' }}>
                    <input value={this.state.code} disabled />
                    <input type="file" ref={this.inputFile} onChange={(event) => this.shareFile(event.target.files[0])} style={{ display: 'none' }} />
                    <button id="add-button" onClick={() => this.inputFile.current.click()}>Add New File</button>
                </div>
                <div style={this.state.isConnected ? { display: 'none' } : { display: 'block' }}>
                    <input value={this.state.code} onChange={this.onCodeChange} autoComplete="off" maxLength="8" />
                    <button onClick={this.startConnection}>Start Connection</button>
                </div>
                <br />
                <br />
                <pre>{JSON.stringify(this.state, null, 2)}</pre>
            </div>
        );
    }
}