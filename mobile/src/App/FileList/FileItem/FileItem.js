import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

export class FileItem extends Component {
    render = () => {
        if (!this.props.value) {
            return (<></>);
        }
        
        return (
            <View style={styles.fileItem}>
                <TouchableOpacity style={styles.file} onPress={() => this.props.onDownload(this.props.value)}>
                    <View style={styles.top}>
                        <Text style={styles.name}>{this.props.value.name}</Text>
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
                        <Text style={styles.info}>by</Text>
                        <Text style={styles.owner}>{this.props.value.owner.name}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };
}

const styles = StyleSheet.create({ 
	fileItem: {
    
    },
    file: {
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
        opacity: .75,
        fontFamily: 'Montserrat-Regular'
    },
    name: {
		color: '#f5f5f5',
        fontSize: 17.5,
        fontFamily: 'Montserrat-Regular'
    },
    info: {
		color: '#888',
        fontSize: 15,
        fontFamily: 'Montserrat-Regular'
    },
    time: {
		color: '#c5c5c5',
        marginLeft: 5,
        marginRight: 5,
        fontSize: 15,
        fontFamily: 'Montserrat-Regular'
    },
    owner: {
		color: '#c5c5c5',
        marginLeft: 5,
        fontSize: 15,
        fontFamily: 'Montserrat-Regular'
    }
});