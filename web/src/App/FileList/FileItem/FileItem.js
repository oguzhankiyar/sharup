import { Component } from "react";

import './FileItem.css';

export class FileItem extends Component {
    render = () => {
        if (!this.props.value) {
            return (<></>);
        }

        return (
            <div className="FileItem">
                <div className="file" onClick={() => this.props.onDownload(this.props.value)}>
                    <div className="name">{this.props.value.name}</div>
                    <div className="info">at <div className="time">{
                        ("0" + new Date(this.props.value.time).getHours()).slice(-2) + ":" +
                        ("0" + new Date(this.props.value.time).getMinutes()).slice(-2) + ":" +
                        ("0" + new Date(this.props.value.time).getSeconds()).slice(-2)
                    }</div> by <div className="owner">{this.props.value.owner.name}</div></div>
                </div>
            </div>
        );
    };
}