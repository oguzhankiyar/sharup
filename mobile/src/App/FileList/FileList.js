import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import { FileItem } from './FileItem/FileItem';

export class FileList extends Component {
    render = () => {
        if (this.props.show === false || !this.props.items) {
            return (<></>);
        }

        return (
            <View style={styles.fileList}>
                {
                    this.props.items.length > 0
                        ? this.props.items.sort((x, y) => x.time - y.time).map((value, index) => <FileItem value={value} onDownload={file => this.props.onDownload(file)} key={index} />)
                        : <Text style={styles.warning}>There is no files to show</Text>
                }
            </View>
        );
    };
}

const styles = StyleSheet.create({ 
	fileList: {

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