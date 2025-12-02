import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { navigate } from "../../navigation/refglobal-navigation";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import ModalVerificacion from "../../auth/inputs";
import { validarCamposRegistro } from "../../auth/validaciones";
import { crearPerfil } from "../../api/services/perfil-service";


const RegisterForm: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const route = useRoute<any>();
  const { municipioId, municipioDesc } = route.params || {};

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };
    const handleRegister = () => {
    const error = validarCamposRegistro({
      email,
      nombre,
      apellido,
      telefono,
      dni,
      password,
      fecha: date,
    });

    if (error) {
      Alert.alert("Validación", error);
      return;
    }

    setShowModal(true);
  };

const handleConfirmar = async () => {
  setShowModal(false);

  try {
    const payload = {
      email: email,
      nombre,
      apellido,
      dni,
      telefono,
      password,
      fecha_nacimiento: date.toISOString().split("T")[0],
      idmunicipio: municipioId,
    };

    const response = await crearPerfil(payload);

    if (!response.success) {
      Alert.alert("Error", response.message);
      return;
    }

    Alert.alert("Éxito", "Usuario registrado correctamente", [
      { text: "OK", onPress: () => navigate("Home") },
    ]);
  } catch (error) {
    console.error("❌ Error en handleConfirmar:", error);
    Alert.alert("Error", "Ocurrió un problema al registrar el usuario");
  }
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
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registro</Text>

            {/* Correo */}
            <Text>Correo Electrónico</Text>
            <View style={styles.input}>
              <Ionicons name="mail-outline" size={20} color="#000" />
              <TextInput
                placeholder="Correo electrónico"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{ flex: 1 }}
              />
            </View>

            {/* Nombre */}
            <Text>Nombre Completo</Text>
            <View style={styles.input}>
              <Ionicons name="person-outline" size={20} color="#000" />
              <TextInput
                placeholder="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                style={{ flex: 1 }}
                maxLength={40}
              />
            </View>
            {/* Apellido */}
            <Text>Apellido</Text>
            <View style={styles.input}>
              <Ionicons name="person-outline" size={20} color="#000" />
              <TextInput
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
                style={{ flex: 1 }}
                maxLength={80}
              />
            </View>
            {/* DNI */}
            <Text>DNI(sin espacios ni guiones)</Text>
            <View style={styles.input}>
              <Ionicons name="card-outline" size={20} color="#000" />
              <TextInput
                placeholder="Número de documento"
                keyboardType="numeric"
                value={dni}
                onChangeText={setDni}
                style={{ flex: 1 }}
                maxLength={9}
              />
            </View>

            {/* Teléfono */}
            <Text>Número de teléfono (ej: +5493764994231)</Text>
            <View style={styles.input}>
              <Ionicons name="call-outline" size={20} color="#000" />
              <TextInput
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={setTelefono}
                style={{ flex: 1 }}
                maxLength={15}
              />
            </View>

            {/* Fecha */}
            <Text>Fecha de Nacimiento</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.dateInputContainer}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#000000ff"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {date.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChange}
                maximumDate={new Date()}
              />
            )}

            {/* Contraseña */}
            <Text>Contraseña (max 12 letras)</Text>
            <View style={styles.input}>
              <Ionicons name="lock-closed-outline" size={20} color="#000" />
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ flex: 1 }}
                maxLength={12}
              />
            </View>

            {/* Botones */}
            <TouchableOpacity style={styles.boton} onPress={handleRegister}>
              <Text style={styles.botonTexto}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boton}
              onPress={() => navigate("Home")}
            >
              <Text style={styles.botonTexto}>Volver al Home</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal */}
        <ModalVerificacion
          visible={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmar}
          datos={{
            email,
            password,
            nombre,
            apellido,
            telefono,
            fecha: date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            municipioId,
            municipioDesc,
            dni,
          }}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", margin: 10 },
  formContainer: {
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#005C41",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 25,
    gap: 10,
    padding: 5,
    marginBottom: 15,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  dateText: { flex: 1, fontSize: 16, color: "#333" },
  calendarIcon: { marginLeft: 4, marginRight: 8 },
  boton: {
    backgroundColor: "#2e7040",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  botonTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});
