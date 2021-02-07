import React, { Component } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import QRCode from './common/qrcode';

export default class App extends Component {

    render() {
        var code = this.props.code;

        const svg = new QRCode({
            content: code,
            width: 256,
            height: 256,
            color: "#f5f5f5",
            background: "#363636",
            ecl: "H",
        }).svg();

        return (
            <View style={{ height: 256 }}>
                <WebView
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    style={{ height: 256, width: 256, resizeMode: 'cover', flex: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}
                    injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                    scalesPageToFit={false}
                    source={{ html: '<html><head><style>body { margin: 0 }</style></head><body>' + svg + '</body></html>' }} />
            </View>
        )
    }
}