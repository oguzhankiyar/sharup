import { Component } from "react";

import { PeerItem } from './PeerItem/PeerItem';

import './PeerList.css';

export class PeerList extends Component {
    props = { items: [], show: false };

    render = () => {
        if (this.props.show === false || !this.props.items) {
            return (<></>);
        }
        
        return (
            <div className="PeerList">
                {
                    this.props.items.length > 0
                        ? this.props.items.map((value, index) => <PeerItem value={value} key={index} />)
                        : <div className="warning">There is no peers to show</div>
                }
            </div>
        );
    };
}