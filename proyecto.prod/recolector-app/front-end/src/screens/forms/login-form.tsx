import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { loginUsuario } from "../../api/services/login-service";
import { saveToken, saveUser } from "../../auth/auth";
import { navigate } from "../../navigation/refglobal-navigation";
import { verificarRol } from "../../utils/verificarRol";
import ModalMunicipio from "./municipio-select"; 

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMunicipioModal, setShowMunicipioModal] = useState(false); 
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<{ id: number; descripcion: string } | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor ingrese email y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUsuario(email, password);

      if (response.ok) {
        await saveToken(response.token);
        await saveUser(response.user);

        if (verificarRol(response.user)) {
          navigate("RecolectorNavigation" as any);
        } else {
          Alert.alert("Acceso denegado", "No tienes permisos para acceder.");
        }
      } else {
        Alert.alert("Error", response.mensaje || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("ERROR GENERAL:", error);
      Alert.alert(
        "Error inesperado",
        "Ocurrió un problema al intentar iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalMunicipio = () => {
    setShowMunicipioModal(true);
  };

  const handleMunicipioConfirmado = (municipio: { id: number; descripcion: string }) => {
    setMunicipioSeleccionado(municipio);
    setShowMunicipioModal(false);
    navigate("Register" as any, { municipioId: municipio.id, municipioDesc: municipio.descripcion });
  };

  return (
    <ImageBackground
      source={require("../../../assets/background/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View>
            <View style={{ alignItems: "center" }}>
              <Image
                source={require("../../../assets/logos/logo.png")}
                style={styles.logo}
              />
            </View>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Iniciar Sesión</Text>

              <TextInput
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                textContentType="emailAddress"
                editable={!loading}
              />
              <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                textContentType="password"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.boton, loading && styles.botonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.botonTexto}>
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.boton, styles.botonSecundario]}
                onPress={() => navigate("Home" as any)}
                disabled={loading}
              >
                <Text style={styles.botonTexto}>Ir al Home</Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>¿No tenés una cuenta? </Text>
                <TouchableOpacity onPress={handleAbrirModalMunicipio}>
                  <Text style={styles.registerLink}>Registrate</Text>
                </TouchableOpacity>

              <View style={[styles.registerContainer, { marginTop: 10 }]}>
                <Text style={styles.registerText}>¿Olvidaste tu contraseña? </Text>
                <TouchableOpacity onPress={() => navigate("Forgot" as any)}>
                  <Text style={styles.registerLink}>Recuperar</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de municipio */}
    <ModalMunicipio
      visible={showMunicipioModal}
      onCancel={() => setShowMunicipioModal(false)} // ✅ cambia onClose → onCancel
      onConfirm={handleMunicipioConfirmado}
    />

    </ImageBackground>
  );
};

export default LoginForm;

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
  }
  ,
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005C41',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  boton: {
    backgroundColor: '#2e7040',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonSecundario: {
    backgroundColor: '#137ce4ff',
    marginTop: 0,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  registerText: {
    color: '#333',
    fontSize: 15,
  },

  registerLink: {
    color: '#2e7040',
    fontWeight: 'bold',
    fontSize: 15,
  },

  botonTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonDisabled: {
    backgroundColor: '#005C41',
    opacity: 0.7,
  },
});
