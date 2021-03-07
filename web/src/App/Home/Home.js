import { Component } from 'react';

import './Home.css';

export class Home extends Component {
    state = { code: '', showJoin: false };

    showJoin = () => {
        this.setState({ ...this.state, showJoin: true });
    };

    onCodeChange = () => {
        const { value } = event.target;
        this.setState({ ...this.state, code: value.toUpperCase() });
    };

    render = () => {
        return (
            <div className="Home">
                <div className="title">Sharup everything!</div>
                <div className="description">
                    no cable<br />
                    no login<br />
                    no storage
                </div>
                {
                    this.state.showJoin
                        ?
                        <div>
                            <input className="code" placeholder="Code" value={this.state.code} onChange={this.onCodeChange} onKeyPress={(event) => { if (event.key === 'Enter' && this.state.code && this.state.code.length === 8) this.props.onJoin(this.state.code); }} autoComplete="none" maxLength="8" />
                            <button className="join large" onClick={() => this.props.onJoin(this.state.code)} disabled={!this.state.code || this.state.code.length !== 8}>Join</button>
                        </div>
                        :
                        <div className="action">
                            let's
                            <button className="create" onClick={() => this.props.onCreate()}>Create</button>
                            or
                            <button className="join" onClick={() => this.showJoin()}>Join</button>
                            room
                        </div>
                }

            </div>
        );
    };
}