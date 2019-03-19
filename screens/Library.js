import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Library() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Library</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#191414'
    },
    header: {
        color: '#fff',
        fontSize: 34,
        fontWeight: 'bold'
    }
});