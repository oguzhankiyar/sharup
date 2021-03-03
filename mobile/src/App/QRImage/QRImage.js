import React, { Component } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import QRCode from '../../common/qrcode';

export class QRImage extends Component {

    render = () => {
        var code = this.props.code;

        if (!code || code.length === 0) {
            return (<></>);
        }

        const svg = new QRCode({
            content: this.props.code,
            padding: 0,
            width: this.props.width || 175,
            height: this.props.height || 175,
            color: this.props.color || '#c5c5c5',
            background: this.props.background || 'transparent',
            ecl: this.props.ecl || 'H',
        }).svg();
        
        return (
            <View>
                <SvgXml xml={svg} />
            </View>
        );
    };
}