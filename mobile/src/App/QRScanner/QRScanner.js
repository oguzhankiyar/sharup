import React, { Component } from 'react';
import { RNCamera } from 'react-native-camera';
import { FillToAspectView } from '../FillToAspectView/FillToAspectView';

export class QRScanner extends Component {

    state = { code: '' };

    barcodeRecognized = ({ barcodes }) => {
        const qrCodes = barcodes.filter(x => x.type === 'QR_CODE');
        if (!!qrCodes && qrCodes.length > 0) {
            if (this.props.onSuccess) {
                const code = qrCodes[0].data;
                if (code && this.state.code !== code) {
                    this.props.onSuccess(qrCodes[0].data);
                    this.setState({ code });
                }
            }
        }
    };

    render = () => {
        return (
            <FillToAspectView style={{...this.props.style}}>
                <RNCamera
                    captureAudio={false}
                    showViewFinder={false}
                    onGoogleVisionBarcodesDetected={this.barcodeRecognized}
                    style={{ flex: 1 }}>
                </RNCamera>
            </FillToAspectView>
        );
    };
}