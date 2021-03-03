import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";

export class PeerItem extends Component {
    render = () => {
        if (!this.props.value) {
            return (<></>);
        }

        return (
            <View style={styles.peerItem}>
                <View style={styles.peer}>
                    <View style={styles.top}>
                        <Text style={styles.name}>{this.props.value.name}</Text>
                        {this.props.value.me ? <Text style={styles.label}>me</Text> : <></>}
                    </View>
                    <View style={styles.bottom}>
                        <Text style={styles.info}>at</Text>
                        <Text style={styles.time}>
                            {
                                ("0" + new Date(this.props.value.time).getHours()).slice(-2) + ":" +
                                ("0" + new Date(this.props.value.time).getMinutes()).slice(-2) + ":" +
                                ("0" + new Date(this.props.value.time).getSeconds()).slice(-2)
                            }
                        </Text>
                    </View>
                </View>
            </View>
        );
    };
}

const styles = StyleSheet.create({ 
	peerItem: {

    },
    peer: {
        backgroundColor: '#3b3f4b',
        padding: 10,
        marginTop: 10,
        borderRadius: 5
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    bottom: {
        flexDirection: 'row'
    },
    label: {
        backgroundColor: '#9b7b1b',
		color: '#f5f5f5',
        borderRadius: 2.5,
        paddingVertical: 2,
        paddingHorizontal: 5,
        opacity: .75
    },
    name: {
		color: '#f5f5f5',
        fontSize: 17.5
    },
    info: {
		color: '#888',
        fontSize: 15
    },
    time: {
		color: '#c5c5c5',
        marginLeft: 5,
        fontSize: 15
    }
});