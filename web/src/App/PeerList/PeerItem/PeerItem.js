import { Component } from "react";

import './PeerItem.css';

export class PeerItem extends Component {
    render = () => {
        if (!this.props.value) {
            return (<></>);
        }

        return (
            <div className="PeerItem">
                <div className="peer">
                    {this.props.value.me ? <div className="label">me</div> : <></>}
                    <div className="name">{this.props.value.name}</div>
                    <div className="info">at <div className="time">{
                        ("0" + new Date(this.props.value.time).getHours()).slice(-2) + ":" +
                        ("0" + new Date(this.props.value.time).getMinutes()).slice(-2) + ":" +
                        ("0" + new Date(this.props.value.time).getSeconds()).slice(-2)
                    }</div></div>
                </div>
            </div>
        );
    };
}