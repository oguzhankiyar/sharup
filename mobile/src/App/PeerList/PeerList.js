import React, { Component } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { PeerItem } from './PeerItem/PeerItem';

export class PeerList extends Component {
    render = () => {
        if (this.props.show === false || !this.props.items) {
            return (<></>);
        }

        return (
            <ScrollView>
                <View style={styles.peerList}>
                    {
                        this.props.items.length > 0
                            ? this.props.items.sort((x, y) => x.time - y.time).map((value, index) => <PeerItem value={value} key={index} />)
                            : <Text style={styles.warning}>There is no peers to show</Text>
                    }
                </View>
            </ScrollView>
        );
    };
}

const styles = StyleSheet.create({ 
	peerList: {
        marginBottom: 40
    },
    warning: {
        color: '#f5f5f5',
        opacity: .25,
        textAlign: 'center',
        marginTop: 40,
        fontSize: 15,
        fontFamily: 'Montserrat-Regular'
    }
});