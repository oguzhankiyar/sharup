import { Component } from 'react';

import QRCode from '../../common/qrcode';

import './QRImage.css';

export class QRImage extends Component {
    render = () => {
        if (!this.props.code || this.props.code.length === 0) {
            return (
                <div className="QRImage">
                    <div className="empty">QR Code</div>
                </div>);
        }

        const svg = new QRCode({
            content: this.props.code,
            padding: 0,
            width: this.props.width || 210,
            height: this.props.height || 210,
            color: this.props.color || '#c5c5c5',
            background: this.props.background || 'transparent',
            ecl: this.props.ecl || 'H',
        }).svg();

        return (
            <div className="QRImage">
                <div dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
        );
    };
}