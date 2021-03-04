import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { QRScanner } from '../QRScanner/QRScanner';

export class Home extends Component {
    state = { code: '', showJoin: false };

    showJoin = () => {
        this.setState({ ...this.state, showJoin: true });
    };

    onCodeChange = (event) => {
        const { text } = event.nativeEvent;
        this.setState({ ...this.state, code: text.toUpperCase() });
    };

    render = () => {
        return (
            <View style={styles.home}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Sharup</Text>
                    <Text style={styles.title}>everything!</Text>
                </View>
                <Text style={styles.description}>no cable, no login, no storage</Text>
                {
                    this.state.showJoin
                        ?
                        <View style={styles.qrScannerContainer}>
                            <QRScanner onSuccess={(code) => this.setState({ code })} style={styles.qrScanner} />
                            <View style={styles.codeContainer}>
                                <TextInput autoCorrect={false} spellCheck={false} style={styles.codeInput} placeholder="C O D E" value={this.state.code} onChange={this.onCodeChange} onKeyPress={(event) => { if (event.key === 'Enter' && this.state.code && this.state.code.length === 8) this.props.onJoin(this.state.code); }} autoComplete="none" maxLength={8} />
                                <View>
                                    <TouchableOpacity disabled={!this.state.code || this.state.code.length !== 8} onPress={() => this.props.onJoin(this.state.code)} style={{ ...styles.button, marginRight: 0 }}>
                                        <Text style={styles.buttonText}>Join</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        :
                        <View style={styles.action}>
                            <Text style={styles.actionText}>let's</Text>
                            <View>
                                <TouchableOpacity onPress={() => this.props.onCreate()} style={styles.button}>
                                    <Text style={styles.buttonText}>Create</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.actionText}>or</Text>
                            <View>
                                <TouchableOpacity onPress={() => this.showJoin()} style={styles.button}>
                                    <Text style={styles.buttonText}>Join</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.actionText}>room</Text>
                        </View>
                }
            </View>
        );
    };
}

const styles = StyleSheet.create({
    home: {
        flex: 1,
        marginTop: 60
    },
    titleContainer: {
        marginBottom: 25
    },
    title: {
        fontSize: 50,
        fontFamily: 'Montserrat-Regular',
        color: '#d3a722'
    },
    description: {
        fontSize: 25,
        fontFamily: 'Montserrat-Regular',
        color: '#ccc',
        marginBottom: 75
    },
    action: {
        flexDirection: 'row'
    },
    actionText: {
        color: '#f5f5f5',
        fontSize: 25,
        fontFamily: 'Montserrat-Regular'
    },
    button: {
        backgroundColor: '#9b7b1b',
        borderRadius: 5,
        paddingTop: 10,
        paddingRight: 15,
        paddingBottom: 10,
        paddingLeft: 15,
        marginTop: -5,
        marginLeft: 10,
        marginRight: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Montserrat-Regular',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    qrScannerContainer: {
        flex: 1,
        marginTop: -50
    },
    qrScanner: {
        borderRadius: 10,
        marginBottom: 25
    },
    codeContainer: {
        flexDirection: 'row'
    },
    codeInput: {
        flex: 1,
        backgroundColor: '#d5d5d5',
        color: '#363636',
        borderRadius: 5,
        marginTop: -5,
        marginBottom: 10,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 10,
        fontSize: 20
    }
});