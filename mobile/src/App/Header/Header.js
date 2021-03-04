import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native";

import Logo from '../../../assets/img/sharup.svg';
import GitHub from '../../../assets/img/github.svg';

export class Header extends Component {
    render() {
        return (
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Logo width="35" height="35" />
                </View>
                <Text style={styles.title}>Sharup</Text>
                <View style={styles.github}>
                    <TouchableOpacity onPress={() => Linking.openURL('https://github.com/oguzhankiyar/sharup')}>
                        <GitHub width="35" height="35" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({ 
	header: {
        padding: 10,
        backgroundColor: '#9b7b1b',
        flexDirection: 'row',
        height: 55
    },
    title: {
        fontSize: 25,
        fontFamily: 'Montserrat-Regular',
        color: '#f5f5f5',
        flex: 1
    },
    logo: {
        width: 35,
        marginRight: 10
    },
    github: {
        width: 35
    }
});