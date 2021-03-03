import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import RNFS from 'react-native-fs';

export class FileButton extends Component {

    onSelect = async () => {
        const selection = await DocumentPicker.getDocumentAsync({});
        if (selection.type !== 'success') {
            return;
        }

        const fileString = await RNFS.readFile(selection.uri, 'base64');
        const fileContent = this.decode(fileString);

        this.props.onSelect({
            name: selection.name,
            content: fileContent
        });
    };

    decode = (base64) => {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        var lookup = new Uint8Array(256);
        for (var i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }

        var bufferLength = base64.length * 0.75,
            len = base64.length, i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return bytes;
    };

    render = () => {
        return (
            <View style={styles.fileButton}>
                <TouchableOpacity style={styles.add} onPress={() => { this.onSelect(); }}>
                    <Text style={styles.addText}>Add File</Text>
                </TouchableOpacity>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    fileButton: {

    },
    add: {
        backgroundColor: '#3dbe68',
        marginTop: 10,
        paddingTop: 7,
        paddingBottom: 7,
        borderRadius: 5
    },
    addText: {
        fontSize: 17.5,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        color: '#fff'
    }
});