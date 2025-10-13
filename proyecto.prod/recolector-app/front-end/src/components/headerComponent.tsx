import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { handleLogout } from "../utils/logout-util";

type Notificacion = {
    titulo: string;
    mensaje: string;
};

interface HeaderRecolectorProps {
    notificaciones?: Notificacion[];
    nombreUsuario?: string;
}

const HeaderRecolector: React.FC<HeaderRecolectorProps> = () => {
    const navigation = useNavigation<any>();

    const abrirDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerItem}>
                    <TouchableOpacity onPress={abrirDrawer}>
                        <Ionicons name="menu" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/logos/logo-2.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.headerItem}>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default HeaderRecolector;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        paddingTop: 40,
        paddingBottom: 15,
        paddingHorizontal: 20,
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "green",
        borderRadius: 20,
        backgroundColor: "transparent",
    },
    headerItem: {
        padding: 10,
        borderRadius: 100,
        backgroundColor: "#307043",
    },
    logoContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 220,
        height: 90,
    },
});
