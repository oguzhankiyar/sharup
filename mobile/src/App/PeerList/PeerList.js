import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import { PeerItem } from './PeerItem/PeerItem';

export class PeerList extends Component {
    render = () => {
        if (this.props.show === false || !this.props.items) {
            return (<></>);
        }

        return (
            <View style={styles.peerList}>
                {
                    this.props.items.length > 0
                        ? this.props.items.sort((x, y) => x.time - y.time).map((value, index) => <PeerItem value={value} key={index} />)
                        : <Text style={styles.warning}>There is no peers to show</Text>
                }
            </View>
        );
    };
}

const styles = StyleSheet.create({ 
	peerList: {
        
    },
    warning: {
        color: '#f5f5f5',
        opacity: .25,
        textAlign: 'center',
        marginTop: 40,
        fontSize: 15
    }
});