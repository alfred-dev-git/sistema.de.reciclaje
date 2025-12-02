import React from 'react'
import { ImageBackground, StyleSheet } from 'react-native'

interface Props {
    children: React.ReactNode;
}


const BackgorundContainer: React.FC<Props> = ({ children }) => (
    <ImageBackground
        source={require('../../assets/background/bg-dashboard.png')}
        style={styles.background}
        resizeMode='cover'
    >
        {children}
    </ImageBackground>
)


const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
})


export default BackgorundContainer
