import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { Connector } from '../common/connector';
import { QRImage } from './QRImage/QRImage';

export default class App extends Component {

  state = { code: 'OGUZHAN7', isConnected: false, receivedFiles: [], sentFiles: [] };

  connector = null;

  componentDidMount() {
  }

  startConnection = () => {
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

    this.connector.startConnection('OGUZHAN7');
  };

  shareFile() {
    alert('sharing');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SharUp!</Text>
        <QRImage code={this.state.code}></QRImage>
        <TextInput style={{ backgroundColor: '#f5f5f5', color: '#363636', width: 200, fontSize: 20, fontWeight: '900', padding: 7.5, paddingLeft: 10, paddingRight: 10, letterSpacing: 10, borderRadius: 5, marginBottom: 20 }}>{this.state.code}</TextInput>
        { this.state.isConnected === true ? <></> : <Button onPress={this.startConnection} title={'START CONNECTION'} style={{ width: 200 }}></Button> }
        {
          this.state.isConnected === true
            ? <>
                <Button onPress={this.shareFile} title={'ADD NEW FILE'} style={{ width: 200 }}></Button>
              </>
            : <></>
        }        
        <Text style={{ color: '#f5f5f5', marginTop: 50 }}>{JSON.stringify(this.state, null, 2)}</Text>
        <StatusBar style="light" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363636',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 75
  },
  title: {
    color: '#f5f5f5',
    fontSize: 25
  }
});
